<?php
session_start();
require_once 'config.php';

// Session kontrolü
if (isset($_SESSION['user_id']) && isset($_SESSION['username'])) {
    sendJSONResponse(true, 'Kullanıcı giriş yapmış', [
        'loggedIn' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'email' => $_SESSION['email'] ?? '',
            'role' => $_SESSION['role'] ?? 'user'
        ]
    ]);
}

// Remember me token kontrolü
if (isset($_COOKIE['remember_token'])) {
    $token = $_COOKIE['remember_token'];
    
    try {
        $pdo = getDBConnection();
        if ($pdo) {
            // Token'ı veritabanında ara
            $stmt = $pdo->prepare("SELECT u.id, u.username, u.email, u.role, rt.expires_at 
                                  FROM remember_tokens rt 
                                  JOIN users u ON rt.user_id = u.id 
                                  WHERE rt.token = ? AND rt.expires_at > NOW()");
            $stmt->execute([$token]);
            $user = $stmt->fetch();
            
            if ($user) {
                // Session'ı yenile
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['email'] = $user['email'];
                $_SESSION['role'] = $user['role'];
                $_SESSION['login_time'] = time();
                
                sendJSONResponse(true, 'Token ile giriş yapıldı', [
                    'loggedIn' => true,
                    'user' => [
                        'id' => $user['id'],
                        'username' => $user['username'],
                        'email' => $user['email'],
                        'role' => $user['role']
                    ]
                ]);
            } else {
                // Geçersiz token, cookie'yi sil
                setcookie('remember_token', '', time() - 3600, '/');
            }
        }
    } catch (Exception $e) {
        error_log("Remember me token kontrol hatası: " . $e->getMessage());
    }
}

// Kullanıcı giriş yapmamış
sendJSONResponse(false, 'Kullanıcı giriş yapmamış', [
    'loggedIn' => false
]);
?>
