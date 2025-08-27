<?php
require_once 'config.php';

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/html; charset=utf-8');

echo "<h2>Toplantılar Tablosuna 'durum' Sütunu Ekleme</h2>";

try {
    // Veritabanı bağlantısı
    $pdo = getDBConnection();
    if (!$pdo) {
        echo "<p style='color: red;'>❌ Veritabanı bağlantısı kurulamadı</p>";
        exit;
    }
    
    echo "<p style='color: green;'>✅ Veritabanı bağlantısı başarılı</p>";
    
    // Önce durum sütununun var olup olmadığını kontrol et
    $checkColumnQuery = "SHOW COLUMNS FROM toplantilar LIKE 'durum'";
    $stmt = $pdo->prepare($checkColumnQuery);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        // Durum sütunu yoksa ekle
        echo "<p>🔍 'durum' sütunu bulunamadı, ekleniyor...</p>";
        
        $addColumnQuery = "ALTER TABLE toplantilar ADD COLUMN durum ENUM('aktif', 'iptal_edildi', 'tamamlandi') DEFAULT 'aktif' AFTER yer";
        $pdo->exec($addColumnQuery);
        
        echo "<p style='color: green;'>✅ 'durum' sütunu başarıyla eklendi</p>";
        
        // Mevcut kayıtları 'aktif' olarak güncelle
        $updateQuery = "UPDATE toplantilar SET durum = 'aktif' WHERE durum IS NULL";
        $pdo->exec($updateQuery);
        
        echo "<p style='color: green;'>✅ Mevcut kayıtlar 'aktif' olarak güncellendi</p>";
        
    } else {
        echo "<p style='color: blue;'>ℹ️ 'durum' sütunu zaten mevcut</p>";
    }
    
    // Tablo yapısını göster
    echo "<h3>📋 Güncel Tablo Yapısı:</h3>";
    $structureQuery = "DESCRIBE toplantilar";
    $stmt = $pdo->prepare($structureQuery);
    $stmt->execute();
    $columns = $stmt->fetchAll();
    
    echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
    echo "<tr><th>Alan</th><th>Tip</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
    
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
    
    // Kayıt sayısını göster
    $countQuery = "SELECT COUNT(*) as total FROM toplantilar";
    $stmt = $pdo->prepare($countQuery);
    $stmt->execute();
    $count = $stmt->fetch();
    
    echo "<p><strong>📊 Toplam Kayıt Sayısı:</strong> {$count['total']}</p>";
    
} catch (PDOException $e) {
    echo "<p style='color: red;'>❌ Veritabanı hatası: " . $e->getMessage() . "</p>";
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Genel hata: " . $e->getMessage() . "</p>";
}

echo "<hr>";
echo "<p><a href='../index.html'>🏠 Ana Sayfaya Dön</a></p>";
echo "<p><a href='../meetings.html'>📋 Toplantı Listesine Dön</a></p>";
?>
