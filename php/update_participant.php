<?php
require_once 'config.php';

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// OPTIONS request için
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Sadece POST request kabul et
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSONResponse(false, 'Sadece POST request kabul edilir');
}

try {
    // Debug log'ları ekle
    error_log("=== UPDATE PARTICIPANT DEBUG START ===");
    error_log("Request method: " . $_SERVER['REQUEST_METHOD']);
    
    // JSON verisini al
    $rawInput = file_get_contents('php://input');
    error_log("Raw input: " . $rawInput);
    
    $input = json_decode($rawInput, true);
    error_log("Decoded input: " . print_r($input, true));
    
    if (!isset($input['katilimci_id'])) {
        error_log("Error: katilimci_id missing");
        sendJSONResponse(false, 'Katılımcı ID gerekli');
    }
    
    $katilimci_id = (int)$input['katilimci_id'];
    $ad_soyad = $input['ad_soyad'] ?? '';
    $e_posta = $input['e_posta'] ?? '';
    $telefon = $input['telefon'] ?? '';
    $departman = $input['departman'] ?? '';
    $pozisyon = $input['pozisyon'] ?? '';
    $durum = $input['durum'] ?? 'aktif';
    
    error_log("Parsed values:");
    error_log("katilimci_id: " . $katilimci_id);
    error_log("ad_soyad: " . $ad_soyad);
    error_log("e_posta: " . $e_posta);
    error_log("telefon: " . $telefon);
    error_log("departman: " . $departman);
    error_log("pozisyon: " . $pozisyon);
    error_log("durum: " . $durum);
    
    // Validasyon
    if (empty($ad_soyad) || empty($e_posta) || empty($telefon) || empty($departman) || empty($pozisyon)) {
        error_log("Error: required fields empty");
        sendJSONResponse(false, 'Ad soyad, e-posta, telefon, departman ve pozisyon alanları zorunludur');
    }
    
    // E-posta formatını kontrol et
    if (!filter_var($e_posta, FILTER_VALIDATE_EMAIL)) {
        error_log("Error: invalid email format");
        sendJSONResponse(false, 'Geçerli bir e-posta adresi girin');
    }
    
    // Veritabanı bağlantısı
    error_log("Attempting database connection...");
    $pdo = getDBConnection();
    if (!$pdo) {
        error_log("Error: Database connection failed");
        sendJSONResponse(false, 'Veritabanı bağlantısı kurulamadı');
    }
    error_log("Database connection successful");
    
    // Aynı e-posta ile başka bir katılımcı var mı kontrol et (kendisi hariç)
    error_log("Checking email uniqueness...");
    $checkEmailQuery = "SELECT katilimci_id FROM katilimcilar WHERE e_posta = ? AND katilimci_id != ?";
    error_log("Email check query: " . $checkEmailQuery);
    error_log("Email check params: " . $e_posta . ", " . $katilimci_id);
    
    $stmt = $pdo->prepare($checkEmailQuery);
    $stmt->execute([$e_posta, $katilimci_id]);
    
    error_log("Email check result rows: " . $stmt->rowCount());
    
    if ($stmt->rowCount() > 0) {
        error_log("Error: Email already exists for another participant");
        sendJSONResponse(false, 'Bu e-posta adresi başka bir katılımcı tarafından kullanılıyor');
    }
    
    // Katılımcıyı güncelle
    error_log("Updating participant...");
    $updateQuery = "UPDATE katilimcilar SET 
                    ad_soyad = ?, 
                    e_posta = ?, 
                    telefon = ?, 
                    departman = ?, 
                    pozisyon = ?, 
                    durum = ? 
                    WHERE katilimci_id = ?";
    
    error_log("Update query: " . $updateQuery);
    error_log("Update params: " . print_r([$ad_soyad, $e_posta, $telefon, $departman, $pozisyon, $durum, $katilimci_id], true));
    
    $stmt = $pdo->prepare($updateQuery);
    $result = $stmt->execute([
        $ad_soyad,
        $e_posta,
        $telefon,
        $departman,
        $pozisyon,
        $durum,
        $katilimci_id
    ]);
    
    error_log("Update execute result: " . ($result ? 'true' : 'false'));
    error_log("Update affected rows: " . $stmt->rowCount());
    
    if ($stmt->rowCount() > 0) {
        error_log("Update successful, fetching updated participant...");
        // Güncellenmiş katılımcı bilgilerini getir
        $getUpdatedQuery = "SELECT katilimci_id, ad_soyad, e_posta, telefon, departman, pozisyon, durum, kayit_tarihi FROM katilimcilar WHERE katilimci_id = ?";
        $stmt = $pdo->prepare($getUpdatedQuery);
        $stmt->execute([$katilimci_id]);
        $updatedParticipant = $stmt->fetch(PDO::FETCH_ASSOC);
        
        error_log("Updated participant data: " . print_r($updatedParticipant, true));
        error_log("=== UPDATE PARTICIPANT DEBUG END (SUCCESS) ===");
        
        sendJSONResponse(true, 'Katılımcı başarıyla güncellendi', $updatedParticipant);
    } else {
        error_log("Error: No rows affected during update");
        error_log("=== UPDATE PARTICIPANT DEBUG END (FAILED) ===");
        sendJSONResponse(false, 'Katılımcı bulunamadı veya güncelleme yapılamadı');
    }
    
} catch (PDOException $e) {
    error_log("Veritabanı hatası: " . $e->getMessage());
    sendJSONResponse(false, 'Veritabanı işlemi sırasında hata oluştu');
} catch (Exception $e) {
    error_log("Genel hata: " . $e->getMessage());
    sendJSONResponse(false, $e->getMessage());
}
?>
