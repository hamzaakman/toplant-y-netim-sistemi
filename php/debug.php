<?php
echo "PHP çalışıyor!<br>";
echo "PHP sürümü: " . phpversion() . "<br>";
echo "Hata raporlama: " . (error_reporting() ? 'Açık' : 'Kapalı') . "<br>";
echo "Display errors: " . (ini_get('display_errors') ? 'Açık' : 'Kapalı') . "<br>";

try {
    echo "Veritabanı bağlantısı deneniyor...<br>";
    
    $pdo = new PDO(
        "mysql:host=localhost;dbname=toplanti_yonetim_sistemi;charset=utf8mb4",
        "root",
        ""
    );
    
    echo "✅ Veritabanı bağlantısı başarılı!<br>";
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    echo "✅ Users tablosunda " . $result['count'] . " kullanıcı var<br>";
    
} catch (Exception $e) {
    echo "❌ Hata: " . $e->getMessage() . "<br>";
    echo "❌ Hata kodu: " . $e->getCode() . "<br>";
}

echo "<br>Test tamamlandı!";
?>
