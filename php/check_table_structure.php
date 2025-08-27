<?php
header('Content-Type: text/html; charset=utf-8');
require_once 'config.php';

try {
    $pdo = getDBConnection();
    
    echo "<h2>🔍 Mevcut Tablo Yapısı Kontrol Ediliyor...</h2>";
    
    // Tablo yapısını göster
    echo "<h3>📋 katilimcilar Tablosu Yapısı:</h3>";
    $stmt = $pdo->query("DESCRIBE katilimcilar");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table border='1' style='border-collapse: collapse; width: 100%; margin: 20px 0;'>";
    echo "<tr style='background: #f0f0f0;'><th>Sütun</th><th>Tip</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
    
    foreach ($columns as $column) {
        echo "<tr>";
        echo "<td><strong>{$column['Field']}</strong></td>";
        echo "<td>{$column['Type']}</td>";
        echo "<td>{$column['Null']}</td>";
        echo "<td>{$column['Key']}</td>";
        echo "<td>{$column['Default']}</td>";
        echo "<td>{$column['Extra']}</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    // Mevcut kayıt sayısını göster
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM katilimcilar");
    $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    echo "<p><strong>📊 Mevcut Kayıt Sayısı: $count</strong></p>";
    
    // Mevcut kayıtları göster (eğer varsa)
    if ($count > 0) {
        echo "<h3>📝 Mevcut Kayıtlar:</h3>";
        $stmt = $pdo->query("SELECT * FROM katilimcilar LIMIT 5");
        $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "<table border='1' style='border-collapse: collapse; width: 100%; margin: 20px 0;'>";
        if (!empty($records)) {
            // Başlık satırı
            echo "<tr style='background: #f0f0f0;'>";
            foreach (array_keys($records[0]) as $header) {
                echo "<th>$header</th>";
            }
            echo "</tr>";
            
            // Veri satırları
            foreach ($records as $record) {
                echo "<tr>";
                foreach ($record as $value) {
                    echo "<td>" . ($value ?: '<em>boş</em>') . "</td>";
                }
                echo "</tr>";
            }
        }
        echo "</table>";
    }
    
    echo "<h3>🎯 Sonraki Adım:</h3>";
    if ($count == 0) {
        echo "<p><a href='add_sample_participants.php'>→ Örnek Katılımcıları Ekle</a></p>";
    } else {
        echo "<p><a href='add_sample_participants.php'>→ Daha Fazla Katılımcı Ekle</a></p>";
    }
    echo "<p><a href='../index.html'>→ Ana Sayfaya Dön</a></p>";
    
} catch (Exception $e) {
    echo "<h2>❌ Hata!</h2>";
    echo "<p>Veritabanı hatası: {$e->getMessage()}</p>";
    echo "<p><a href='../index.html'>← Ana Sayfaya Dön</a></p>";
}
?>
