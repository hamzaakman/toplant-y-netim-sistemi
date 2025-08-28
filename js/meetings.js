// Toplantı Listesi Sayfası JavaScript

let currentMeetings = [];
let currentPage = 1;
let meetingsPerPage = 10;
let currentFilters = {
    status: '',
    date: '',
    search: ''
};

let currentMeetingId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Login kontrolü
    checkLoginStatus();
    
    // Event listeners
    document.getElementById('refreshBtn').addEventListener('click', loadMeetings);
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('dateFilter').addEventListener('change', applyFilters);
    document.getElementById('searchFilter').addEventListener('input', debounce(applyFilters, 300));
    
    // İlk yükleme
    loadMeetings();
    
    // URL'de refresh parametresi varsa otomatik yenile
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('refresh') === 'true') {
        // URL'den parametreyi temizle
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // 1 saniye sonra yenile (sayfa tam yüklensin)
        setTimeout(() => {
            loadMeetings();
            showNotification('Toplantı listesi yenilendi', 'success');
        }, 1000);
    }
    
    // User menu event listeners
    setupUserMenu();
});

// Toplantıları yükle
async function loadMeetings() {
    console.log('loadMeetings() fonksiyonu başladı');
    
    const meetingsList = document.getElementById('meetingsList');
    console.log('meetingsList elementi:', meetingsList);
    
    if (!meetingsList) {
        console.error('meetingsList elementi bulunamadı!');
        return;
    }
    
    // Loading göster
    meetingsList.innerHTML = `
        <div class="loading-placeholder">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Toplantılar yükleniyor...</p>
        </div>
    `;
    
    try {
        console.log('API çağrısı yapılıyor: php/get_meetings.php');
        const response = await fetch('php/get_meetings.php');
        console.log('API yanıtı:', response);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('API sonucu:', result);
        
        if (result.success) {
            currentMeetings = result.data;
            console.log('Toplantılar yüklendi:', currentMeetings);
            displayMeetings();
            showNotification(`${currentMeetings.length} toplantı yüklendi`, 'success');
        } else {
            console.error('Toplantılar yüklenemedi:', result.error);
            showNotification('Toplantılar yüklenirken hata oluştu', 'error');
            currentMeetings = [];
            displayMeetings();
        }
    } catch (error) {
        console.error('Toplantı yükleme hatası:', error);
        showNotification('Toplantılar yüklenirken hata oluştu', 'error');
        currentMeetings = [];
        displayMeetings();
    }
}

// Toplantıları görüntüle
function displayMeetings() {
    const meetingsList = document.getElementById('meetingsList');
    const filteredMeetings = filterMeetings();
    
    if (filteredMeetings.length === 0) {
        meetingsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <h3>Toplantı Bulunamadı</h3>
                <p>Seçilen kriterlere uygun toplantı bulunamadı.</p>
                <button class="btn-primary" onclick="clearFilters()">Filtreleri Temizle</button>
            </div>
        `;
        return;
    }
    
    // Sayfalama
    const totalPages = Math.ceil(filteredMeetings.length / meetingsPerPage);
    const startIndex = (currentPage - 1) * meetingsPerPage;
    const endIndex = startIndex + meetingsPerPage;
    const pageMeetings = filteredMeetings.slice(startIndex, endIndex);
    
    // Toplantı kartlarını oluştur
    const meetingsHTML = pageMeetings.map(meeting => createMeetingCard(meeting)).join('');
    
    meetingsList.innerHTML = meetingsHTML;
    
    // Sayfalama göster
    displayPagination(totalPages);
    
    // Event listener'ları ekle
    addMeetingCardListeners();
}

// Toplantı kartı oluştur
function createMeetingCard(meeting) {
    const formattedDate = formatDate(meeting.date);
    const statusText = getStatusText(meeting.status);
    const statusClass = `status-${meeting.status}`;
    
    return `
        <div class="meeting-card ${statusClass}" data-meeting-id="${meeting.id}">
            <div class="meeting-header">
                <h3 class="meeting-title">${meeting.title}</h3>
                <span class="meeting-status ${statusClass}">${statusText}</span>
            </div>
            
            <div class="meeting-info">
                <div class="meeting-info-item">
                    <i class="fas fa-calendar"></i>
                    <span>${formattedDate}</span>
                </div>
                <div class="meeting-info-item">
                    <i class="fas fa-clock"></i>
                    <span>${meeting.time}</span>
                </div>
                <div class="meeting-info-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${meeting.location}</span>
                </div>
            </div>
            
            <div class="meeting-participants">
                <i class="fas fa-users"></i>
                <span class="participant-count">${meeting.participantCount} Katılımcı</span>
            </div>
            
            <div class="meeting-actions">
                <button class="btn-view" onclick="viewMeeting(${meeting.id})">
                    <i class="fas fa-eye"></i> Görüntüle
                </button>
                <button class="btn-edit" onclick="editMeeting(${meeting.id})" ${meeting.status === 'iptal_edildi' ? 'disabled' : ''}>
                    <i class="fas fa-edit"></i> Düzenle
                </button>
                <button class="btn-cancel" onclick="cancelMeeting(${meeting.id})" ${meeting.status === 'iptal_edildi' ? 'disabled' : ''}>
                    <i class="fas fa-ban"></i> İptal Et
                </button>
            </div>
        </div>
    `;
}

// Filtreleri uygula
function applyFilters() {
    currentFilters.status = document.getElementById('statusFilter').value;
    currentFilters.date = document.getElementById('dateFilter').value;
    currentFilters.search = document.getElementById('searchFilter').value;
    
    currentPage = 1; // İlk sayfaya dön
    displayMeetings();
}

// Toplantıları filtrele
function filterMeetings() {
    let filtered = [...currentMeetings];
    
    // İptal edilen toplantıları gizle (varsayılan olarak)
    filtered = filtered.filter(meeting => meeting.status !== 'iptal_edildi');
    
    // Arama filtresi
    if (currentFilters.search) {
        const searchTerm = currentFilters.search.toLowerCase();
        filtered = filtered.filter(meeting => 
            meeting.title.toLowerCase().includes(searchTerm) ||
            meeting.location.toLowerCase().includes(searchTerm)
        );
    }
    
    // Durum filtresi
    if (currentFilters.status) {
        filtered = filtered.filter(meeting => meeting.status === currentFilters.status);
    }
    
    // Tarih filtresi
    if (currentFilters.date) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        switch (currentFilters.date) {
            case 'today':
                filtered = filtered.filter(meeting => meeting.date === today.toLocaleDateString('tr-TR'));
                break;
            case 'tomorrow':
                filtered = filtered.filter(meeting => meeting.date === tomorrow.toLocaleDateString('tr-TR'));
                break;
            case 'this_week':
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                filtered = filtered.filter(meeting => {
                    const meetingDate = new Date(meeting.datetime);
                    return meetingDate >= weekStart && meetingDate <= weekEnd;
                });
                break;
            case 'this_month':
                filtered = filtered.filter(meeting => {
                    const meetingDate = new Date(meeting.date);
                    return meetingDate.getMonth() === today.getMonth() && 
                           meetingDate.getFullYear() === today.getFullYear();
                });
                break;
        }
    }
    
    return filtered;
}

// Filtreleri temizle
function clearFilters() {
    document.getElementById('statusFilter').value = '';
    document.getElementById('dateFilter').value = '';
    document.getElementById('searchFilter').value = '';
    
    currentFilters = { status: '', date: '', search: '' };
    currentPage = 1;
    displayMeetings();
}

// Sayfalama göster
function displayPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Önceki sayfa
    paginationHTML += `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Sayfa numaraları
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            paginationHTML += `
                <button onclick="changePage(${i})" class="${i === currentPage ? 'active' : ''}">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHTML += '<span>...</span>';
        }
    }
    
    // Sonraki sayfa
    paginationHTML += `
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// Sayfa değiştir
function changePage(page) {
    currentPage = page;
    displayMeetings();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Toplantı görüntüle
function viewMeeting(meetingId) {
    const meeting = currentMeetings.find(m => m.id === meetingId);
    if (!meeting) return;
    
    currentMeetingId = meetingId;
    
    const modal = document.getElementById('meetingDetailModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = meeting.title;
    
    modalBody.innerHTML = `
        <div class="meeting-detail-item">
            <div class="meeting-detail-label">Tarih:</div>
            <div class="meeting-detail-value">${formatDate(meeting.date)}</div>
        </div>
        <div class="meeting-detail-item">
            <div class="meeting-detail-label">Saat:</div>
            <div class="meeting-detail-value">${meeting.time}</div>
        </div>
        <div class="meeting-detail-item">
            <div class="meeting-detail-label">Yer:</div>
            <div class="meeting-detail-value">${meeting.location}</div>
        </div>
        <div class="meeting-detail-item">
            <div class="meeting-detail-label">Katılımcılar:</div>
            <div class="meeting-detail-value">${meeting.participantCount} kişi</div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Toplantı düzenle
function editMeeting(meetingId) {
    const meeting = currentMeetings.find(m => m.id === meetingId);
    if (!meeting) return;
    
    currentMeetingId = meetingId;
    
    // Form alanlarını doldur
    document.getElementById('editMeetingName').value = meeting.title;
    document.getElementById('editMeetingDate').value = meeting.date;
    document.getElementById('editMeetingTime').value = meeting.time;
    document.getElementById('editMeetingLocation').value = meeting.location;
    
    // Modal'ı göster
    document.getElementById('editMeetingModal').style.display = 'block';
}

// Toplantı değişikliklerini kaydet
function saveMeetingChanges() {
    const meeting = currentMeetings.find(m => m.id === currentMeetingId);
    if (!meeting) return;
    
    // Form verilerini al
    const updatedMeeting = {
        ...meeting,
        title: document.getElementById('editMeetingName').value,
        date: document.getElementById('editMeetingDate').value,
        time: document.getElementById('editMeetingTime').value,
        location: document.getElementById('editMeetingLocation').value
    };
    
    // Validasyon
    if (!updatedMeeting.title || !updatedMeeting.date || !updatedMeeting.time || !updatedMeeting.location) {
        showNotification('Lütfen tüm zorunlu alanları doldurun.', 'error');
        return;
    }
    
    // Toplantıyı güncelle
    const index = currentMeetings.findIndex(m => m.id === currentMeetingId);
    currentMeetings[index] = updatedMeeting;
    
    // Listeyi yenile
    displayMeetings();
    
    // Modal'ı kapat
    closeEditModal();
    
    showNotification('Toplantı başarıyla güncellendi.', 'success');
}

// Toplantı sil
function deleteMeeting(meetingId) {
    const meeting = currentMeetings.find(m => m.id === meetingId);
    if (!meeting) return;
    
    currentMeetingId = meetingId;
    
    // Silme onay modal'ını göster
    document.getElementById('deleteMeetingName').textContent = meeting.title;
    document.getElementById('deleteConfirmModal').style.display = 'block';
}

// Silme işlemini onayla
async function confirmDeleteMeeting() {
    try {
        console.log('confirmDeleteMeeting çağrıldı, meetingId:', currentMeetingId);
        
        // Toplantı durumunu 'iptal_edildi' olarak güncelle
        const response = await fetch('php/update_meeting_status.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                meetingId: currentMeetingId,
                status: 'iptal_edildi'
            })
        });
        
        console.log('API yanıtı:', response);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('API sonucu:', result);
        
        if (result.success) {
            // Toplantı listesini yenile
            loadMeetings();
            
            // Modal'ı kapat
            closeDeleteModal();
            
            // Başarılı bildirim göster
            alert('✅ Toplantı başarıyla iptal edildi.');
        } else {
            // Hata bildirimi göster
            alert('❌ ' + (result.message || 'Toplantı iptal edilemedi'));
        }
        
    } catch (error) {
        console.error('Toplantı iptal hatası:', error);
        showNotification('Toplantı iptal edilirken hata oluştu', 'error');
    }
}

// Modal'ları kapat
function closeModal() {
    document.getElementById('meetingDetailModal').style.display = 'none';
}

function closeEditModal() {
    document.getElementById('editMeetingModal').style.display = 'none';
}

function closeDeleteModal() {
    document.getElementById('deleteConfirmModal').style.display = 'none';
}

// Yardımcı fonksiyonlar
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Debounce fonksiyonu
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

// Toplantı kartı event listener'larını ekle
function addMeetingCardListeners() {
    console.log('Toplantı kartı event listener\'ları eklendi');
}

// Toplantı durum metni
function getStatusText(status) {
    const statusTexts = {
        'aktif': 'Aktif',
        'iptal_edildi': 'İptal Edildi',
        'tamamlandi': 'Tamamlandı'
    };
    return statusTexts[status] || 'Aktif';
}

// Toplantıyı iptal et
async function cancelMeeting(meetingId) {
    console.log('cancelMeeting çağrıldı, meetingId:', meetingId);
    
    // Özel onay modal'ını göster
    showCancelConfirmModal(meetingId);
}

// İptal onay modal'ını göster
function showCancelConfirmModal(meetingId) {
    const modal = document.getElementById('cancelConfirmModal');
    const meetingName = document.getElementById('cancelMeetingName');
    
    // Toplantı adını bul
    const meeting = currentMeetings.find(m => m.id === meetingId);
    if (meeting) {
        meetingName.textContent = meeting.title;
    }
    
    // Modal'ı göster
    modal.style.display = 'block';
    
    // Modal'ı kapatma butonlarına event listener ekle
    document.getElementById('confirmCancelBtn').onclick = () => {
        performCancelMeeting(meetingId);
        closeCancelConfirmModal();
    };
    
    document.getElementById('cancelCancelBtn').onclick = closeCancelConfirmModal;
}

// İptal onay modal'ını kapat
function closeCancelConfirmModal() {
    document.getElementById('cancelConfirmModal').style.display = 'none';
}

// Toplantı iptal işlemini gerçekleştir
async function performCancelMeeting(meetingId) {
    try {
        console.log('API çağrısı yapılıyor...');
        const response = await fetch('php/update_meeting_status.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                meetingId: meetingId,
                status: 'iptal_edildi'
            })
        });
        
        console.log('API yanıtı:', response);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('API sonucu:', result);
        
        if (result.success) {
            // Başarılı bildirim göster
            showCustomNotification('✅ ' + result.message, 'success');
            // Toplantı listesini yenile
            loadMeetings();
        } else {
            // Hata bildirimi göster
            showCustomNotification('❌ ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Toplantı iptal hatası:', error);
        // Hata bildirimi göster
        showCustomNotification('❌ Toplantı iptal edilirken hata oluştu: ' + error.message, 'error');
    }
}

// Özel bildirim göster
function showCustomNotification(message, type = 'info') {
    // Mevcut bildirimleri temizle
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Yeni bildirim oluştur
    const notification = document.createElement('div');
    notification.className = `custom-notification custom-notification-${type}`;
    notification.innerHTML = `
        <div class="custom-notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="custom-notification-close" onclick="this.parentElement.remove()">
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

// Modal dışına tıklandığında kapat
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
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
        updateUserInfo(result.user);
        
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
                    showCustomNotification('Çıkış yapılırken bir hata oluştu', 'error');
                }
            } catch (error) {
                console.error('Çıkış hatası:', error);
                showCustomNotification('Çıkış yapılırken bir hata oluştu', 'error');
            }
        });
    }
}
