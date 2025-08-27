// Toplantı Yönetim Sistemi - Ana Sayfa JavaScript

let existingParticipants = [];
let newEmails = [];

document.addEventListener('DOMContentLoaded', function() {
    // Mevcut katılımcıları yükle
    loadExistingParticipants();
    
    // Event listeners
    document.getElementById('addEmailBtn').addEventListener('click', addNewEmail);
    document.getElementById('cancelBtn').addEventListener('click', resetForm);
    document.getElementById('meetingForm').addEventListener('submit', handleFormSubmit);
    
    // Arama input event listener
    const searchInput = document.getElementById('participantSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterParticipants, 300));
    }
});

// Mevcut katılımcıları yükle
async function loadExistingParticipants() {
    try {
        const response = await fetch('php/get_participants.php');
        const result = await response.json();
        
        if (result.success) {
            existingParticipants = result.data;
            displayExistingParticipants(existingParticipants);
        } else {
            console.error('Katılımcılar yüklenemedi:', result.error);
            showNotification('Katılımcılar yüklenirken hata oluştu', 'error');
        }
    } catch (error) {
        console.error('Katılımcı yükleme hatası:', error);
        showNotification('Katılımcılar yüklenirken hata oluştu', 'error');
    }
}

// Mevcut katılımcıları görüntüle
function displayExistingParticipants(participants) {
    const select = document.getElementById('existingParticipants');
    
    // Select'i temizle ve yeni seçenekler ekle
    select.innerHTML = '';
    
    if (participants.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Henüz katılımcı bulunmuyor';
        option.disabled = true;
        select.appendChild(option);
    } else {
        participants.forEach(participant => {
            const option = document.createElement('option');
            option.value = participant.katilimci_id;
            option.textContent = `${participant.ad_soyad} (${participant.e_posta}) - ${participant.departman || 'Departman belirtilmemiş'}`;
            select.appendChild(option);
        });
    }
    
    // Katılımcı sayısını göster
    const countSpan = document.getElementById('participantCount');
    if (countSpan) {
        countSpan.textContent = `${participants.length} katılımcı bulundu`;
    }
}

// Katılımcıları filtrele
function filterParticipants() {
    const searchTerm = document.getElementById('participantSearch').value.toLowerCase();
    
    if (!searchTerm) {
        displayExistingParticipants(existingParticipants);
        return;
    }
    
    const filtered = existingParticipants.filter(participant => 
        participant.ad_soyad.toLowerCase().includes(searchTerm) ||
        participant.e_posta.toLowerCase().includes(searchTerm) ||
        (participant.departman && participant.departman.toLowerCase().includes(searchTerm))
    );
    
    displayExistingParticipants(filtered);
    
    // Filtrelenmiş sonuç sayısını güncelle
    const countSpan = document.getElementById('participantCount');
    if (countSpan) {
        if (searchTerm) {
            countSpan.textContent = `${filtered.length} katılımcı bulundu (${existingParticipants.length} toplam)`;
        } else {
            countSpan.textContent = `${filtered.length} katılımcı bulundu`;
        }
    }
}

// Yeni e-posta ekle
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
    
    if (newEmails.includes(email)) {
        showNotification('Bu e-posta zaten eklenmiş', 'warning');
        return;
    }
    
    // Mevcut katılımcılarda kontrol et
    const existingParticipant = existingParticipants.find(p => p.e_posta === email);
    if (existingParticipant) {
        showNotification('Bu e-posta zaten mevcut katılımcılarda bulunuyor', 'info');
        return;
    }
    
    newEmails.push(email);
    displayNewEmails();
    emailInput.value = '';
    
    showNotification('E-posta eklendi', 'success');
}

// Yeni e-postaları görüntüle
function displayNewEmails() {
    const emailsList = document.getElementById('newEmailsList');
    
    if (newEmails.length === 0) {
        emailsList.innerHTML = '<p class="no-emails">Henüz yeni e-posta eklenmedi</p>';
        return;
    }
    
    const emailsHTML = newEmails.map(email => `
        <div class="email-tag">
            <span>${email}</span>
            <button type="button" class="remove-email" onclick="removeEmail('${email}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    
    emailsList.innerHTML = emailsHTML;
}

// E-posta kaldır
function removeEmail(email) {
    newEmails = newEmails.filter(e => e !== email);
    displayNewEmails();
    showNotification('E-posta kaldırıldı', 'info');
}

// E-posta validasyonu
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Form gönderimi
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Form verilerini topla
    const formData = new FormData(event.target);
    
    // Seçili mevcut katılımcıları ekle
    const selectedParticipants = Array.from(document.getElementById('existingParticipants').selectedOptions)
        .map(option => option.value);
    
    // Yeni e-postaları ekle
    newEmails.forEach(email => {
        formData.append('newEmails[]', email);
    });
    
    // Seçili mevcut katılımcıları ekle
    selectedParticipants.forEach(id => {
        formData.append('existingParticipants[]', id);
    });
    
    try {
        // Loading göster
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
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
            
            // 3 saniye sonra toplantı listesi sayfasına yönlendir
            setTimeout(() => {
                window.location.href = 'meetings.html';
            }, 3000);
        } else {
            showNotification(result.message || 'Toplantı oluşturulamadı', 'error');
        }
        
    } catch (error) {
        console.error('Form gönderim hatası:', error);
        showNotification('Toplantı oluşturulurken bir hata oluştu', 'error');
    } finally {
        // Loading'i kaldır
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
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
