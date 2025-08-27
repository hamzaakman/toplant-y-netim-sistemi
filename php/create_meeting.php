<?php
require_once 'config.php';

// Session başlat
session_start();

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Sadece POST isteklerini kabul et
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSONResponse(false, 'Sadece POST istekleri kabul edilir');
}

try {
    // Veritabanı bağlantısı
    $pdo = getDBConnection();
    if (!$pdo) {
        sendJSONResponse(false, 'Veritabanı bağlantısı kurulamadı');
    }
    
    // Form verilerini al ve temizle
    $meetingName = sanitizeInput($_POST['meetingName'] ?? '');
    $meetingDate = sanitizeInput($_POST['meetingDate'] ?? '');
    $meetingTime = sanitizeInput($_POST['meetingTime'] ?? '');
    $meetingLocation = sanitizeInput($_POST['meetingLocation'] ?? '');
    $newEmails = $_POST['newEmails'] ?? [];
    $existingParticipants = $_POST['existingParticipants'] ?? [];
    
    // Validasyon
    if (empty($meetingName) || empty($meetingDate) || empty($meetingTime) || empty($meetingLocation)) {
        sendJSONResponse(false, 'Tüm zorunlu alanları doldurun');
    }
    
    if (empty($newEmails) && empty($existingParticipants)) {
        sendJSONResponse(false, 'En az bir katılımcı seçin veya ekleyin');
    }
    
    // Tarih ve saat validasyonu
    $meetingDateTime = $meetingDate . ' ' . $meetingTime;
    if (strtotime($meetingDateTime) <= time()) {
        sendJSONResponse(false, 'Toplantı tarihi ve saati gelecekte olmalıdır');
    }
    
    // Transaction başlat
    $pdo->beginTransaction();
    
    try {
        // 1. Toplantıyı kaydet
        $insertMeetingQuery = "INSERT INTO toplantilar (baslik, tarih_saat, yer, durum) 
                               VALUES (?, ?, ?, 'aktif')";
        $stmt = $pdo->prepare($insertMeetingQuery);
        $meetingDateTime = $meetingDate . ' ' . $meetingTime;
        $stmt->execute([$meetingName, $meetingDateTime, $meetingLocation]);
        
        $meetingId = $pdo->lastInsertId();
        
        // 2. Yeni e-postaları kontrol et ve katılımcılar tablosuna ekle
        $newParticipantIds = [];
        if (!empty($newEmails)) {
            foreach ($newEmails as $email) {
                $email = sanitizeInput($email);
                
                if (!validateEmail($email)) {
                    throw new Exception("Geçersiz e-posta formatı: " . $email);
                }
                
                // E-posta zaten var mı kontrol et
                $checkEmailQuery = "SELECT katilimci_id FROM katilimcilar WHERE e_posta = ?";
                $stmt = $pdo->prepare($checkEmailQuery);
                $stmt->execute([$email]);
                $existingParticipant = $stmt->fetch();
                
                if ($existingParticipant) {
                    // Mevcut katılımcıyı listeye ekle
                    $newParticipantIds[] = $existingParticipant['katilimci_id'];
                } else {
                    // Yeni katılımcı ekle
                    $insertParticipantQuery = "INSERT INTO katilimcilar (ad_soyad, e_posta, kayit_tarihi) 
                                             VALUES (?, ?, NOW())";
                    $stmt = $pdo->prepare($insertParticipantQuery);
                    $stmt->execute([$email, $email]); // Ad soyad olarak e-posta kullan
                    
                    $newParticipantIds[] = $pdo->lastInsertId();
                }
            }
        }
        
        // 3. Tüm katılımcı ID'lerini birleştir
        $allParticipantIds = array_merge($existingParticipants, $newParticipantIds);
        $allParticipantIds = array_unique($allParticipantIds); // Tekrarları kaldır
        
        // 4. Toplantı katılımcılarını kaydet
        if (!empty($allParticipantIds)) {
            $insertParticipantQuery = "INSERT INTO toplanti_katilimcilari (toplanti_id, katilimci_id) VALUES (?, ?)";
            $stmt = $pdo->prepare($insertParticipantQuery);
            
            foreach ($allParticipantIds as $participantId) {
                $stmt->execute([$meetingId, $participantId]);
            }
        }
        
        // 5. N8N webhook'a veri gönder
        $webhookData = [
            'meeting_id' => $meetingId,
            'meeting_name' => $meetingName,
            'meeting_date' => $meetingDate,
            'meeting_time' => $meetingTime,
            'meeting_location' => $meetingLocation,
            'participants' => []
        ];
        
        // Katılımcı bilgilerini al
        if (!empty($allParticipantIds)) {
            $participantInfoQuery = "SELECT katilimci_id, ad_soyad, e_posta FROM katilimcilar WHERE katilimci_id IN (" . 
                                   str_repeat('?,', count($allParticipantIds) - 1) . '?)';
            $stmt = $pdo->prepare($participantInfoQuery);
            $stmt->execute($allParticipantIds);
            $webhookData['participants'] = $stmt->fetchAll();
        }
        
        // N8N webhook'a gönder (async olarak)
        sendToN8N($webhookData);
        
        // Transaction'ı commit et
        $pdo->commit();
        
        sendJSONResponse(true, 'Toplantı başarıyla oluşturuldu', [
            'meeting_id' => $meetingId,
            'participant_count' => count($allParticipantIds)
        ]);
        
    } catch (Exception $e) {
        // Hata durumunda rollback
        $pdo->rollBack();
        throw $e;
    }
    
} catch (PDOException $e) {
    error_log("Veritabanı hatası: " . $e->getMessage());
    sendJSONResponse(false, 'Veritabanı işlemi sırasında hata oluştu');
} catch (Exception $e) {
    error_log("Genel hata: " . $e->getMessage());
    sendJSONResponse(false, $e->getMessage());
}

// N8N webhook'a veri gönderme fonksiyonu
function sendToN8N($data) {
    // N8N webhook URL'si - bu değeri config'de tanımlayabilirsiniz
    $n8nWebhookUrl = 'https://your-n8n-instance.com/webhook/meeting-created';
    
    // Async olarak gönder (sistem yanıtı beklemeyecek)
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $n8nWebhookUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'User-Agent: ToplantiYonetimSistemi/1.0'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 1);
    curl_setopt($ch, CURLOPT_NOSIGNAL, 1);
    
    curl_exec($ch);
    curl_close($ch);
    
    // Log kaydı
    error_log("N8N webhook'a veri gönderildi: " . json_encode($data));
}
?>
