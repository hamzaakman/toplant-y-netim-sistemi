<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

try {
    $pdo = getDBConnection();
    
    // Arama parametresi
    $search = isset($_GET['search']) ? $_GET['search'] : '';
    $status = isset($_GET['status']) ? $_GET['status'] : '';
    
    // SQL sorgusu oluştur
    $sql = "SELECT katilimci_id, ad_soyad, e_posta, telefon, departman, pozisyon, durum, kayit_tarihi FROM katilimcilar WHERE 1=1";
    $params = [];
    
    // Arama filtresi
    if (!empty($search)) {
        $sql .= " AND (ad_soyad LIKE ? OR e_posta LIKE ? OR departman LIKE ?)";
        $searchTerm = "%$search%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }
    
    // Durum filtresi
    if (!empty($status)) {
        $sql .= " AND durum = ?";
        $params[] = $status;
    }
    
    // Sıralama
    $sql .= " ORDER BY ad_soyad ASC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    $participants = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Toplantı sayısını hesapla
    foreach ($participants as &$participant) {
        $meetingCountSql = "SELECT COUNT(*) as count FROM toplanti_katilimcilari WHERE katilimci_id = ?";
        $meetingStmt = $pdo->prepare($meetingCountSql);
        $meetingStmt->execute([$participant['katilimci_id']]);
        $meetingCount = $meetingStmt->fetch(PDO::FETCH_ASSOC);
        $participant['toplantilar_sayisi'] = $meetingCount['count'];
        
        // Son toplantı tarihi
        $lastMeetingSql = "SELECT t.tarih_saat FROM toplantilar t 
                          INNER JOIN toplanti_katilimcilari tk ON t.toplanti_id = tk.toplanti_id 
                          WHERE tk.katilimci_id = ? 
                          ORDER BY t.tarih_saat DESC LIMIT 1";
        $lastMeetingStmt = $pdo->prepare($lastMeetingSql);
        $lastMeetingStmt->execute([$participant['katilimci_id']]);
        $lastMeeting = $lastMeetingStmt->fetch(PDO::FETCH_ASSOC);
        $participant['son_topanti'] = $lastMeeting ? $lastMeeting['tarih_saat'] : null;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $participants,
        'count' => count($participants)
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
