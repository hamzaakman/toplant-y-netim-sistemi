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
    
    if (!isset($input['participantId']) || !isset($input['status'])) {
        sendJSONResponse(false, 'Katılımcı ID ve durum gerekli');
    }
    
    $participantId = (int)$input['participantId'];
    $status = $input['status'];
    
    // Geçerli durumları kontrol et
    $validStatuses = ['aktif', 'pasif'];
    if (!in_array($status, $validStatuses)) {
        sendJSONResponse(false, 'Geçersiz durum değeri');
    }
    
    // Veritabanı bağlantısı
    $pdo = getDBConnection();
    if (!$pdo) {
        sendJSONResponse(false, 'Veritabanı bağlantısı kurulamadı');
    }
    
    // Önce durum sütununun var olup olmadığını kontrol et
    $checkColumnQuery = "SHOW COLUMNS FROM katilimcilar LIKE 'durum'";
    $stmt = $pdo->prepare($checkColumnQuery);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        // Durum sütunu yoksa ekle
        $addColumnQuery = "ALTER TABLE katilimcilar ADD COLUMN durum ENUM('aktif', 'pasif') DEFAULT 'aktif' AFTER pozisyon";
        $pdo->exec($addColumnQuery);
        
        // Mevcut tüm katılımcıları aktif olarak işaretle
        $updateAllQuery = "UPDATE katilimcilar SET durum = 'aktif' WHERE durum IS NULL";
        $pdo->exec($updateAllQuery);
    }
    
    // Katılımcı durumunu güncelle
    $updateQuery = "UPDATE katilimcilar SET durum = ? WHERE katilimci_id = ?";
    $stmt = $pdo->prepare($updateQuery);
    $stmt->execute([$status, $participantId]);
    
    if ($stmt->rowCount() > 0) {
        // Güncelleme başarılı
        $message = '';
        switch ($status) {
            case 'pasif':
                $message = 'Katılımcı pasif olarak işaretlendi';
                break;
            case 'aktif':
                $message = 'Katılımcı aktif olarak işaretlendi';
                break;
        }
        
        sendJSONResponse(true, $message, ['participantId' => $participantId, 'status' => $status]);
    } else {
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
