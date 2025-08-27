-- Toplantı Yönetim Sistemi Veritabanı Kurulum Scripti
-- MySQL 5.7+ ve MariaDB 10.2+ uyumlu

-- Veritabanı oluştur
CREATE DATABASE IF NOT EXISTS `toplanti_yonetim` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `toplanti_yonetim`;

-- Katılımcılar tablosu
CREATE TABLE IF NOT EXISTS `katilimcilar` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `ad_soyad` varchar(255) NOT NULL COMMENT 'Katılımcının adı ve soyadı',
    `email` varchar(255) NOT NULL UNIQUE COMMENT 'E-posta adresi (benzersiz)',
    `telefon` varchar(20) DEFAULT NULL COMMENT 'Telefon numarası (opsiyonel)',
    `departman` varchar(100) DEFAULT NULL COMMENT 'Departman bilgisi (opsiyonel)',
    `pozisyon` varchar(100) DEFAULT NULL COMMENT 'Pozisyon bilgisi (opsiyonel)',
    `aktif` tinyint(1) DEFAULT 1 COMMENT 'Aktif durumu (1: aktif, 0: pasif)',
    `kayit_tarihi` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Kayıt tarihi',
    `guncelleme_tarihi` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Güncelleme tarihi',
    PRIMARY KEY (`id`),
    UNIQUE KEY `email_unique` (`email`),
    KEY `idx_ad_soyad` (`ad_soyad`),
    KEY `idx_departman` (`departman`),
    KEY `idx_aktif` (`aktif`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sistem katılımcıları';

-- Toplantılar tablosu
CREATE TABLE IF NOT EXISTS `toplantilar` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `toplanti_adi` varchar(255) NOT NULL COMMENT 'Toplantı adı',
    `tarih` date NOT NULL COMMENT 'Toplantı tarihi',
    `saat` time NOT NULL COMMENT 'Toplantı saati',
    `yer` varchar(255) NOT NULL COMMENT 'Toplantı yeri',
    `aciklama` text DEFAULT NULL COMMENT 'Toplantı açıklaması (opsiyonel)',
    `durum` enum('planlandi','devam_ediyor','tamamlandi','iptal_edildi') DEFAULT 'planlandi' COMMENT 'Toplantı durumu',
    `olusturan_kullanici` varchar(100) DEFAULT NULL COMMENT 'Toplantıyı oluşturan kullanıcı',
    `olusturma_tarihi` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Oluşturma tarihi',
    `guncelleme_tarihi` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Güncelleme tarihi',
    PRIMARY KEY (`id`),
    KEY `idx_tarih` (`tarih`),
    KEY `idx_durum` (`durum`),
    KEY `idx_olusturma_tarihi` (`olusturma_tarihi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Toplantı bilgileri';

-- Toplantı katılımcıları tablosu (many-to-many ilişki)
CREATE TABLE IF NOT EXISTS `toplanti_katilimcilari` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `toplanti_id` int(11) NOT NULL COMMENT 'Toplantı ID',
    `katilimci_id` int(11) NOT NULL COMMENT 'Katılımcı ID',
    `katilim_durumu` enum('davet_edildi','onaylandi','reddedildi','belirsiz') DEFAULT 'davet_edildi' COMMENT 'Katılım durumu',
    `davet_tarihi` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Davet gönderilme tarihi',
    `yanit_tarihi` datetime DEFAULT NULL COMMENT 'Yanıt tarihi',
    `notlar` text DEFAULT NULL COMMENT 'Katılımcı notları',
    PRIMARY KEY (`id`),
    UNIQUE KEY `toplanti_katilimci_unique` (`toplanti_id`, `katilimci_id`),
    KEY `idx_katilim_durumu` (`katilim_durumu`),
    KEY `idx_davet_tarihi` (`davet_tarihi`),
    CONSTRAINT `fk_topk_top` FOREIGN KEY (`toplanti_id`) REFERENCES `toplantilar` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_topk_kat` FOREIGN KEY (`katilimci_id`) REFERENCES `katilimcilar` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Toplantı-katılımcı ilişkisi';

-- Toplantı günlükleri tablosu (opsiyonel)
CREATE TABLE IF NOT EXISTS `toplanti_gunlukleri` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `toplanti_id` int(11) NOT NULL COMMENT 'Toplantı ID',
    `yazan_kullanici` varchar(100) NOT NULL COMMENT 'Günlük yazan kullanıcı',
    `baslik` varchar(255) NOT NULL COMMENT 'Günlük başlığı',
    `icerik` text NOT NULL COMMENT 'Günlük içeriği',
    `yazilma_tarihi` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Yazılma tarihi',
    `guncelleme_tarihi` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Güncelleme tarihi',
    PRIMARY KEY (`id`),
    KEY `idx_topk_id` (`toplanti_id`),
    KEY `idx_yazilma_tarihi` (`yazilma_tarihi`),
    CONSTRAINT `fk_gun_top` FOREIGN KEY (`toplanti_id`) REFERENCES `toplantilar` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Toplantı günlükleri';

-- Örnek veriler (test için)
INSERT INTO `katilimcilar` (`ad_soyad`, `email`, `telefon`, `departman`, `pozisyon`) VALUES
('Ahmet Yılmaz', 'ahmet@example.com', '+90 555 123 4567', 'Yazılım Geliştirme', 'Senior Developer'),
('Fatma Demir', 'fatma@example.com', '+90 555 234 5678', 'Proje Yönetimi', 'Proje Müdürü'),
('Mehmet Kaya', 'mehmet@example.com', '+90 555 345 6789', 'Tasarım', 'UI/UX Designer'),
('Ayşe Özkan', 'ayse@example.com', '+90 555 456 7890', 'Kalite Güvence', 'QA Engineer'),
('Ali Veli', 'ali@example.com', '+90 555 567 8901', 'Yazılım Geliştirme', 'Junior Developer'),
('Zeynep Arslan', 'zeynep@example.com', '+90 555 678 9012', 'İnsan Kaynakları', 'HR Uzmanı'),
('Can Özkan', 'can@example.com', '+90 555 789 0123', 'Satış', 'Satış Temsilcisi'),
('Elif Yıldız', 'elif@example.com', '+90 555 890 1234', 'Pazarlama', 'Pazarlama Uzmanı');

-- Örnek toplantı
INSERT INTO `toplantilar` (`toplanti_adi`, `tarih`, `saat`, `yer`, `aciklama`, `durum`) VALUES
('Proje Planlama Toplantısı', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '14:00:00', 'Toplantı Odası A', 'Q1 proje planlaması ve hedefler', 'planlandi');

-- Örnek toplantı katılımcıları
INSERT INTO `toplanti_katilimcilari` (`toplanti_id`, `katilimci_id`, `katilim_durumu`) VALUES
(1, 1, 'davet_edildi'),
(1, 2, 'davet_edildi'),
(1, 3, 'davet_edildi'),
(1, 4, 'davet_edildi');

-- İndeksler (performans için)
CREATE INDEX `idx_topk_tarih_saat` ON `toplantilar` (`tarih`, `saat`);
CREATE INDEX `idx_kat_email` ON `katilimcilar` (`email`);
CREATE INDEX `idx_topk_kat_durum` ON `toplanti_katilimcilari` (`katilimci_id`, `katilim_durumu`);

-- Görünümler (opsiyonel)
CREATE OR REPLACE VIEW `toplanti_ozeti` AS
SELECT 
    t.id,
    t.toplanti_adi,
    t.tarih,
    t.saat,
    t.yer,
    t.durum,
    COUNT(tk.katilimci_id) as katilimci_sayisi,
    SUM(CASE WHEN tk.katilim_durumu = 'onaylandi' THEN 1 ELSE 0 END) as onaylayan_sayisi,
    SUM(CASE WHEN tk.katilim_durumu = 'reddedildi' THEN 1 ELSE 0 END) as reddeden_sayisi
FROM toplantilar t
LEFT JOIN toplanti_katilimcilari tk ON t.id = tk.topk_id
GROUP BY t.id;

-- Kullanıcı yetkileri (güvenlik için)
-- Bu kısım production ortamında daha detaylı yapılandırılmalı
-- GRANT SELECT, INSERT, UPDATE, DELETE ON toplanti_yonetim.* TO 'toplanti_user'@'localhost';

-- Veritabanı karakter seti kontrolü
SELECT 
    TABLE_NAME,
    TABLE_COLLATION,
    TABLE_ROWS,
    DATA_LENGTH,
    INDEX_LENGTH
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'toplanti_yonetim'
ORDER BY TABLE_NAME;

-- Tablo yapısı kontrolü
SHOW TABLES FROM `toplanti_yonetim`;
DESCRIBE `katilimcilar`;
DESCRIBE `toplantilar`;
DESCRIBE `toplanti_katilimcilari`;
DESCRIBE `toplanti_gunlukleri`;
