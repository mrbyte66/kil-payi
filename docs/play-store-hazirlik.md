# Play Store hazırlığı (kapalı test ve yayın)

Durum (2026-10-21): kullanıcı yeni Play Console hesabını aldı, onay bekliyor. Geliştirici adı **mrbyte studio**, hesap e-postası `mrbyte.studio.dev@gmail.com`.
Kapalı test bildirimleri (17 gün, V0.9.11) bu aşama için yapıldı.

## Kesinleşmesi gereken kararlar (kullanıcıdan)

1. **Paket adı (applicationId): KARAR VERİLDİ, `com.mrbytestudio.kilpayi`** (2026-10-21, V0.9.13). Play'e ilk yüklemeden sonra DEĞİŞTİRİLEMEZ. Eski geçici ad `com.mrbyte66.kilpayi` idi.
   Değişen yerler: `capacitor.config.ts` (`appId`), `android/app/build.gradle` (`namespace`, `applicationId`), `res/values/strings.xml` (`package_name`, `custom_url_scheme`), `MainActivity.java` (paket satırı ve klasör `java/com/mrbytestudio/kilpayi/`), `capacitor.config.json` (`cap sync` üretir).
   Yan etki: yeni paket eskisinden FARKLI bir uygulamadır (kayıt, 17 günlük sayaç ve bildirimler sıfırlanır); arkadaşlardaki eski APK'lar ayrı uygulama olarak kalır, silinebilir. Emülatör betiklerinde `PKG` yeni ad olmalı.
2. **Hesap türü.** Kişisel hesap (13 Kasım 2023'ten sonra açılmış) ise üretim erişimi için **en az 12 test kullanıcısı, kesintisiz 14 gün kapalı test** şart (Play Console Yardım, "kapalı test gereksinimi"). Kurumsal hesapta bu şart yok. Test kullanıcılarının Gmail adresleri gerekir (e-posta listesi ya da Google Grubu), 15-20 kişi toplamak kopmalara karşı güvenli.
3. **Gizlilik politikası URL'si** (zorunlu). Depo özel olduğundan GitHub Pages ücretsiz değil; seçenekler: yalnızca bu sayfa için küçük herkese açık ikinci bir depo + Pages (kullanıcı onayıyla açılır), ya da Google Sites. Metni biz yazarız (oyun kişisel veri toplamaz; AdMob reklam kimliği ve cihaz verisi işler; sunucu yok; çevrimdışı).
4. **AdMob.** Ayrı ücretsiz hesap (admob.google.com, aynı Google hesabı), içinde "Kıl payı" uygulaması ve bir "ödüllü" reklam birimi: iki kimlik gerekir (Uygulama Kimliği `ca-app-pub-…~…`, Reklam birimi `ca-app-pub-…/…`). Şu an Google TEST kimlikleri var (`AndroidManifest.xml` meta-data ve `src/game.html` içindeki `ADS`). Öneri: kapalı testte test reklamları (testçi yanlışlıkla gerçek reklama tıklarsa AdMob hesabı askıya alınabilir), gerçek kimlik üretim sürümünde. Avrupa/Birleşik Krallık kullanıcıları için Google'ın onay penceresi (UMP) gerekir: eklentide `requestConsentInfo`/`showConsentForm`; AdMob panelinde "Gizlilik ve mesajlaşma" bölümünde onay mesajı oluşturulur.
5. **İkon ve mağaza görselleri.** İKON KARARI VERİLDİ: "Cam kadran" (V0.9.14, `tools/make-icon.py`; uyarlanabilir, tema renkli, Play 512 `android/app/src/main/ic_launcher-playstore.png` hazır). Mağaza adı dile göre: Türkçe "Kıl payı", İngilizce "Close Call". Kalanlar: 1024×500 öne çıkan görsel, en az 2 telefon ekran görüntüsü, kısa açıklama (80 karakter), uzun açıklama; Türkçe ve İngilizce. Görsel kararlarda 3-4 canlı alternatif göster (kullanıcı tercihi).
6. **Hedef kitle**: çocuklara yönelik değil (öneri 13+), Aile politikasına girmemek için.

## Teknik yapılacaklar (sırayla)

- Paket adı değişikliği (yukarıda), `versionCode`/`versionName`.
- **İmzalı yayın paketi (AAB)**: yükleme anahtarı (`*.jks`) oluştur, depoya GİRMEZ (klasör dışında sakla, kullanıcı yedekler), `build.gradle` içinde release imzası, `./gradlew bundleRelease`. Play Uygulama İmzalama açık olsun (Google asıl imza anahtarını tutar).
- Hedef API: Play, 31 Ağustos 2026'dan itibaren yeni uygulama ve güncellemelerde **API 36** ister; projede `targetSdk 36` zaten var.
- Reklam kimlikleri (üretimde), UMP onay penceresi, `app-ads.txt` (AdMob önerir; geliştirici web sitesinde barınır).
- Test bildirimleri yayın sürümünde kalır; test bitince kaldırma listesi `CLAUDE.md` V0.9.11 bölümünde.
- Debug izleri: yayın derlemesinde `__kp` yok (release.sh denetler); APK yerine AAB kullanılacak.
- Mağaza girdileri: kısa/uzun açıklama (TR, EN), ekran görüntüleri (emülatör ya da başsız Chrome ile üretilir), öne çıkan görsel, ikon.
- Play Console formları (kullanıcı doldurur, hazır cevaplar biz veririz): **Veri güvenliği** (reklam kimliği: toplanır, reklam amaçlı, paylaşılır; başka kişisel veri yok), **İçerik derecelendirme** (şiddet yok, reklam var), **Reklam içerir: evet**, **Hedef kitle**, **Uygulama erişimi: kısıtsız**, **Reklam kimliği beyanı: evet**.

## Kaynaklar

- Kapalı test şartı: https://support.google.com/googleplay/android-developer/answer/14151465
- Hedef API şartı: https://developer.android.com/google/play/requirements/target-sdk

## Play Console kurulum görevleri (hesap onaylandı, uygulama oluşturuluyor; önerilen cevaplar)

Uygulama: ad "Close Call", varsayılan dil English (United States), Oyun, Ücretsiz (ücretsizden ücretliye sonradan geçilemez). Türkçe çeviri sonra eklenir (ad "Kıl payı").
- **Uygulama erişimi:** tüm işlevler özel erişim (giriş) gerektirmeden kullanılabilir.
- **Reklamlar:** evet, reklam içerir (AdMob ödüllü reklam).
- **İçerik derecelendirme (IARC):** kategori Oyun; şiddet, cinsellik, küfür, kumar, kullanıcı içeriği, konum paylaşımı, gerçek parayla satın alma: hayır. İletişim e-postası geliştirici e-postası.
- **Hedef kitle:** 13-15, 16-17 ve 18+ (5-12 ve altı SEÇME); çocukları cezbeden unsur: hayır (Aile politikasına girmemek için).
- **Reklam kimliği:** evet kullanılıyor (AdMob); amaç: reklamcılık/pazarlama ve dolandırıcılığı önleme.
- **Devlet uygulaması, finansal özellikler, sağlık, haber, COVID-19:** hayır / yok.
- **Veri güvenliği:** veri topluyor/paylaşıyor: evet (AdMob SDK). Toplanan ve paylaşılan: Yaklaşık konum (IP'den), Uygulama etkileşimleri, Tanılama (uygulama bilgileri ve performans), Cihaz veya diğer kimlikler (reklam kimliği). Amaçlar: reklamcılık veya pazarlama, analiz, dolandırıcılığı önleme/güvenlik. Aktarımda şifreli: evet. Veri silme isteği yolu: yok (hesap yok; veri cihazda). Kişisel bilgi (ad, e-posta vb.): toplanmıyor. Kaynak: https://developers.google.com/admob/android/privacy/play-data-disclosure (SDK sürümüne göre güncel sayfaya bak).
- **Gizlilik politikası: YAYINDA** https://mrbyte66.github.io/kilpayi-gizlilik/ (Türkçe ve İngilizce, tek sayfa; herkese açık depo `mrbyte66/kilpayi-gizlilik`, GitHub Pages; kaynak `docs/gizlilik/index.html`). Play Console'da Uygulama içeriği > Gizlilik politikası alanına yapıştırılır.
- **Mağaza girişi:** kategori Oyun > Arcade; e-posta mrbyte.studio.dev@gmail.com; ad, kısa açıklama (80), uzun açıklama, ikon 512 (`ic_launcher-playstore.png` hazır), öne çıkan görsel 1024x500, en az 2 ekran görüntüsü.
- **Kapalı test:** Test et ve yayınla > Kapalı test > yeni kanal > e-posta listesi (12+ kişi) > imzalı AAB yükle (APK değil). Kişisel hesapta 12 kişi x kesintisiz 14 gün, sonra üretim erişimi başvurusu.

## Durum (2026-10-21, ikinci güncelleme)

- Hesap onaylandı, uygulama Play Console'da oluşturuldu (kontrol paneli: Dahili test, Oyununuzun kurulumunu tamamlayın, Kapalı test).
- İmzalı AAB hazır: `dist/kil-payi-v0.9.14.aab` (`./tools/release-aab.sh`; versionCode 26; yükleme anahtarı `~/Desktop/AndroidDevelopment/KilPayi-keys/`, yedeklenmeli). Yükleme sırasında "Play Uygulama İmzalama" önerilir: kabul et.
- Önce Dahili test (kullanıcı ve 1-2 güvenilir kişi): AAB'yi yükle, Play'den kur (eski debug APK'yı sil). Sonra kapalı test: 14+ kişi, e-posta listesi, test bağlantısı, 14 gün kesintisiz.
- Bekleyen: mağaza girişi metinleri (TR/EN), ekran görüntüleri, öne çıkan görsel 1024x500; AdMob hesabı ve kimlikler (üretimde), UMP onay penceresi.
