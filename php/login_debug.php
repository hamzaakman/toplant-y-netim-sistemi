<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once 'config.php';

echo "<h2>Login Debug Testi</h2>";

// Kullanıcıları listele
echo "<h3>1. Veritabanındaki Kullanıcılar</h3>";
try {
    $db = getDBConnection();
    $stmt = $db->query("SELECT id, username, email, role, password FROM users");
    $users = $stmt->fetchAll();
    
    echo "<table border='1'>";
    echo "<tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Password Hash</th></tr>";
    
    foreach ($users as $user) {
        echo "<tr>";
        echo "<td>{$user['id']}</td>";
        echo "<td>{$user['username']}</td>";
        echo "<td>{$user['email']}</td>";
        echo "<td>{$user['role']}</td>";
        echo "<td>" . substr($user['password'], 0, 20) . "...</td>";
        echo "</tr>";
    }
    echo "</table>";
    
} catch (Exception $e) {
    echo "❌ Hata: " . $e->getMessage();
}

echo "<hr>";

// Şifre test
echo "<h3>2. Şifre Testi</h3>";
echo "<p>Test için 'admin' kullanıcısının şifresini kontrol edelim:</p>";

try {
    $stmt = $db->prepare("SELECT password FROM users WHERE username = 'admin'");
    $stmt->execute();
    $user = $stmt->fetch();
    
    if ($user) {
        $stored_password = $user['password'];
        echo "Veritabanındaki hash: " . $stored_password . "<br><br>";
        
        // Farklı şifreler test et
        $test_passwords = ['admin', 'password', '123456', 'admin123'];
        
        foreach ($test_passwords as $test_pass) {
            if (password_verify($test_pass, $stored_password)) {
                echo "✅ Şifre '$test_pass' DOĞRU!<br>";
            } else {
                echo "❌ Şifre '$test_pass' yanlış<br>";
            }
        }
        
        // Eğer hiçbiri doğru değilse, hash olmayan şifre olabilir
        echo "<br><b>Hash olmayan düz metin kontrolü:</b><br>";
        foreach ($test_passwords as $test_pass) {
            if ($stored_password === $test_pass) {
                echo "✅ Düz metin şifre '$test_pass' DOĞRU!<br>";
            }
        }
        
    } else {
        echo "❌ Admin kullanıcısı bulunamadı!";
    }
    
} catch (Exception $e) {
    echo "❌ Şifre test hatası: " . $e->getMessage();
}

echo "<hr>";

// Session testi
echo "<h3>3. Session Testi</h3>";
session_start();
echo "Session ID: " . session_id() . "<br>";
echo "Session durumu: " . (session_status() === PHP_SESSION_ACTIVE ? 'Aktif' : 'Pasif') . "<br>";

// Test session değişkeni
$_SESSION['test'] = 'Session çalışıyor!';
echo "Test session: " . $_SESSION['test'] . "<br>";

echo "<hr>";
echo "<h3>4. Önerilen Çözüm</h3>";
echo "<p>Eğer şifreler hash'lenmemişse, yeni hash'lenmiş şifreler oluşturalım:</p>";
echo "<p><strong>admin</strong> için hash: " . password_hash('admin', PASSWORD_DEFAULT) . "</p>";
echo "<p><strong>organizer</strong> için hash: " . password_hash('organizer', PASSWORD_DEFAULT) . "</p>";
echo "<p><strong>participant</strong> için hash: " . password_hash('participant', PASSWORD_DEFAULT) . "</p>";

echo "<br>Debug testi tamamlandı!";
?>
