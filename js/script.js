// Toplantı Yönetim Sistemi Ana JavaScript

let newEmails = [];
let existingParticipants = [];

document.addEventListener('DOMContentLoaded', function() {
    // Login kontrolü - GEÇİCİ OLARAK KAPALI
    // checkLoginStatus();
    
    // Event listeners
    document.getElementById('meetingForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('newParticipantEmail').addEventListener('keypress', handleEmailKeypress);
    document.getElementById('addEmailBtn').addEventListener('click', addNewEmail);
    document.getElementById('addSelectedBtn').addEventListener('click', addSelectedParticipants);
    document.getElementById('existingParticipants').addEventListener('change', handleParticipantSelection);
    document.getElementById('meetingLocation').addEventListener('change', handleLocationChange);
    
    // Hızlı e-posta kartlarını ayarla
    setupQuickEmailCards();
    
    // Mevcut katılımcıları yükle
    loadExistingParticipants();
    
    // User menu event listeners
    setupUserMenu();
});

// E-posta ekleme
function addNewEmail() {
    const emailInput = document.getElementById('newParticipantEmail');
    const email = emailInput.value.trim();
    
    if (!email) {
        showNotification('Lütfen bir e-posta adresi girin', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Geçerli bir e-posta adresi girin', 'error');
        return;
    }
    
    // E-posta zaten eklenmiş mi kontrol et
    if (newEmails.some(e => e.email === email)) {
        showNotification('Bu e-posta adresi zaten eklenmiş', 'warning');
        return;
    }
    
    // E-posta adresinden isim oluştur
    const formattedName = formatNameFromEmail(email);
    
    // Yeni e-postayı ekle
    newEmails.push({
        email: email,
        name: formattedName,
        isExisting: false
    });
    
    // E-posta listesini güncelle
    displayNewEmails();
    
    // Input'u temizle
    emailInput.value = '';
    
    showNotification('E-posta adresi eklendi', 'success');
}

// E-posta adresinden isim oluştur
function formatNameFromEmail(email) {
    const username = email.split('@')[0];
    
    // Yaygın ayırıcıları kullanarak kelimeleri ayır
    const words = username.split(/[._-]/);
    
    // Her kelimenin ilk harfini büyük yap
    const formattedWords = words.map(word => {
        if (word.length > 0) {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        return word;
    });
    
    return formattedWords.join(' ');
}

// E-posta validasyonu
function isValidEmail(email) {
    // Basit ama etkili e-posta validasyonu
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
        return false;
    }
    
    const [localPart, domain] = email.split('@');
    
    // Local part kontrolü
    if (localPart.length < 1 || localPart.length > 64) {
        return false;
    }
    
    // Domain kontrolü
    if (domain.length < 3 || domain.length > 253) {
        return false;
    }
    
    // TLD kontrolü
    const domainParts = domain.split('.');
    if (domainParts.length < 2) {
        return false;
    }
    
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2 || tld.length > 6) {
        return false;
    }
    
    return true;
}

// E-posta listesini görüntüle
function displayNewEmails() {
    const emailList = document.getElementById('newEmailsList');
    
    if (newEmails.length === 0) {
        emailList.innerHTML = '<p class="no-emails">Henüz e-posta eklenmedi</p>';
        return;
    }
    
    const emailHTML = newEmails.map(email => `
        <div class="email-tag">
            <span class="email-name">${email.name}</span>
            <button type="button" class="remove-email" onclick="removeEmail('${email.email}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    
    emailList.innerHTML = emailHTML;
}

// E-posta kaldır
function removeEmail(emailToRemove) {
    newEmails = newEmails.filter(email => email.email !== emailToRemove);
    displayNewEmails();
}

// E-posta input keypress handler
function handleEmailKeypress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addNewEmail();
    }
}

// Mevcut katılımcıları yükle
async function loadExistingParticipants() {
    const participantsList = document.getElementById('existingParticipants');
    
    try {
        const response = await fetch('php/get_participants.php');
        const result = await response.json();
        
        if (result.success) {
            existingParticipants = result.data;
            displayExistingParticipants();
        } else {
            console.error('Katılımcılar yüklenemedi:', result.error);
        }
    } catch (error) {
        console.error('Katılımcı yükleme hatası:', error);
    }
}

// Mevcut katılımcıları görüntüle
function displayExistingParticipants() {
    const participantsList = document.getElementById('existingParticipants');
    
    if (existingParticipants.length === 0) {
        participantsList.innerHTML = '<option value="">Katılımcı bulunamadı</option>';
        return;
    }
    
    const optionsHTML = existingParticipants.map(participant => {
        const formattedName = formatNameFromEmail(participant.e_posta);
        return `<option value="${participant.katilimci_id}">${formattedName} (${participant.e_posta})</option>`;
    }).join('');
    
    participantsList.innerHTML = optionsHTML;
}

// Katılımcı seçimi handler
function handleParticipantSelection(event) {
    const selectedOptions = Array.from(document.getElementById('existingParticipants').selectedOptions);
    const addButton = document.getElementById('addSelectedBtn');
    
    if (selectedOptions.length > 0) {
        addButton.style.display = 'block';
        addButton.textContent = `${selectedOptions.length} Katılımcıyı Ekle`;
    } else {
        addButton.style.display = 'none';
    }
}

// Toplantı yeri değişikliği
function handleLocationChange() {
    const locationSelect = document.getElementById('meetingLocation');
    const customLocationGroup = document.getElementById('customLocationGroup');
    const customLocationInput = document.getElementById('customLocation');
    
    if (locationSelect.value === 'Diğer') {
        customLocationGroup.style.display = 'block';
        customLocationInput.required = true;
        customLocationInput.focus();
    } else {
        customLocationGroup.style.display = 'none';
        customLocationInput.required = false;
        customLocationInput.value = '';
    }
}

// Seçilen katılımcıları ekle
function addSelectedParticipants() {
    const selectElement = document.getElementById('existingParticipants');
    const selectedOptions = Array.from(selectElement.selectedOptions);
    
    if (selectedOptions.length === 0) {
        showNotification('Lütfen en az bir katılımcı seçin', 'warning');
        return;
    }
    
    selectedOptions.forEach(option => {
        const participantId = option.value;
        const participant = existingParticipants.find(p => p.katilimci_id == participantId);
        
        if (participant && !newEmails.some(e => e.email === participant.e_posta)) {
            const formattedName = formatNameFromEmail(participant.e_posta);
            
            newEmails.push({
                email: participant.e_posta,
                name: formattedName,
                isExisting: true,
                participantId: participant.katilimci_id
            });
        }
    });
    
    // E-posta listesini güncelle
    displayNewEmails();
    
    // Seçimleri temizle
    selectElement.selectedIndex = -1;
    
    showNotification(`${selectedOptions.length} katılımcı eklendi`, 'success');
}

// Form gönderimi
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Form verilerini topla
    const formData = new FormData(event.target);
    
    // Özel yer kontrolü
    const locationSelect = document.getElementById('meetingLocation');
    const customLocationInput = document.getElementById('customLocation');
    
    if (locationSelect.value === 'Diğer') {
        if (!customLocationInput.value.trim()) {
            showNotification('Lütfen özel yer adını girin', 'error');
            customLocationInput.focus();
            return;
        }
        // Özel yeri form data'ya ekle
        formData.set('meetingLocation', customLocationInput.value.trim());
    }
    
    // Seçili mevcut katılımcıları ekle
    const selectedParticipants = Array.from(document.getElementById('existingParticipants').selectedOptions)
        .map(option => option.value);
    
    // Yeni e-postaları ekle
    newEmails.forEach(email => {
        formData.append('newEmails[]', email.email);
    });
    
    // Seçili mevcut katılımcıları ekle
    selectedParticipants.forEach(id => {
        formData.append('existingParticipants[]', id);
    });
    
    let submitBtn = null;
    let originalText = '';
    
    try {
        // Loading göster
        submitBtn = event.target.querySelector('button[type="submit"]');
        originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor...';
        submitBtn.disabled = true;
        
        const response = await fetch('php/create_meeting.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Toplantı başarıyla oluşturuldu!', 'success');
            resetForm();
            
            // 3 saniye sonra toplantı listesi sayfasına yönlendir ve yenile
            setTimeout(() => {
                window.location.href = 'meetings.html?refresh=true';
            }, 3000);
        } else {
            showNotification(result.message || 'Toplantı oluşturulamadı', 'error');
        }
        
    } catch (error) {
        console.error('Form gönderim hatası:', error);
        showNotification('Toplantı oluşturulurken bir hata oluştu', 'error');
    } finally {
        // Loading'i kaldır
        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
}

// Formu sıfırla
function resetForm() {
    document.getElementById('meetingForm').reset();
    newEmails = [];
    displayNewEmails();
    loadExistingParticipants(); // Katılımcıları yeniden yükle
}

// Yardımcı fonksiyonlar
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Bildirim göster
function showNotification(message, type = 'info') {
    // Mevcut bildirimleri temizle
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Yeni bildirim oluştur
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Bildirimi sayfaya ekle
    document.body.appendChild(notification);
    
    // Otomatik kaldırma
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Bildirim ikonu belirleme
function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Hızlı e-posta kartlarını ayarla
function setupQuickEmailCards() {
    const emailCards = document.querySelectorAll('.email-provider-card');
    
    emailCards.forEach(card => {
        card.addEventListener('click', function() {
            const domain = this.getAttribute('data-domain');
            const emailInput = document.getElementById('newParticipantEmail');
            
            // Eğer input'ta sadece kullanıcı adı varsa, domain'i ekle
            const currentValue = emailInput.value.trim();
            if (currentValue && !currentValue.includes('@')) {
                emailInput.value = currentValue + domain;
            } else if (!currentValue) {
                // Input boşsa, sadece domain'i ekle
                emailInput.value = domain;
            }
            
            // Input'a focus ol
            emailInput.focus();
            
            // Kart'a tıklama animasyonu
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

// Login kontrolü
async function checkLoginStatus() {
    try {
        const response = await fetch('php/check_login.php');
        const result = await response.json();
        
        if (!result.data.loggedIn) {
            // Kullanıcı giriş yapmamış, login sayfasına yönlendir
            window.location.href = 'login.html';
            return;
        }
        
        // Kullanıcı bilgilerini güncelle
        updateUserInfo(result.data.user);
        
    } catch (error) {
        console.error('Login durumu kontrol edilemedi:', error);
        // Hata durumunda login sayfasına yönlendir
        window.location.href = 'login.html';
    }
}

// Kullanıcı bilgilerini güncelle
function updateUserInfo(user) {
    const usernameElement = document.getElementById('currentUsername');
    const userMenuText = document.getElementById('userMenuText');
    
    if (usernameElement) usernameElement.textContent = user.username;
    if (userMenuText) userMenuText.textContent = user.username;
}

// User menu ayarları
function setupUserMenu() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdownMenu = document.getElementById('userDropdownMenu');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // User menu toggle
    if (userMenuBtn && userDropdownMenu) {
        userMenuBtn.addEventListener('click', function() {
            userDropdownMenu.classList.toggle('show');
        });
    }
    
    // Dropdown dışına tıklandığında kapat
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.user-dropdown')) {
            if (userDropdownMenu) {
                userDropdownMenu.classList.remove('show');
            }
        }
    });
    
    // Çıkış yap
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            try {
                const response = await fetch('php/logout.php');
                const result = await response.json();
                
                if (result.success) {
                    // Başarılı çıkış sonrası login sayfasına yönlendir
                    window.location.href = 'login.html';
                } else {
                    showNotification('Çıkış yapılırken bir hata oluştu', 'error');
                }
            } catch (error) {
                console.error('Çıkış hatası:', error);
                showNotification('Çıkış yapılırken bir hata oluştu', 'error');
            }
        });
    }
}
