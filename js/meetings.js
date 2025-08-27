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
    // Event listeners
    document.getElementById('refreshBtn').addEventListener('click', loadMeetings);
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('dateFilter').addEventListener('change', applyFilters);
    document.getElementById('searchFilter').addEventListener('input', debounce(applyFilters, 300));
    
    // İlk yükleme
    loadMeetings();
});

// Toplantıları yükle
function loadMeetings() {
    const meetingsList = document.getElementById('meetingsList');
    
    // Loading göster
    meetingsList.innerHTML = `
        <div class="loading-placeholder">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Toplantılar yükleniyor...</p>
        </div>
    `;
    
    // Gerçek veritabanından yüklenecek (şimdilik boş)
    currentMeetings = [];
    displayMeetings();
}

// Demo toplantı verileri oluştur
function generateDemoMeetings() {
    const statuses = ['planlandi', 'devam_ediyor', 'tamamlandi', 'iptal_edildi'];
    const locations = ['Toplantı Odası A', 'Toplantı Odası B', 'Konferans Salonu', 'Online'];
    const names = [
        'Proje Planlama Toplantısı',
        'Haftalık Değerlendirme',
        'Müşteri Sunumu',
        'Ekip Koordinasyonu',
        'Strateji Belirleme',
        'Kalite Kontrol',
        'Yenilikçilik Çalıştayı',
        'Performans Değerlendirmesi'
    ];
    
    const meetings = [];
    
    for (let i = 1; i <= 25; i++) {
        const date = new Date();
        date.setDate(date.getDate() + Math.floor(Math.random() * 30));
        
        meetings.push({
            id: i,
            name: names[Math.floor(Math.random() * names.length)],
            date: date.toISOString().split('T')[0],
            time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
            location: locations[Math.floor(Math.random() * locations.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            description: `Bu toplantı ${names[Math.floor(Math.random() * names.length)].toLowerCase()} ile ilgilidir.`,
            participants: Math.floor(Math.random() * 8) + 2,
            created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        });
    }
    
    return meetings.sort((a, b) => new Date(a.date) - new Date(b.date));
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
    const statusText = getStatusText(meeting.status);
    const statusClass = `status-${meeting.status}`;
    const formattedDate = formatDate(meeting.date);
    
    return `
        <div class="meeting-card" data-meeting-id="${meeting.id}">
            <div class="meeting-header">
                <h3 class="meeting-title">${meeting.name}</h3>
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
                <span class="participant-count">${meeting.participants} Katılımcı</span>
            </div>
            
            <div class="meeting-actions">
                <button class="btn-view" onclick="viewMeeting(${meeting.id})">
                    <i class="fas fa-eye"></i> Görüntüle
                </button>
                <button class="btn-edit" onclick="editMeeting(${meeting.id})">
                    <i class="fas fa-edit"></i> Düzenle
                </button>
                <button class="btn-delete" onclick="deleteMeeting(${meeting.id})">
                    <i class="fas fa-trash"></i> Sil
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
                filtered = filtered.filter(meeting => meeting.date === today.toISOString().split('T')[0]);
                break;
            case 'tomorrow':
                filtered = filtered.filter(meeting => meeting.date === tomorrow.toISOString().split('T')[0]);
                break;
            case 'this_week':
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                filtered = filtered.filter(meeting => {
                    const meetingDate = new Date(meeting.date);
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
    
    // Arama filtresi
    if (currentFilters.search) {
        const searchTerm = currentFilters.search.toLowerCase();
        filtered = filtered.filter(meeting => 
            meeting.name.toLowerCase().includes(searchTerm) ||
            meeting.location.toLowerCase().includes(searchTerm)
        );
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
    
    modalTitle.textContent = meeting.name;
    
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
            <div class="meeting-detail-label">Durum:</div>
            <div class="meeting-detail-value">
                <span class="meeting-status status-${meeting.status}">${getStatusText(meeting.status)}</span>
            </div>
        </div>
        <div class="meeting-detail-item">
            <div class="meeting-detail-label">Açıklama:</div>
            <div class="meeting-detail-value">${meeting.description}</div>
        </div>
        <div class="meeting-detail-item">
            <div class="meeting-detail-label">Katılımcılar:</div>
            <div class="meeting-detail-value">
                <div class="participants-list">
                    ${generateParticipantList(meeting.participants)}
                </div>
            </div>
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
    document.getElementById('editMeetingName').value = meeting.name;
    document.getElementById('editMeetingDate').value = meeting.date;
    document.getElementById('editMeetingTime').value = meeting.time;
    document.getElementById('editMeetingLocation').value = meeting.location;
    document.getElementById('editMeetingStatus').value = meeting.status;
    document.getElementById('editMeetingDescription').value = meeting.description || '';
    
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
        name: document.getElementById('editMeetingName').value,
        date: document.getElementById('editMeetingDate').value,
        time: document.getElementById('editMeetingTime').value,
        location: document.getElementById('editMeetingLocation').value,
        status: document.getElementById('editMeetingStatus').value,
        description: document.getElementById('editMeetingDescription').value
    };
    
    // Validasyon
    if (!updatedMeeting.name || !updatedMeeting.date || !updatedMeeting.time || !updatedMeeting.location) {
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
    document.getElementById('deleteMeetingName').textContent = meeting.name;
    document.getElementById('deleteConfirmModal').style.display = 'block';
}

// Silme işlemini onayla
function confirmDeleteMeeting() {
    // Toplantıyı listeden kaldır
    currentMeetings = currentMeetings.filter(m => m.id !== currentMeetingId);
    
    // Listeyi yenile
    displayMeetings();
    
    // Modal'ı kapat
    closeDeleteModal();
    
    showNotification('Toplantı başarıyla silindi.', 'success');
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
function getStatusText(status) {
    const statusMap = {
        'planlandi': 'Planlandı',
        'devam_ediyor': 'Devam Ediyor',
        'tamamlandi': 'Tamamlandı',
        'iptal_edildi': 'İptal Edildi'
    };
    return statusMap[status] || status;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function generateParticipantList(count) {
    const names = ['Ahmet Yılmaz', 'Fatma Demir', 'Mehmet Kaya', 'Ayşe Özkan', 'Ali Veli', 'Zeynep Arslan'];
    const emails = ['ahmet@example.com', 'fatma@example.com', 'mehmet@example.com', 'ayse@example.com', 'ali@example.com', 'zeynep@example.com'];
    
    let participantsHTML = '';
    
    for (let i = 0; i < Math.min(count, names.length); i++) {
        const name = names[i];
        const email = emails[i];
        const initials = name.split(' ').map(n => n[0]).join('');
        
        participantsHTML += `
            <div class="participant-item">
                <div class="participant-avatar">${initials}</div>
                <div class="participant-info">
                    <div class="participant-name">${name}</div>
                    <div class="participant-email">${email}</div>
                </div>
            </div>
        `;
    }
    
    return participantsHTML;
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

// Modal dışına tıklandığında kapat
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}
