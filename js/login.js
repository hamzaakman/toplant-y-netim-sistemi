document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('password');
    const loginMessage = document.getElementById('loginMessage');
    const loginBtn = document.querySelector('.login-btn');

    // Şifre göster/gizle
    passwordToggle.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        const icon = this.querySelector('i');
        icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    });

    // Form gönderimi
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Form verilerini al
        const formData = new FormData(loginForm);
        const username = formData.get('username').trim();
        const password = formData.get('password');
        const rememberMe = formData.get('rememberMe') === 'on';

        // Validasyon
        if (!username || !password) {
            showMessage('Lütfen tüm alanları doldurun.', 'error');
            return;
        }

        // Loading durumu
        setLoading(true);

        try {
            const response = await fetch('php/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    rememberMe: rememberMe
                })
            });

            const result = await response.json();

            if (result.success) {
                // Başarılı giriş - direkt yönlendir (mesaj yok)
                window.location.href = 'index.html';
            } else {
                showMessage(result.message, 'error');
            }
        } catch (error) {
            console.error('Login hatası:', error);
            showMessage('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.', 'error');
        } finally {
            setLoading(false);
        }
    });

    // Mesaj gösterme fonksiyonu
    function showMessage(message, type) {
        loginMessage.textContent = message;
        loginMessage.className = `message-box ${type}`;
        loginMessage.style.display = 'block';
        
        // 5 saniye sonra mesajı gizle
        setTimeout(() => {
            loginMessage.style.display = 'none';
        }, 5000);
    }

    // Loading durumu
    function setLoading(loading) {
        if (loading) {
            loginBtn.classList.add('loading');
            loginBtn.disabled = true;
        } else {
            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
        }
    }

    // Enter tuşu ile giriş
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });

    // Şifremi unuttum linki
    document.getElementById('forgotPassword').addEventListener('click', function(e) {
        e.preventDefault();
        showMessage('Şifre sıfırlama özelliği yakında eklenecek.', 'info');
    });

    // Sayfa yüklendiğinde kullanıcı zaten giriş yapmış mı kontrol et - GEÇİCİ KAPALI
    // checkLoginStatus();
});

// Kullanıcı giriş durumunu kontrol et
async function checkLoginStatus() {
    try {
        const response = await fetch('php/check_login.php');
        const result = await response.json();
        
        if (result.data.loggedIn) {
            // Kullanıcı zaten giriş yapmış, ana sayfaya yönlendir
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.log('Login durumu kontrol edilemedi:', error);
    }
}
