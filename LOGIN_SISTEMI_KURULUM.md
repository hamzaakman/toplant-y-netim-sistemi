# Toplantı Yönetim Sistemi - Login Sistemi Kurulum Rehberi

Bu rehber, toplantı yönetim sistemine eklenen login sisteminin nasıl kurulacağını açıklar.

## 🚀 Özellikler

- **Kullanıcı Kaydı**: Güvenli hesap oluşturma
- **Giriş Yapma**: Kullanıcı adı/e-posta ile giriş
- **Oturum Yönetimi**: Session ve cookie tabanlı
- **Remember Me**: 30 gün boyunca otomatik giriş
- **Rol Sistemi**: User, Admin, Moderator rolleri
- **Güvenlik**: Şifre hashleme, CSRF koruması
- **Responsive Tasarım**: Mobil uyumlu arayüz

## 📋 Gereksinimler

- PHP 7.4 veya üzeri
- MySQL 5.7 veya üzeri
- Web sunucusu (Apache/Nginx)
- Modern web tarayıcısı

## 🗄️ Veritabanı Kurulumu

### 1. Veritabanı Oluşturma

```sql
CREATE DATABASE toplanti_yonetim CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE toplanti_yonetim;
```

### 2. Users Tablosu Oluşturma

```sql
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin','moderator') NOT NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. Remember Tokens Tablosu Oluşturma

```sql
CREATE TABLE `remember_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token` varchar(64) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `user_id` (`user_id`),
  KEY `expires_at` (`expires_at`),
  CONSTRAINT `remember_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4. Örnek Kullanıcı Oluşturma

```sql
-- Admin kullanıcısı (şifre: Admin123!)
INSERT INTO `users` (`username`, `email`, `password`, `role`) VALUES
('admin', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Normal kullanıcı (şifre: password)
INSERT INTO `users` (`username`, `email`, `password`, `role`) VALUES
('demo_user', 'demo@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');
```

## ⚙️ Konfigürasyon

### 1. PHP Konfigürasyonu

`php/config.php` dosyasında veritabanı bilgilerini güncelleyin:

```php
define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'toplanti_yonetim_sistemi');
define('DB_USER', 'root');
define('DB_PASS', 'your_password');
```

### 2. Session Ayarları

PHP'de session ayarlarını kontrol edin:

```php
// php.ini veya .htaccess
session.gc_maxlifetime = 3600
session.cookie_lifetime = 0
session.cookie_secure = 1
session.cookie_httponly = 1
```

## 🔐 Güvenlik Özellikleri

### Şifre Gereksinimleri
- En az 8 karakter
- Büyük/küçük harf
- Rakam
- Özel karakter (@$!%*?&)

### Kullanıcı Adı Gereksinimleri
- 3-20 karakter arası
- Sadece harf, rakam ve alt çizgi

### E-posta Validasyonu
- Geçerli e-posta formatı kontrolü
- Benzersizlik kontrolü

## 📱 Kullanım

### 1. İlk Giriş
- `login.html` sayfasına gidin
- Veya `register.html` ile yeni hesap oluşturun

### 2. Giriş Yapma
- Kullanıcı adı veya e-posta ile giriş
- "Beni hatırla" seçeneği ile otomatik giriş

### 3. Çıkış Yapma
- Sağ üst köşedeki kullanıcı menüsünden çıkış

## 🚨 Sorun Giderme

### Yaygın Hatalar

1. **Veritabanı Bağlantı Hatası**
   - Veritabanı bilgilerini kontrol edin
   - MySQL servisinin çalıştığından emin olun

2. **Session Hatası**
   - PHP session ayarlarını kontrol edin
   - Web sunucusu izinlerini kontrol edin

3. **Şifre Hash Hatası**
   - PHP password_hash() fonksiyonunun çalıştığından emin olun

### Log Kontrolü

Hataları `php/error_log` dosyasından takip edebilirsiniz.

## 🔄 Güncelleme

Sistemi güncellemek için:

1. Mevcut dosyaları yedekleyin
2. Yeni dosyaları yükleyin
3. Veritabanı şemasını güncelleyin
4. Test edin

## 📞 Destek

Herhangi bir sorun yaşarsanız:

1. Hata mesajlarını kontrol edin
2. Log dosyalarını inceleyin
3. Veritabanı bağlantısını test edin
4. PHP sürümünü kontrol edin

## 📝 Lisans

Bu sistem açık kaynak kodludur ve eğitim amaçlı kullanılabilir.

---

**Not**: Bu sistem production ortamında kullanılmadan önce güvenlik testlerinden geçirilmelidir.
