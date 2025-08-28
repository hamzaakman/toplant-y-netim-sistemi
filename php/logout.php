<?php
session_start();
require_once 'config.php';

// Remember me token'ı varsa sil
if (isset($_COOKIE['remember_token'])) {
    $token = $_COOKIE['remember_token'];
    
    try {
        $pdo = getDBConnection();
        if ($pdo) {
            // Token'ı veritabanından sil
            $stmt = $pdo->prepare("DELETE FROM remember_tokens WHERE token = ?");
            $stmt->execute([$token]);
        }
    } catch (Exception $e) {
        error_log("Token silme hatası: " . $e->getMessage());
    }
    
    // Cookie'yi sil
    setcookie('remember_token', '', time() - 3600, '/');
}

// Session'ı temizle
session_unset();
session_destroy();

// Başarılı çıkış mesajı
sendJSONResponse(true, 'Başarıyla çıkış yapıldı');
?>
