<?php
require_once 'config.php';

echo "<h2>Eski Şifreleri Geri Yükleme</h2>";

try {
    $pdo = getDBConnection();
    if (!$pdo) {
        die("Veritabanı bağlantısı kurulamadı");
    }

    // Eski şifre (password) hash'ini geri yükle
    $oldPasswordHash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
    
    echo "<h3>Eski Şifreler Geri Yükleniyor:</h3>";
    
    $users = ['admin', 'organizer', 'participant'];
    
    foreach ($users as $username) {
        $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE username = ?");
        $result = $stmt->execute([$oldPasswordHash, $username]);
        
        if ($result) {
            echo "✅ {$username} kullanıcısının şifresi eski haline döndürüldü<br>";
        } else {
            echo "❌ {$username} kullanıcısının şifresi güncellenemedi<br>";
        }
    }

    echo "<hr>";
    echo "<h3>✅ Geri Yükleme Tamamlandı!</h3>";
    echo "<p><strong>Artık tekrar eski şifrelerle giriş yapabilirsiniz:</strong></p>";
    echo "<ul>";
    echo "<li><strong>Admin:</strong> admin / <strong>password</strong></li>";
    echo "<li><strong>Organizer:</strong> organizer / <strong>password</strong></li>";
    echo "<li><strong>Participant:</strong> participant / <strong>password</strong></li>";
    echo "</ul>";

    echo "<p><em>Not: Tarayıcı veri ihlali uyarısı verebilir çünkü 'password' şifresi güvenli değil.</em></p>";

} catch (Exception $e) {
    echo "❌ Hata: " . $e->getMessage();
}
?>
