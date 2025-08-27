<?php
header('Content-Type: text/html; charset=utf-8');
require_once 'config.php';

try {
    $pdo = getDBConnection();
    
    echo "<h2>🧹 Katılımcılar Tablosu Temizleniyor...</h2>";
    
    // Mevcut kayıt sayısını kontrol et
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM katilimcilar");
    $existingCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    if ($existingCount == 0) {
        echo "<p>✅ Tablo zaten boş!</p>";
        echo "<p><a href='../index.html'>← Ana Sayfaya Dön</a></p>";
        exit;
    }
    
    echo "<p>📊 Mevcut kayıt sayısı: <strong>$existingCount</strong></p>";
    
    // Tüm kayıtları sil
    $deleteStmt = $pdo->prepare("DELETE FROM katilimcilar");
    $result = $deleteStmt->execute();
    
    if ($result) {
        // Auto increment'i sıfırla
        $pdo->exec("ALTER TABLE katilimcilar AUTO_INCREMENT = 1");
        
        echo "<p>✅ <strong>$existingCount</strong> kayıt başarıyla silindi!</p>";
        echo "<p>🔄 Auto increment sıfırlandı.</p>";
        
        // Yeni kayıt sayısını kontrol et
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM katilimcilar");
        $newCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        echo "<p>📊 Yeni kayıt sayısı: <strong>$newCount</strong></p>";
        
    } else {
        echo "<p>❌ Kayıtlar silinirken bir hata oluştu!</p>";
    }
    
    echo "<hr>";
    echo "<h3>🎯 Sonraki Adımlar:</h3>";
    echo "<p><a href='add_sample_participants.php'>→ Örnek Katılımcıları Ekle</a></p>";
    echo "<p><a href='../participants.html'>→ Katılımcılar Sayfasına Git</a></p>";
    echo "<p><a href='../index.html'>→ Ana Sayfaya Dön</a></p>";
    
} catch (Exception $e) {
    echo "<h2>❌ Hata!</h2>";
    echo "<p>Veritabanı hatası: {$e->getMessage()}</p>";
    echo "<p><a href='../index.html'>← Ana Sayfaya Dön</a></p>";
}
?>
