<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>Basit Veritabanı Testi</h2>";

try {
    // Doğrudan PDO bağlantısı
    $pdo = new PDO(
        "mysql:host=localhost;dbname=toplanti_yonetim_sistemi;charset=utf8mb4",
        "root",
        ""
    );
    
    echo "✅ PDO bağlantısı başarılı!<br>";
    
    // Users tablosunu kontrol et
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    echo "✅ Users tablosunda " . $result['count'] . " kullanıcı var<br>";
    
} catch (Exception $e) {
    echo "❌ Hata: " . $e->getMessage() . "<br>";
    echo "❌ Hata kodu: " . $e->getCode() . "<br>";
}

echo "<hr>";
echo "Test tamamlandı!";
?>
