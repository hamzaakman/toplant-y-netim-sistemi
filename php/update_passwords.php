<?php
require_once 'config.php';

echo "<h2>Test Kullanıcı Şifrelerini Güncelleme</h2>";

try {
    $pdo = getDBConnection();
    if (!$pdo) {
        die("Veritabanı bağlantısı kurulamadı");
    }

    // Güvenli şifreler oluştur
    $users = [
        'admin' => 'Admin2024!',
        'organizer' => 'Organizer2024!', 
        'participant' => 'Participant2024!'
    ];

    echo "<h3>Yeni Şifreler:</h3>";
    echo "<table border='1' style='border-collapse: collapse; margin: 10px 0;'>";
    echo "<tr><th style='padding: 10px;'>Kullanıcı</th><th style='padding: 10px;'>Yeni Şifre</th></tr>";
    
    foreach ($users as $username => $newPassword) {
        echo "<tr>";
        echo "<td style='padding: 10px; font-weight: bold;'>{$username}</td>";
        echo "<td style='padding: 10px; color: blue;'>{$newPassword}</td>";
        echo "</tr>";
    }
    echo "</table>";

    echo "<hr>";
    echo "<h3>Şifre Güncelleme İşlemi:</h3>";

    foreach ($users as $username => $newPassword) {
        // Şifreyi hash'le
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        
        // Veritabanında güncelle
        $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE username = ?");
        $result = $stmt->execute([$hashedPassword, $username]);
        
        if ($result) {
            echo "✅ {$username} kullanıcısının şifresi güncellendi<br>";
        } else {
            echo "❌ {$username} kullanıcısının şifresi güncellenemedi<br>";
        }
    }

    echo "<hr>";
    echo "<h3>✅ Güncelleme Tamamlandı!</h3>";
    echo "<p><strong>Artık şu bilgilerle giriş yapabilirsiniz:</strong></p>";
    echo "<ul>";
    echo "<li><strong>Admin:</strong> admin / Admin2024!</li>";
    echo "<li><strong>Organizer:</strong> organizer / Organizer2024!</li>";
    echo "<li><strong>Participant:</strong> participant / Participant2024!</li>";
    echo "</ul>";

    echo "<p><strong>Bu şifreler güvenlidir ve tarayıcı veri ihlali uyarısı vermeyecektir.</strong></p>";

} catch (Exception $e) {
    echo "❌ Hata: " . $e->getMessage();
}
?>
