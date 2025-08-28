<?php
session_start();
require_once 'config.php';

// JSON verisini al
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    sendJSONResponse(false, 'Geçersiz veri formatı');
}

$username = sanitizeInput($input['username'] ?? '');
$password = $input['password'] ?? '';
$rememberMe = $input['rememberMe'] ?? false;

// Validasyon
if (empty($username) || empty($password)) {
    sendJSONResponse(false, 'Kullanıcı adı ve şifre gereklidir');
}

try {
    $pdo = getDBConnection();
    if (!$pdo) {
        sendJSONResponse(false, 'Veritabanı bağlantısı kurulamadı');
    }

    // Kullanıcıyı veritabanında ara
    $stmt = $pdo->prepare("SELECT id, username, email, password, role, created_at FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$username, $username]);
    $user = $stmt->fetch();

    if (!$user) {
        sendJSONResponse(false, 'Kullanıcı adı veya e-posta bulunamadı');
    }

    // Şifre doğrulama
    if (!password_verify($password, $user['password'])) {
        sendJSONResponse(false, 'Hatalı şifre');
    }

    // Giriş başarılı - session'a kullanıcı bilgilerini kaydet
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['role'] = $user['role'];
    $_SESSION['login_time'] = time();

    // Remember me özelliği
    if ($rememberMe) {
        $token = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', strtotime('+30 days'));
        
        // Token'ı veritabanına kaydet (remember_tokens tablosu gerekli)
        $stmt = $pdo->prepare("INSERT INTO remember_tokens (user_id, token, expires_at) VALUES (?, ?, ?)");
        $stmt->execute([$user['id'], $token, $expires]);
        
        // Cookie ayarla (30 gün)
        setcookie('remember_token', $token, time() + (30 * 24 * 60 * 60), '/', '', true, true);
    }

    // Son giriş zamanını güncelle
    $stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
    $stmt->execute([$user['id']]);

    // Başarılı giriş mesajı
    $welcomeMessage = "Hoş geldiniz, " . htmlspecialchars($user['username']) . "!";
    sendJSONResponse(true, $welcomeMessage, [
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'role' => $user['role']
        ]
    ]);

} catch (PDOException $e) {
    error_log("Login hatası: " . $e->getMessage());
    sendJSONResponse(false, 'Giriş yapılırken bir hata oluştu');
} catch (Exception $e) {
    error_log("Login genel hata: " . $e->getMessage());
    sendJSONResponse(false, 'Beklenmeyen bir hata oluştu');
}
?>
