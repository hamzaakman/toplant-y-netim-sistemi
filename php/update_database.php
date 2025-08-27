<?php
header('Content-Type: text/html; charset=utf-8');
require_once 'config.php';

try {
    $pdo = getDBConnection();
    
    echo "<h2>🔧 Veritabanı Güncelleniyor...</h2>";
    
    // Eksik sütunları ekle
    $alterQueries = [
        "ALTER TABLE katilimcilar ADD COLUMN telefon VARCHAR(20) NULL",
        "ALTER TABLE katilimcilar ADD COLUMN departman VARCHAR(100) NULL",
        "ALTER TABLE katilimcilar ADD COLUMN pozisyon VARCHAR(100) NULL",
        "ALTER TABLE katilimcilar ADD COLUMN durum ENUM('aktif', 'pasif') DEFAULT 'aktif'",
        "ALTER TABLE katilimcilar ADD COLUMN kayit_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    ];
    
    foreach ($alterQueries as $query) {
        try {
            $pdo->exec($query);
            echo "<p>✅ Sorgu başarılı: $query</p>";
        } catch (Exception $e) {
            // Sütun zaten varsa hata vermez
            if (strpos($e->getMessage(), 'Duplicate column name') === false) {
                echo "<p>⚠️ Sorgu hatası: $query - {$e->getMessage()}</p>";
            } else {
                echo "<p>ℹ️ Sütun zaten mevcut: $query</p>";
            }
        }
    }
    
    // Tablo yapısını göster
    echo "<h3>📋 Güncel Tablo Yapısı:</h3>";
    $stmt = $pdo->query("DESCRIBE katilimcilar");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
    echo "<tr><th>Sütun</th><th>Tip</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
    
    foreach ($columns as $column) {
        echo "<tr>";
        echo "<td>{$column['Field']}</td>";
        echo "<td>{$column['Type']}</td>";
        echo "<td>{$column['Null']}</td>";
        echo "<td>{$column['Key']}</td>";
        echo "<td>{$column['Default']}</td>";
        echo "<td>{$column['Extra']}</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    echo "<h3>🎯 Sonraki Adım:</h3>";
    echo "<p><a href='add_sample_participants.php'>→ Örnek Katılımcıları Ekle</a></p>";
    echo "<p><a href='../index.html'>→ Ana Sayfaya Dön</a></p>";
    
} catch (Exception $e) {
    echo "<h2>❌ Hata!</h2>";
    echo "<p>Veritabanı hatası: {$e->getMessage()}</p>";
    echo "<p><a href='../index.html'>← Ana Sayfaya Dön</a></p>";
}
?>
