# Toplantı Yönetim Sistemi

Modern ve kullanıcı dostu bir toplantı yönetim sistemi. Toplantı oluşturma, katılımcı yönetimi ve otomatik e-posta davetiyesi gönderimi özelliklerini içerir.

## 🚀 Özellikler

- **Toplantı Oluşturma**: Ad, tarih, saat ve yer bilgileri ile toplantı oluşturma
- **Katılımcı Yönetimi**: Mevcut katılımcılardan seçim ve yeni e-posta ekleme
- **Veritabanı Entegrasyonu**: MySQL/MariaDB ile güvenli veri saklama
- **Otomatik E-posta**: N8N webhook entegrasyonu ile otomatik davetiye gönderimi
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu modern arayüz
- **Form Validasyonu**: Kapsamlı form doğrulama ve hata yönetimi

## 📋 Gereksinimler

- **Web Sunucusu**: Apache/Nginx
- **PHP**: 7.4 veya üzeri
- **Veritabanı**: MySQL 5.7+ veya MariaDB 10.2+
- **Tarayıcı**: Modern web tarayıcıları (Chrome, Firefox, Safari, Edge)

## 🛠️ Kurulum

### 1. Proje Dosyalarını İndirin
```bash
git clone https://github.com/hamzaakman/toplant-y-netim-sistemi.git
cd toplant-y-netim-sistemi
```

### 2. Veritabanını Kurun
```bash
# MySQL'e bağlanın
mysql -u root -p

# Kurulum scriptini çalıştırın
source database/setup.sql
```

### 3. Veritabanı Ayarlarını Yapılandırın
`php/config.php` dosyasında veritabanı bilgilerini güncelleyin:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'toplanti_yonetim');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
```

### 4. N8N Webhook URL'sini Ayarlayın
`php/create_meeting.php` dosyasında N8N webhook URL'sini güncelleyin:
```php
$n8nWebhookUrl = 'https://your-n8n-instance.com/webhook/meeting-created';
```

### 5. Web Sunucusunu Yapılandırın
Proje dosyalarını web sunucunuzun document root dizinine kopyalayın.

## 🗄️ Veritabanı Yapısı

### Tablolar

#### `katilimcilar`
- `id`: Benzersiz kimlik
- `ad_soyad`: Katılımcı adı ve soyadı
- `email`: E-posta adresi (benzersiz)
- `telefon`: Telefon numarası
- `departman`: Departman bilgisi
- `pozisyon`: Pozisyon bilgisi
- `aktif`: Aktif durumu
- `kayit_tarihi`: Kayıt tarihi

#### `toplantilar`
- `id`: Benzersiz kimlik
- `toplanti_adi`: Toplantı adı
- `tarih`: Toplantı tarihi
- `saat`: Toplantı saati
- `yer`: Toplantı yeri
- `aciklama`: Toplantı açıklaması
- `durum`: Toplantı durumu
- `olusturma_tarihi`: Oluşturma tarihi

#### `toplanti_katilimcilari`
- `id`: Benzersiz kimlik
- `toplanti_id`: Toplantı referansı
- `katilimci_id`: Katılımcı referansı
- `katilim_durumu`: Katılım durumu
- `davet_tarihi`: Davet gönderilme tarihi

## 🔧 Kullanım

### Toplantı Oluşturma
1. Ana sayfada "Yeni Toplantı Oluştur" formunu doldurun
2. Toplantı bilgilerini girin (ad, tarih, saat, yer)
3. Mevcut katılımcılardan seçim yapın
4. Yeni e-posta adresleri ekleyin
5. "Toplantı Oluştur" butonuna tıklayın

### Katılımcı Yönetimi
- **Mevcut Katılımcılar**: Veritabanından gelen kişileri çoklu seçim ile seçin
- **Yeni Katılımcılar**: E-posta adresi girerek yeni katılımcı ekleyin
- **E-posta Doğrulama**: Otomatik e-posta formatı kontrolü

## 📧 N8N Entegrasyonu

Sistem, toplantı oluşturulduktan sonra N8N webhook'una JSON formatında veri gönderir:

```json
{
  "meeting_id": 1,
  "meeting_name": "Proje Planlama Toplantısı",
  "meeting_date": "2024-01-15",
  "meeting_time": "14:00:00",
  "meeting_location": "Toplantı Odası A",
  "participants": [
    {
      "id": 1,
      "ad_soyad": "Ahmet Yılmaz",
      "email": "ahmet@example.com"
    }
  ]
}
```

N8N'de bu veriyi kullanarak:
- Otomatik e-posta davetiyesi gönderimi
- Takvim entegrasyonu
- Bildirim sistemi
- Raporlama

## 🎨 Özelleştirme

### CSS Stilleri
`css/style.css` dosyasında renk şeması, fontlar ve genel görünüm özelleştirilebilir.

### JavaScript İşlevleri
`js/script.js` dosyasında form validasyonu ve kullanıcı etkileşimleri özelleştirilebilir.

### PHP Yapılandırması
`php/config.php` dosyasında veritabanı ayarları ve güvenlik parametreleri düzenlenebilir.

## 🔒 Güvenlik

- **SQL Injection Koruması**: PDO prepared statements kullanımı
- **XSS Koruması**: Input sanitization ve output encoding
- **CSRF Koruması**: Token tabanlı koruma
- **Input Validasyonu**: Kapsamlı form doğrulama

## 📱 Responsive Tasarım

- Mobil cihazlarda optimize edilmiş görünüm
- Touch-friendly arayüz elemanları
- Esnek grid sistemi
- Modern CSS Grid ve Flexbox kullanımı

## 🚀 Performans

- **Veritabanı İndeksleri**: Hızlı sorgu yanıtları için optimize edilmiş
- **Async Webhook**: N8N entegrasyonu sistem yanıtını bekletmez
- **Minified CSS/JS**: Production için optimize edilmiş dosya boyutları

## 🐛 Hata Ayıklama

Hata logları `php/` dizininde saklanır. Geliştirme ortamında:
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit yapın (`git commit -m 'Add some AmazingFeature'`)
4. Push yapın (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📞 Destek

Sorularınız için:
- GitHub Issues: [Proje Issues Sayfası](https://github.com/hamzaakman/toplant-y-netim-sistemi/issues)
- E-posta: [your-email@example.com]

## 🔄 Güncellemeler

### v1.0.0 (2024-01-01)
- İlk sürüm
- Temel toplantı yönetimi
- Katılımcı yönetimi
- N8N entegrasyonu

## 📊 Sistem Gereksinimleri

### Minimum
- PHP 7.4
- MySQL 5.7
- 512MB RAM
- 100MB disk alanı

### Önerilen
- PHP 8.1+
- MySQL 8.0+
- 1GB RAM
- 500MB disk alanı

## 🔧 Geliştirici Notları

### Kod Standartları
- PSR-12 coding standards
- Semantic HTML5
- Modern CSS3
- ES6+ JavaScript

### Test
- PHPUnit testleri (gelecek sürümde)
- Browser compatibility testing
- Responsive design testing

---

**Not**: Bu sistem production ortamında kullanılmadan önce güvenlik testlerinden geçirilmeli ve gerekli güvenlik önlemleri alınmalıdır.
