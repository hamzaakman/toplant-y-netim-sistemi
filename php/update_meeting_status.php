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
    // JSON verisini al
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['meetingId']) || !isset($input['status'])) {
        sendJSONResponse(false, 'Toplantı ID ve durum gerekli');
    }
    
    $meetingId = (int)$input['meetingId'];
    $status = $input['status'];
    
    // Geçerli durumları kontrol et
    $validStatuses = ['aktif', 'iptal_edildi', 'tamamlandi'];
    if (!in_array($status, $validStatuses)) {
        sendJSONResponse(false, 'Geçersiz durum değeri');
    }
    
    // Veritabanı bağlantısı
    $pdo = getDBConnection();
    if (!$pdo) {
        sendJSONResponse(false, 'Veritabanı bağlantısı kurulamadı');
    }
    
    // Önce durum sütununun var olup olmadığını kontrol et
    $checkColumnQuery = "SHOW COLUMNS FROM toplantilar LIKE 'durum'";
    $stmt = $pdo->prepare($checkColumnQuery);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        // Durum sütunu yoksa ekle
        $addColumnQuery = "ALTER TABLE toplantilar ADD COLUMN durum ENUM('aktif', 'iptal_edildi', 'tamamlandi') DEFAULT 'aktif' AFTER olusturan_kisi_id";
        $pdo->exec($addColumnQuery);
    }
    
    // Toplantı durumunu güncelle
    $updateQuery = "UPDATE toplantilar SET durum = ? WHERE toplanti_id = ?";
    $stmt = $pdo->prepare($updateQuery);
    $stmt->execute([$status, $meetingId]);
    
    if ($stmt->rowCount() > 0) {
        // Güncelleme başarılı
        $message = '';
        switch ($status) {
            case 'iptal_edildi':
                $message = 'Toplantı başarıyla iptal edildi';
                break;
            case 'tamamlandi':
                $message = 'Toplantı tamamlandı olarak işaretlendi';
                break;
            case 'aktif':
                $message = 'Toplantı aktif olarak işaretlendi';
                break;
        }
        
        sendJSONResponse(true, $message, ['meetingId' => $meetingId, 'status' => $status]);
    } else {
        sendJSONResponse(false, 'Toplantı bulunamadı veya güncelleme yapılamadı');
    }
    
} catch (PDOException $e) {
    error_log("Veritabanı hatası: " . $e->getMessage());
    sendJSONResponse(false, 'Veritabanı işlemi sırasında hata oluştu');
} catch (Exception $e) {
    error_log("Genel hata: " . $e->getMessage());
    sendJSONResponse(false, $e->getMessage());
}

// JSON response gönder
function sendJSONResponse($success, $message, $data = null) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}
?>
