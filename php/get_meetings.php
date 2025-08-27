<?php
require_once 'config.php';

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

try {
    // Veritabanı bağlantısı
    $pdo = getDBConnection();
    if (!$pdo) {
        sendJSONResponse(false, 'Veritabanı bağlantısı kurulamadı');
    }
    
    // Toplantıları çek
    $query = "SELECT 
                t.toplanti_id,
                t.baslik,
                t.tarih_saat,
                t.yer,
                COALESCE(t.durum, 'aktif') as durum,
                COUNT(tk.katilimci_id) as katilimci_sayisi
              FROM toplantilar t
              LEFT JOIN toplanti_katilimcilari tk ON t.toplanti_id = tk.toplanti_id
              GROUP BY t.toplanti_id
              ORDER BY t.tarih_saat DESC";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $meetings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Toplantı verilerini formatla
    $formattedMeetings = [];
    foreach ($meetings as $meeting) {
        $dateTime = new DateTime($meeting['tarih_saat']);
        
        $formattedMeetings[] = [
            'id' => $meeting['toplanti_id'],
            'title' => $meeting['baslik'],
            'date' => $dateTime->format('d.m.Y'),
            'time' => $dateTime->format('H:i'),
            'location' => $meeting['yer'],
            'status' => $meeting['durum'],
            'participantCount' => (int)$meeting['katilimci_sayisi'],
            'datetime' => $meeting['tarih_saat']
        ];
    }
    
    sendJSONResponse(true, 'Toplantılar başarıyla getirildi', $formattedMeetings);
    
} catch (PDOException $e) {
    error_log("Veritabanı hatası: " . $e->getMessage());
    sendJSONResponse(false, 'Veritabanı işlemi sırasında hata oluştu');
} catch (Exception $e) {
    error_log("Genel hata: " . $e->getMessage());
    sendJSONResponse(false, $e->getMessage());
}
?>
