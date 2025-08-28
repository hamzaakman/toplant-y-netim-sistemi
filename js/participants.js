// Katılımcı Yönetimi Sayfası JavaScript

let currentParticipants = [];
let currentPage = 1;
let participantsPerPage = 10;
let currentFilters = {
    search: '',
    status: '',
    sort: 'ad_asc'
};

let currentParticipantId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Login kontrolü - GEÇİCİ OLARAK KAPALI
    // checkLoginStatus();
    
    // Event listeners
    document.getElementById('refreshBtn').addEventListener('click', loadParticipants);
    document.getElementById('addParticipantBtn').addEventListener('click', openAddModal);
    document.getElementById('searchFilter').addEventListener('input', debounce(applyFilters, 300));
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('sortFilter').addEventListener('change', applyFilters);
    
    // İlk yükleme
    loadParticipants();
    
    // Hızlı e-posta kartları event listener'ları
    setupQuickEmailCards();
    
    // User menu event listeners
    setupUserMenu();
});

// Katılımcıları yükle
async function loadParticipants() {
    const participantsList = document.getElementById('participantsList');
    
    // Loading göster
    participantsList.innerHTML = `
        <div class="loading-placeholder">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Katılımcılar yükleniyor...</p>
        </div>
    `;
    
    try {
        // Gerçek API'den katılımcıları yükle
        const response = await fetch('php/get_participants.php');
        const result = await response.json();
        
        if (result.success) {
            currentParticipants = result.data;
            displayParticipants();
        } else {
            // Hata durumunda boş liste göster
            console.error('Katılımcılar yüklenemedi:', result.error);
            currentParticipants = [];
            displayParticipants();
            showNotification('Katılımcılar yüklenemedi: ' + result.error, 'error');
        }
    } catch (error) {
        // Hata durumunda boş liste göster
        console.error('Katılımcı yükleme hatası:', error);
        currentParticipants = [];
        displayParticipants();
        showNotification('Bağlantı hatası: ' + error.message, 'error');
    }
}

// Demo veriler kaldırıldı - Artık sadece gerçek veritabanı kullanılıyor

// Katılımcıları görüntüle
function displayParticipants() {
    const participantsList = document.getElementById('participantsList');
    const filteredParticipants = filterParticipants();
    
    if (filteredParticipants.length === 0) {
        participantsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-slash"></i>
                <h3>Katılımcı Bulunamadı</h3>
                <p>Seçilen kriterlere uygun katılımcı bulunamadı.</p>
                <button class="btn-primary" onclick="clearFilters()">Filtreleri Temizle</button>
            </div>
        `;
        return;
    }
    
    // Sayfalama
    const totalPages = Math.ceil(filteredParticipants.length / participantsPerPage);
    const startIndex = (currentPage - 1) * participantsPerPage;
    const endIndex = startIndex + participantsPerPage;
    const pageParticipants = filteredParticipants.slice(startIndex, endIndex);
    
    // Katılımcı kartlarını oluştur
    const participantsHTML = pageParticipants.map(participant => createParticipantCard(participant)).join('');
    
    participantsList.innerHTML = participantsHTML;
    
    // Sayfalama göster
    displayPagination(totalPages);
    
    // Event listener'ları ekle
    addParticipantCardListeners();
}

// Katılımcı kartı oluştur
function createParticipantCard(participant) {
    const statusClass = participant.durum === 'aktif' ? 'status-aktif' : 'status-pasif';
    const statusText = participant.durum === 'aktif' ? 'Aktif' : 'Pasif';
    const lastMeetingText = participant.son_topanti ? 
        new Date(participant.son_topanti).toLocaleDateString('tr-TR') : 'Henüz toplantı yok';
    
    return `
        <div class="participant-card" data-participant-id="${participant.katilimci_id}">
            <div class="participant-header">
                <div class="participant-info">
                    <h3 class="participant-name">${participant.ad_soyad}</h3>
                    <p class="participant-email">${participant.e_posta}</p>
                </div>
                <span class="participant-status ${statusClass}">${statusText}</span>
            </div>
            
            <div class="participant-details">
                <div class="participant-detail-item">
                    <i class="fas fa-building"></i>
                    <span>${participant.departman}</span>
                </div>
                <div class="participant-detail-item">
                    <i class="fas fa-briefcase"></i>
                    <span>${participant.pozisyon}</span>
                </div>
                <div class="participant-detail-item">
                    <i class="fas fa-phone"></i>
                    <span>${participant.telefon}</span>
                </div>
            </div>
            
            <div class="participant-stats">
                <div class="stat-item meetings-count">
                    <i class="fas fa-calendar-check"></i>
                    <span>${participant.toplantilar_sayisi} Toplantı</span>
                </div>
                <div class="stat-item last-meeting">
                    <i class="fas fa-clock"></i>
                    <span>Son: ${lastMeetingText}</span>
                </div>
            </div>
            
            <div class="participant-actions">
                <button class="btn-view" onclick="viewParticipant(${participant.katilimci_id})">
                    <i class="fas fa-eye"></i> Görüntüle
                </button>
                <button class="btn-edit" onclick="editParticipant(${participant.katilimci_id})">
                    <i class="fas fa-edit"></i> Düzenle
                </button>
                <button class="btn-delete" onclick="deleteParticipant(${participant.katilimci_id})">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </div>
        </div>
    `;
}

// Filtreleri uygula
function applyFilters() {
    currentFilters.search = document.getElementById('searchFilter').value;
    currentFilters.status = document.getElementById('statusFilter').value;
    currentFilters.sort = document.getElementById('sortFilter').value;
    
    currentPage = 1; // İlk sayfaya dön
    displayParticipants();
}

// Katılımcıları filtrele
function filterParticipants() {
    let filtered = [...currentParticipants];
    
    // Arama filtresi
    if (currentFilters.search) {
        const searchTerm = currentFilters.search.toLowerCase();
        filtered = filtered.filter(participant => 
            participant.ad_soyad.toLowerCase().includes(searchTerm) ||
            participant.e_posta.toLowerCase().includes(searchTerm) ||
            participant.departman.toLowerCase().includes(searchTerm)
        );
    }
    
    // Durum filtresi
    if (currentFilters.status) {
        filtered = filtered.filter(participant => participant.durum === currentFilters.status);
    }
    
    // Sıralama
    switch (currentFilters.sort) {
        case 'ad_asc':
            filtered.sort((a, b) => a.ad_soyad.localeCompare(b.ad_soyad, 'tr'));
            break;
        case 'ad_desc':
            filtered.sort((a, b) => b.ad_soyad.localeCompare(a.ad_soyad, 'tr'));
            break;
        case 'kayit_asc':
            filtered.sort((a, b) => new Date(a.kayit_tarihi) - new Date(b.kayit_tarihi));
            break;
        case 'kayit_desc':
            filtered.sort((a, b) => new Date(b.kayit_tarihi) - new Date(a.kayit_tarihi));
            break;
    }
    
    return filtered;
}

// Filtreleri temizle
function clearFilters() {
    document.getElementById('searchFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('sortFilter').value = 'ad_asc';
    
    currentFilters = { search: '', status: '', sort: 'ad_asc' };
    currentPage = 1;
    displayParticipants();
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
    displayParticipants();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Modal işlemleri
function openAddModal() {
    document.getElementById('addParticipantModal').style.display = 'block';
}

function closeAddModal() {
    document.getElementById('addParticipantModal').style.display = 'none';
    document.getElementById('addParticipantForm').reset();
}

function closeEditModal() {
    document.getElementById('editParticipantModal').style.display = 'none';
}

function closeDetailModal() {
    document.getElementById('participantDetailModal').style.display = 'none';
}

function closeDeleteModal() {
    document.getElementById('deleteConfirmModal').style.display = 'none';
}

// Katılımcı görüntüle
function viewParticipant(participantId) {
    const participant = currentParticipants.find(p => p.katilimci_id == participantId);
    if (!participant) return;
    
    currentParticipantId = participantId;
    
    const modal = document.getElementById('participantDetailModal');
    const modalTitle = document.getElementById('participantDetailTitle');
    const modalBody = document.getElementById('participantDetailBody');
    
    modalTitle.textContent = participant.ad_soyad;
    
    modalBody.innerHTML = `
        <div class="participant-detail-item">
            <div class="participant-detail-label">E-posta:</div>
            <div class="participant-detail-value">${participant.e_posta}</div>
        </div>
        <div class="participant-detail-item">
            <div class="participant-detail-label">Telefon:</div>
            <div class="participant-detail-value">${participant.telefon}</div>
        </div>
        <div class="participant-detail-item">
            <div class="participant-detail-label">Departman:</div>
            <div class="participant-detail-value">${participant.departman}</div>
        </div>
        <div class="participant-detail-item">
            <div class="participant-detail-label">Pozisyon:</div>
            <div class="participant-detail-value">${participant.pozisyon}</div>
        </div>
        <div class="participant-detail-item">
            <div class="participant-detail-label">Durum:</div>
            <div class="participant-detail-value">
                <span class="participant-status status-${participant.durum}">${participant.durum === 'aktif' ? 'Aktif' : 'Pasif'}</span>
            </div>
        </div>
        <div class="participant-detail-item">
            <div class="participant-detail-label">Kayıt Tarihi:</div>
            <div class="participant-detail-value">${new Date(participant.kayit_tarihi).toLocaleDateString('tr-TR')}</div>
        </div>
        <div class="participant-detail-item">
            <div class="participant-detail-label">Toplantı Sayısı:</div>
            <div class="participant-detail-value">${participant.toplantilar_sayisi}</div>
        </div>
        <div class="participant-detail-item">
            <div class="participant-detail-label">Son Toplantı:</div>
            <div class="participant-detail-value">${participant.son_topanti ? new Date(participant.son_topanti).toLocaleDateString('tr-TR') : 'Henüz toplantı yok'}</div>
        </div>

    `;
    
    modal.style.display = 'block';
}

// Katılımcı düzenle
function editParticipant(participantId) {
    const participant = currentParticipants.find(p => p.katilimci_id == participantId);
    if (!participant) return;
    
    currentParticipantId = participantId;
    
    // Form alanlarını doldur
    document.getElementById('editParticipantId').value = participant.katilimci_id;
    document.getElementById('editParticipantName').value = participant.ad_soyad;
    document.getElementById('editParticipantEmail').value = participant.e_posta;
    document.getElementById('editParticipantPhone').value = participant.telefon;
    document.getElementById('editParticipantDepartment').value = participant.departman;
    document.getElementById('editParticipantPosition').value = participant.pozisyon;
    document.getElementById('editParticipantStatus').value = participant.durum;
    
    // Modal'ı göster
    document.getElementById('editParticipantModal').style.display = 'block';
}

// Yeni katılımcı kaydet
async function saveNewParticipant() {
    const form = document.getElementById('addParticipantForm');
    const formData = new FormData(form);
    
    // Validasyon
    if (!formData.get('ad_soyad') || !formData.get('e_posta') || !formData.get('telefon') || !formData.get('departman') || !formData.get('pozisyon')) {
        showNotification('Lütfen tüm alanları doldurun. Ad soyad, e-posta, telefon, departman ve pozisyon zorunludur.', 'error');
        return;
    }
    
    // Ad soyad'ı formatla - her kelimenin ilk harfini büyük yap
    const rawName = formData.get('ad_soyad');
    const formattedName = formatName(rawName);
    
    // Form verilerini JSON'a çevir
    const participantData = {
        ad_soyad: formattedName,
        e_posta: formData.get('e_posta'),
        telefon: formData.get('telefon') || '',
        departman: formData.get('departman') || '',
        pozisyon: formData.get('pozisyon') || '',
        durum: 'aktif'
    };
    
    try {
        // Veritabanına kaydet
        const response = await fetch('php/add_participant.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(participantData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Yeni katılımcıyı listeye ekle
            currentParticipants.push(result.data);
            
            // Listeyi yenile
            displayParticipants();
            
            // Modal'ı kapat
            closeAddModal();
            
            // Form'u temizle
            form.reset();
            
            showNotification('Katılımcı başarıyla eklendi ve veritabanına kaydedildi.', 'success');
        } else {
            showNotification('Hata: ' + result.error, 'error');
        }
        
    } catch (error) {
        console.error('Katılımcı ekleme hatası:', error);
        showNotification('Katılımcı eklenirken bir hata oluştu.', 'error');
    }
}

// Katılımcı değişikliklerini kaydet
async function saveParticipantChanges() {
    const participant = currentParticipants.find(p => p.katilimci_id == currentParticipantId);
    if (!participant) return;
    
    // Ad soyad'ı formatla - her kelimenin ilk harfini büyük yap
    const rawName = document.getElementById('editParticipantName').value;
    const formattedName = formatName(rawName);
    
    // Form verilerini al
    const updatedParticipant = {
        katilimci_id: currentParticipantId,
        ad_soyad: formattedName,
        e_posta: document.getElementById('editParticipantEmail').value,
        telefon: document.getElementById('editParticipantPhone').value,
        departman: document.getElementById('editParticipantDepartment').value,
        pozisyon: document.getElementById('editParticipantPosition').value,
        durum: document.getElementById('editParticipantStatus').value
    };
    
    // Validasyon
    if (!updatedParticipant.ad_soyad || !updatedParticipant.e_posta || !updatedParticipant.telefon || !updatedParticipant.departman || !updatedParticipant.pozisyon) {
        showNotification('Lütfen tüm alanları doldurun. Ad soyad, e-posta, telefon, departman ve pozisyon zorunludur.', 'error');
        return;
    }
    
    try {
        // Veritabanına güncelle
        const response = await fetch('php/update_participant.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedParticipant)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Katılımcı listesini yenile
            loadParticipants();
            
            // Modal'ı kapat
            closeEditModal();
            
            showNotification('Katılımcı başarıyla güncellendi.', 'success');
        } else {
            showNotification(result.message || 'Katılımcı güncellenemedi', 'error');
        }
        
    } catch (error) {
        console.error('Katılımcı güncelleme hatası:', error);
        showNotification('Katılımcı güncellenirken hata oluştu', 'error');
    }
}

// Katılımcı sil
function deleteParticipant(participantId) {
    const participant = currentParticipants.find(p => p.katilimci_id == participantId);
    if (!participant) return;
    
    currentParticipantId = participantId;
    
    // Silme onay modal'ını göster
    document.getElementById('deleteParticipantName').textContent = participant.ad_soyad;
    document.getElementById('deleteConfirmModal').style.display = 'block';
}

// Silme işlemini onayla
async function confirmDeleteParticipant() {
    try {
        // Katılımcı durumunu 'pasif' olarak güncelle
        const response = await fetch('php/update_participant_status.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                participantId: currentParticipantId,
                status: 'pasif'
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Katılımcı listesini yenile
            loadParticipants();
            
            // Modal'ı kapat
            closeDeleteModal();
            
            showNotification('Katılımcı pasif olarak işaretlendi.', 'success');
        } else {
            showNotification(result.message || 'Katılımcı pasif yapılamadı', 'error');
        }
        
    } catch (error) {
        console.error('Katılımcı pasif yapma hatası:', error);
        showNotification('Katılımcı pasif yapılırken hata oluştu', 'error');
    }
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

// Modal dışına tıklandığında kapat
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Event listener'ları ekle
function addParticipantCardListeners() {
    // Bu fonksiyon şu anda boş, gerekirse gelecekte eklenebilir
    console.log('Event listener\'lar eklendi');
}

// Ad soyad formatla - her kelimenin ilk harfini büyük yap
function formatName(name) {
    if (!name) return '';
    
    // Kelimeleri ayır (boşluk, nokta, tire, alt çizgi ile)
    const words = name.split(/[\s.\-_]+/);
    
    // Her kelimenin ilk harfini büyük yap
    const formattedWords = words.map(word => {
        if (word.length === 0) return '';
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    
    // Kelimeleri birleştir
    return formattedWords.join(' ').trim();
}

// Hızlı e-posta kartlarını ayarla
function setupQuickEmailCards() {
    const emailCards = document.querySelectorAll('.email-provider-card');
    
    emailCards.forEach(card => {
        card.addEventListener('click', function() {
            const domain = this.getAttribute('data-domain');
            const emailInput = document.getElementById('addParticipantEmail');
            
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
                    showNotification('Çıkış yapılırken bir hata oluştu', 'error');
                }
            } catch (error) {
                console.error('Çıkış hatası:', error);
                showNotification('Çıkış yapılırken bir hata oluştu', 'error');
            }
        });
    }
}
