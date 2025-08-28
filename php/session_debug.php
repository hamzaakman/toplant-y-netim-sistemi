<?php
session_start();
require_once 'config.php';

echo "<h2>Session Debug Testi</h2>";

echo "<h3>1. PHP Session Bilgileri</h3>";
echo "Session ID: " . session_id() . "<br>";
echo "Session durumu: " . (session_status() === PHP_SESSION_ACTIVE ? 'Aktif' : 'Pasif') . "<br>";
echo "Session save path: " . session_save_path() . "<br>";

echo "<h3>2. Session İçeriği</h3>";
echo "<pre>";
var_dump($_SESSION);
echo "</pre>";

echo "<h3>3. Cookie Bilgileri</h3>";
echo "<pre>";
var_dump($_COOKIE);
echo "</pre>";

echo "<h3>4. Login Kontrolü</h3>";
if (isset($_SESSION['user_id']) && isset($_SESSION['username'])) {
    echo "✅ Session login bilgileri mevcut<br>";
    echo "User ID: " . $_SESSION['user_id'] . "<br>";
    echo "Username: " . $_SESSION['username'] . "<br>";
    echo "Email: " . ($_SESSION['email'] ?? 'Yok') . "<br>";
    echo "Role: " . ($_SESSION['role'] ?? 'Yok') . "<br>";
} else {
    echo "❌ Session login bilgileri eksik<br>";
    echo "user_id isset: " . (isset($_SESSION['user_id']) ? 'Evet' : 'Hayır') . "<br>";
    echo "username isset: " . (isset($_SESSION['username']) ? 'Evet' : 'Hayır') . "<br>";
}

echo "<h3>5. Check Login PHP Simülasyonu</h3>";
if (isset($_SESSION['user_id']) && isset($_SESSION['username'])) {
    echo "✅ check_login.php 'loggedIn: true' döndürmeli<br>";
} else {
    echo "❌ check_login.php 'loggedIn: false' döndürecek<br>";
}

echo "<h3>6. Manuel Session Ayarlama (Test)</h3>";
echo "<p>Eğer session boşsa, test için manuel ayarlayalım:</p>";
if (!isset($_SESSION['user_id'])) {
    $_SESSION['user_id'] = 1;
    $_SESSION['username'] = 'admin';
    $_SESSION['email'] = 'admin@test.com';
    $_SESSION['role'] = 'admin';
    $_SESSION['login_time'] = time();
    echo "✅ Test session ayarlandı!<br>";
    echo "Şimdi ana sayfaya gidin: <a href='../index.html'>index.html</a><br>";
} else {
    echo "✅ Session zaten mevcut, ana sayfaya gidin: <a href='../index.html'>index.html</a><br>";
}

echo "<hr>";
echo "Debug testi tamamlandı!";
?>
