<?php
header('Content-Type: text/html; charset=utf-8');
require_once 'config.php';

try {
    $pdo = getDBConnection();
    
    // Örnek katılımcılar
    $sampleParticipants = [
        [
            'ad_soyad' => 'Ahmet Yılmaz',
            'e_posta' => 'ahmet.yilmaz@example.com',
            'telefon' => '+90 555 123 4567',
            'departman' => 'IT',
            'pozisyon' => 'Yazılım Geliştirici',
            'durum' => 'aktif'
        ],
        [
            'ad_soyad' => 'Fatma Demir',
            'e_posta' => 'fatma.demir@example.com',
            'telefon' => '+90 555 234 5678',
            'departman' => 'Satış',
            'pozisyon' => 'Satış Temsilcisi',
            'durum' => 'aktif'
        ],
        [
            'ad_soyad' => 'Mehmet Kaya',
            'e_posta' => 'mehmet.kaya@example.com',
            'telefon' => '+90 555 345 6789',
            'departman' => 'Pazarlama',
            'pozisyon' => 'Pazarlama Uzmanı',
            'durum' => 'aktif'
        ],
        [
            'ad_soyad' => 'Ayşe Özkan',
            'e_posta' => 'ayse.ozkan@example.com',
            'telefon' => '+90 555 456 7890',
            'departman' => 'İnsan Kaynakları',
            'pozisyon' => 'İK Uzmanı',
            'durum' => 'aktif'
        ],
        [
            'ad_soyad' => 'Ali Veli',
            'e_posta' => 'ali.veli@example.com',
            'telefon' => '+90 555 567 8901',
            'departman' => 'Finans',
            'pozisyon' => 'Muhasebe Uzmanı',
            'durum' => 'aktif'
        ]
    ];
    
    // Mevcut katılımcıları kontrol et
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM katilimcilar");
    $existingCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    if ($existingCount > 0) {
        echo "<h2>⚠️ Veritabanında zaten $existingCount katılımcı bulunuyor!</h2>";
        echo "<p>Örnek katılımcılar eklenmedi.</p>";
        echo "<a href='../index.html'>← Ana Sayfaya Dön</a>";
        exit;
    }
    
    // Katılımcıları ekle
    $insertStmt = $pdo->prepare("
        INSERT INTO katilimcilar (ad_soyad, e_posta, telefon, departman, pozisyon, durum, kayit_tarihi) 
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    ");
    
    $addedCount = 0;
    foreach ($sampleParticipants as $participant) {
        try {
            $insertStmt->execute([
                $participant['ad_soyad'],
                $participant['e_posta'],
                $participant['telefon'],
                $participant['departman'],
                $participant['pozisyon'],
                $participant['durum']
            ]);
            $addedCount++;
        } catch (Exception $e) {
            echo "<p>❌ Hata: {$participant['ad_soyad']} eklenemedi - {$e->getMessage()}</p>";
        }
    }
    
    echo "<h2>✅ Başarılı!</h2>";
    echo "<p>$addedCount örnek katılımcı veritabanına eklendi.</p>";
    echo "<h3>Eklenen Katılımcılar:</h3>";
    echo "<ul>";
    foreach ($sampleParticipants as $participant) {
        echo "<li><strong>{$participant['ad_soyad']}</strong> - {$participant['departman']} ({$participant['e_posta']})</li>";
    }
    echo "</ul>";
    
    echo "<p><a href='../index.html'>← Ana Sayfaya Dön ve Test Et</a></p>";
    
} catch (Exception $e) {
    echo "<h2>❌ Hata!</h2>";
    echo "<p>Veritabanı hatası: {$e->getMessage()}</p>";
    echo "<p><a href='../index.html'>← Ana Sayfaya Dön</a></p>";
}
?>
