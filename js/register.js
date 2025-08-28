document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const passwordToggle = document.getElementById('passwordToggle');
    const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const registerMessage = document.getElementById('registerMessage');
    const registerBtn = document.querySelector('.login-btn');

    // Şifre göster/gizle
    passwordToggle.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        const icon = this.querySelector('i');
        icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    });

    confirmPasswordToggle.addEventListener('click', function() {
        const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmPasswordInput.setAttribute('type', type);
        
        const icon = this.querySelector('i');
        icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    });

    // Form validasyonu
    function validateForm() {
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const role = document.getElementById('role').value;
        const termsAccepted = document.getElementById('termsAccepted').checked;

        // Hata mesajlarını temizle
        clearErrors();

        let isValid = true;

        // Kullanıcı adı validasyonu
        if (username.length < 3 || username.length > 20) {
            showFieldError('username', 'Kullanıcı adı 3-20 karakter arası olmalıdır.');
            isValid = false;
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            showFieldError('username', 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir.');
            isValid = false;
        }

        // E-posta validasyonu
        if (!isValidEmail(email)) {
            showFieldError('email', 'Geçerli bir e-posta adresi giriniz.');
            isValid = false;
        }

        // Şifre validasyonu
        if (password.length < 8) {
            showFieldError('password', 'Şifre en az 8 karakter olmalıdır.');
            isValid = false;
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
            showFieldError('password', 'Şifre büyük/küçük harf, rakam ve özel karakter içermelidir.');
            isValid = false;
        }

        // Şifre tekrar validasyonu
        if (password !== confirmPassword) {
            showFieldError('confirmPassword', 'Şifreler eşleşmiyor.');
            isValid = false;
        }

        // Rol validasyonu
        if (!role) {
            showFieldError('role', 'Lütfen bir rol seçiniz.');
            isValid = false;
        }

        // Şartlar kabul edildi mi
        if (!termsAccepted) {
            showFieldError('termsAccepted', 'Kullanım şartlarını kabul etmelisiniz.');
            isValid = false;
        }

        return isValid;
    }

    // E-posta formatı kontrolü
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Alan hatası gösterme
    function showFieldError(fieldName, message) {
        const field = document.getElementById(fieldName);
        const formGroup = field.closest('.form-group');
        
        formGroup.classList.add('error');
        
        // Hata mesajı ekle
        let errorElement = formGroup.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('small');
            errorElement.className = 'field-error';
            formGroup.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    // Hataları temizle
    function clearErrors() {
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
        });
        
        document.querySelectorAll('.field-error').forEach(error => {
            error.remove();
        });
    }

    // Form gönderimi
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        // Form verilerini al
        const formData = new FormData(registerForm);
        const userData = {
            username: formData.get('username').trim(),
            email: formData.get('email').trim(),
            password: formData.get('password'),
            role: formData.get('role')
        };

        // Loading durumu
        setLoading(true);

        try {
            const response = await fetch('php/register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const result = await response.json();

            if (result.success) {
                showMessage(result.message, 'success');
                
                // Başarılı kayıt sonrası login sayfasına yönlendirme
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                showMessage(result.message, 'error');
            }
        } catch (error) {
            console.error('Kayıt hatası:', error);
            showMessage('Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.', 'error');
        } finally {
            setLoading(false);
        }
    });

    // Mesaj gösterme fonksiyonu
    function showMessage(message, type) {
        registerMessage.textContent = message;
        registerMessage.className = `message-box ${type}`;
        registerMessage.style.display = 'block';
        
        // 5 saniye sonra mesajı gizle
        setTimeout(() => {
            registerMessage.style.display = 'none';
        }, 5000);
    }

    // Loading durumu
    function setLoading(loading) {
        if (loading) {
            registerBtn.classList.add('loading');
            registerBtn.disabled = true;
        } else {
            registerBtn.classList.remove('loading');
            registerBtn.disabled = false;
        }
    }

    // Enter tuşu ile kayıt
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            registerForm.dispatchEvent(new Event('submit'));
        }
    });

    // Gerçek zamanlı validasyon
    document.getElementById('username').addEventListener('blur', function() {
        const username = this.value.trim();
        if (username && (username.length < 3 || username.length > 20 || !/^[a-zA-Z0-9_]+$/.test(username))) {
            showFieldError('username', 'Kullanıcı adı 3-20 karakter arası olmalıdır ve sadece harf, rakam ve alt çizgi içerebilir.');
        } else {
            clearFieldError('username');
        }
    });

    document.getElementById('email').addEventListener('blur', function() {
        const email = this.value.trim();
        if (email && !isValidEmail(email)) {
            showFieldError('email', 'Geçerli bir e-posta adresi giriniz.');
        } else {
            clearFieldError('email');
        }
    });

    passwordInput.addEventListener('blur', function() {
        const password = this.value;
        if (password && password.length < 8) {
            showFieldError('password', 'Şifre en az 8 karakter olmalıdır.');
        } else if (password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
            showFieldError('password', 'Şifre büyük/küçük harf, rakam ve özel karakter içermelidir.');
        } else {
            clearFieldError('password');
        }
    });

    confirmPasswordInput.addEventListener('blur', function() {
        const password = passwordInput.value;
        const confirmPassword = this.value;
        if (confirmPassword && password !== confirmPassword) {
            showFieldError('confirmPassword', 'Şifreler eşleşmiyor.');
        } else {
            clearFieldError('confirmPassword');
        }
    });

    // Alan hatasını temizle
    function clearFieldError(fieldName) {
        const field = document.getElementById(fieldName);
        const formGroup = field.closest('.form-group');
        
        formGroup.classList.remove('error');
        
        const errorElement = formGroup.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    // Sayfa yüklendiğinde kullanıcı zaten giriş yapmış mı kontrol et
    checkLoginStatus();
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
