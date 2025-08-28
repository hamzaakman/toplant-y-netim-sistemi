<?php
session_start();
require_once 'config.php';

// JSON verisini al
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    sendJSONResponse(false, 'Geçersiz veri formatı');
}

$username = sanitizeInput($input['username'] ?? '');
$email = sanitizeInput($input['email'] ?? '');
$password = $input['password'] ?? '';
$role = sanitizeInput($input['role'] ?? '');

// Validasyon
if (empty($username) || empty($email) || empty($password) || empty($role)) {
    sendJSONResponse(false, 'Tüm alanlar gereklidir');
}

// Kullanıcı adı validasyonu
if (strlen($username) < 3 || strlen($username) > 20) {
    sendJSONResponse(false, 'Kullanıcı adı 3-20 karakter arası olmalıdır');
}

if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
    sendJSONResponse(false, 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir');
}

// E-posta validasyonu
if (!validateEmail($email)) {
    sendJSONResponse(false, 'Geçersiz e-posta adresi');
}

// Şifre validasyonu
if (strlen($password) < 8) {
    sendJSONResponse(false, 'Şifre en az 8 karakter olmalıdır');
}

if (!preg_match('/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/', $password)) {
    sendJSONResponse(false, 'Şifre büyük/küçük harf, rakam ve özel karakter içermelidir');
}

// Rol validasyonu
$allowedRoles = ['user', 'admin', 'moderator'];
if (!in_array($role, $allowedRoles)) {
    sendJSONResponse(false, 'Geçersiz rol seçimi');
}

try {
    $pdo = getDBConnection();
    if (!$pdo) {
        sendJSONResponse(false, 'Veritabanı bağlantısı kurulamadı');
    }

    // Kullanıcı adı ve e-posta benzersizlik kontrolü
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$username, $email]);
    $count = $stmt->fetchColumn();

    if ($count > 0) {
        // Hangi alanın zaten kullanıldığını kontrol et
        $stmt = $pdo->prepare("SELECT username, email FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$username, $email]);
        $existing = $stmt->fetch();
        
        if ($existing['username'] === $username) {
            sendJSONResponse(false, 'Bu kullanıcı adı zaten kullanılıyor');
        } else {
            sendJSONResponse(false, 'Bu e-posta adresi zaten kullanılıyor');
        }
    }

    // Şifreyi hashle
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Kullanıcıyı veritabanına ekle
    $stmt = $pdo->prepare("INSERT INTO users (username, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())");
    $result = $stmt->execute([$username, $email, $hashedPassword, $role]);

    if ($result) {
        $userId = $pdo->lastInsertId();
        
        // Başarılı kayıt mesajı
        sendJSONResponse(true, 'Hesabınız başarıyla oluşturuldu! Giriş yapabilirsiniz.', [
            'user_id' => $userId,
            'username' => $username,
            'email' => $email,
            'role' => $role
        ]);
    } else {
        sendJSONResponse(false, 'Kullanıcı kaydedilemedi');
    }

} catch (PDOException $e) {
    error_log("Kayıt hatası: " . $e->getMessage());
    
    // Duplicate entry hatası kontrolü
    if ($e->getCode() == 23000) {
        if (strpos($e->getMessage(), 'username') !== false) {
            sendJSONResponse(false, 'Bu kullanıcı adı zaten kullanılıyor');
        } elseif (strpos($e->getMessage(), 'email') !== false) {
            sendJSONResponse(false, 'Bu e-posta adresi zaten kullanılıyor');
        } else {
            sendJSONResponse(false, 'Bu bilgiler zaten kullanılıyor');
        }
    }
    
    sendJSONResponse(false, 'Kayıt olurken bir hata oluştu');
} catch (Exception $e) {
    error_log("Kayıt genel hata: " . $e->getMessage());
    sendJSONResponse(false, 'Beklenmeyen bir hata oluştu');
}
?>
