<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'error' => 'Sadece POST metodu desteklenir'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $pdo = getDBConnection();
    
    // POST verilerini al
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        $input = $_POST;
    }
    
    // Gerekli alanları kontrol et
    if (empty($input['ad_soyad']) || empty($input['e_posta']) || empty($input['telefon']) || empty($input['departman']) || empty($input['pozisyon'])) {
        echo json_encode([
            'success' => false,
            'error' => 'Ad soyad, e-posta, telefon, departman ve pozisyon alanları zorunludur'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    // E-posta formatını kontrol et
    if (!filter_var($input['e_posta'], FILTER_VALIDATE_EMAIL)) {
        echo json_encode([
            'success' => false,
            'error' => 'Geçerli bir e-posta adresi girin'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    // E-posta zaten var mı kontrol et
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM katilimcilar WHERE e_posta = ?");
    $stmt->execute([$input['e_posta']]);
    $existingCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    if ($existingCount > 0) {
        echo json_encode([
            'success' => false,
            'error' => 'Bu e-posta adresi zaten kullanılıyor'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    // Yeni katılımcıyı ekle
    $insertStmt = $pdo->prepare("
        INSERT INTO katilimcilar (ad_soyad, e_posta, telefon, departman, pozisyon, durum, kayit_tarihi) 
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    ");
    
    $result = $insertStmt->execute([
        $input['ad_soyad'],
        $input['e_posta'],
        $input['telefon'] ?? '',
        $input['departman'] ?? '',
        $input['pozisyon'] ?? '',
        $input['durum'] ?? 'aktif'
    ]);
    
    if ($result) {
        $newId = $pdo->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'message' => 'Katılımcı başarıyla eklendi',
            'data' => [
                'katilimci_id' => $newId,
                'ad_soyad' => $input['ad_soyad'],
                'e_posta' => $input['e_posta'],
                'telefon' => $input['telefon'] ?? '',
                'departman' => $input['departman'] ?? '',
                'pozisyon' => $input['pozisyon'] ?? '',
                'durum' => $input['durum'] ?? 'aktif',
                'kayit_tarihi' => date('Y-m-d H:i:s'),
                'toplantilar_sayisi' => 0,
                'son_topanti' => null
            ]
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Katılımcı eklenirken bir hata oluştu'
        ], JSON_UNESCAPED_UNICODE);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Veritabanı hatası: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
