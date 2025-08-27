<?php
require_once 'config.php';

echo "<h2>🔍 Veritabanı Bağlantı Testi</h2>";

// Veritabanı bağlantısını test et
try {
    $pdo = getDBConnection();
    
    if ($pdo) {
        echo "<p style='color: green;'>✅ Veritabanı bağlantısı başarılı!</p>";
        
        // Veritabanı bilgilerini göster
        echo "<h3>📊 Veritabanı Bilgileri:</h3>";
        echo "<p><strong>Host:</strong> " . DB_HOST . "</p>";
        echo "<p><strong>Veritabanı:</strong> " . DB_NAME . "</p>";
        echo "<p><strong>Kullanıcı:</strong> " . DB_USER . "</p>";
        
        // Tabloları listele
        echo "<h3>📋 Mevcut Tablolar:</h3>";
        $stmt = $pdo->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        if (count($tables) > 0) {
            echo "<ul>";
            foreach ($tables as $table) {
                echo "<li>📁 $table</li>";
            }
            echo "</ul>";
        } else {
            echo "<p style='color: orange;'>⚠️ Hiç tablo bulunamadı.</p>";
        }
        
        // Her tablonun yapısını göster
        foreach ($tables as $table) {
            echo "<h4>🔍 Tablo: $table</h4>";
            $stmt = $pdo->query("DESCRIBE $table");
            $columns = $stmt->fetchAll();
            
            echo "<table border='1' style='border-collapse: collapse; margin: 10px 0;'>";
            echo "<tr style='background: #f0f0f0;'><th>Alan</th><th>Tip</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
            
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
            
            // Tablo kayıt sayısını göster
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM $table");
            $count = $stmt->fetch();
            echo "<p><strong>Kayıt Sayısı:</strong> {$count['count']}</p>";
        }
        
    } else {
        echo "<p style='color: red;'>❌ Veritabanı bağlantısı başarısız!</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Hata: " . $e->getMessage() . "</p>";
    echo "<p><strong>Hata Detayı:</strong></p>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}

echo "<hr>";
echo "<h3>🔧 Test Sonucu:</h3>";
echo "<p>Bu sayfa veritabanı bağlantısını ve tablo yapısını test eder.</p>";
echo "<p>Eğer her şey yeşil görünüyorsa, sistem hazır demektir!</p>";
?>
