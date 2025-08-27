<?php
header('Content-Type: text/html; charset=utf-8');
require_once 'config.php';

try {
    $pdo = getDBConnection();
    
    echo "<h2>🔍 Katılımcı Durumu Kontrol Ediliyor...</h2>";
    
    // Toplam katılımcı sayısı
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM katilimcilar");
    $totalCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    echo "<p><strong>📊 Toplam Katılımcı Sayısı: $totalCount</strong></p>";
    
    if ($totalCount > 0) {
        // Tüm katılımcıları listele
        $stmt = $pdo->query("SELECT * FROM katilimcilar ORDER BY katilimci_id");
        $participants = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "<h3>📝 Mevcut Katılımcılar:</h3>";
        echo "<table border='1' style='border-collapse: collapse; width: 100%; margin: 20px 0;'>";
        
        // Başlık satırı
        echo "<tr style='background: #f0f0f0;'>";
        foreach (array_keys($participants[0]) as $header) {
            echo "<th>$header</th>";
        }
        echo "</tr>";
        
        // Veri satırları
        foreach ($participants as $participant) {
            echo "<tr>";
            foreach ($participant as $value) {
                echo "<td>" . ($value ?: '<em>boş</em>') . "</td>";
            }
            echo "</tr>";
        }
        echo "</table>";
        
        // API test
        echo "<h3>🧪 API Test:</h3>";
        echo "<p><a href='get_participants.php' target='_blank'>→ get_participants.php'yi test et</a></p>";
        
    } else {
        echo "<p>❌ Veritabanında hiç katılımcı bulunamadı!</p>";
        echo "<p><a href='add_sample_participants.php'>→ Örnek katılımcıları ekle</a></p>";
    }
    
    echo "<hr>";
    echo "<h3>🎯 Sonraki Adımlar:</h3>";
    echo "<p><a href='../index.html'>→ Ana Sayfaya Dön</a></p>";
    echo "<p><a href='../participants.html'>→ Katılımcılar Sayfasına Git</a></p>";
    
} catch (Exception $e) {
    echo "<h2>❌ Hata!</h2>";
    echo "<p>Veritabanı hatası: {$e->getMessage()}</p>";
    echo "<p><a href='../index.html'>← Ana Sayfaya Dön</a></p>";
}
?>
