<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>Veritabanı Bağlantı Testi</h2>";

// Direkt bağlantı testi
echo "<h3>1. Direkt PDO Bağlantısı</h3>";
try {
    $pdo = new PDO(
        "mysql:host=localhost;dbname=toplanti_yonetim_sistemi;charset=utf8mb4",
        "root",
        "",
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
    echo "✅ Direkt PDO bağlantısı BAŞARILI!<br>";
    
    // Users tablosunu kontrol et
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    echo "✅ Users tablosunda {$result['count']} kullanıcı bulundu<br>";
    
} catch (Exception $e) {
    echo "❌ Direkt PDO hatası: " . $e->getMessage() . "<br>";
    echo "❌ Hata kodu: " . $e->getCode() . "<br>";
}

echo "<hr>";

// Config.php üzerinden test
echo "<h3>2. Config.php Üzerinden Test</h3>";
try {
    require_once 'config.php';
    
    $db = getDBConnection();
    if ($db) {
        echo "✅ Config.php bağlantısı BAŞARILI!<br>";
        
        $stmt = $db->query("SELECT COUNT(*) as count FROM users");
        $result = $stmt->fetch();
        echo "✅ Users tablosunda {$result['count']} kullanıcı bulundu<br>";
        
    } else {
        echo "❌ Config.php bağlantısı BAŞARISIZ!<br>";
    }
    
} catch (Exception $e) {
    echo "❌ Config.php hatası: " . $e->getMessage() . "<br>";
}

echo "<hr>";
echo "<h3>3. MySQL Bağlantı Bilgileri</h3>";
echo "Host: localhost<br>";
echo "Database: toplanti_yonetim_sistemi<br>";
echo "User: root<br>";
echo "Password: (boş)<br>";

echo "<hr>";
echo "Test tamamlandı!";
?>
