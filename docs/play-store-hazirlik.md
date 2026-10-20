# Play Store hazırlığı (kapalı test ve yayın)

Durum (2026-10-21): kullanıcı yeni Play Console hesabını aldı, onay bekliyor. Geliştirici adı **mrbyte studio**, hesap e-postası `mrbyte.studio.dev@gmail.com`.
Kapalı test bildirimleri (17 gün, V0.9.11) bu aşama için yapıldı.

## Kesinleşmesi gereken kararlar (kullanıcıdan)

1. **Paket adı (applicationId).** Play'e ilk yüklemeden sonra DEĞİŞTİRİLEMEZ. Şu an geçici: `com.mrbyte66.kilpayi`. Öneri: `com.mrbytestudio.kilpayi`. Değişiklik yeri (6 dosya + klasör taşıma):
   `capacitor.config.ts` (`appId`), `android/app/build.gradle` (`namespace` ve `applicationId`), `android/app/src/main/res/values/strings.xml` (`package_name`, `custom_url_scheme`),
   `android/app/src/main/java/com/mrbyte66/kilpayi/MainActivity.java` (`package` satırı ve klasör yolu), `capacitor.config.json` (`cap sync` üretir), `CLAUDE.md`. Sonra temiz derleme ve emülatörde bildirim uçtan uca denemesi (paket adı betiklerde var).
   Yan etki: yeni paket adı eskisinden FARKLI bir uygulamadır (kayıt, 17 günlük sayaç ve bildirimler sıfırlanır; eskisi silinip yenisi kurulur).
2. **Hesap türü.** Kişisel hesap (13 Kasım 2023'ten sonra açılmış) ise üretim erişimi için **en az 12 test kullanıcısı, kesintisiz 14 gün kapalı test** şart (Play Console Yardım, "kapalı test gereksinimi"). Kurumsal hesapta bu şart yok. Test kullanıcılarının Gmail adresleri gerekir (e-posta listesi ya da Google Grubu), 15-20 kişi toplamak kopmalara karşı güvenli.
3. **Gizlilik politikası URL'si** (zorunlu). Depo özel olduğundan GitHub Pages ücretsiz değil; seçenekler: yalnızca bu sayfa için küçük herkese açık ikinci bir depo + Pages (kullanıcı onayıyla açılır), ya da Google Sites. Metni biz yazarız (oyun kişisel veri toplamaz; AdMob reklam kimliği ve cihaz verisi işler; sunucu yok; çevrimdışı).
4. **AdMob.** Ayrı ücretsiz hesap (admob.google.com, aynı Google hesabı), içinde "Kıl payı" uygulaması ve bir "ödüllü" reklam birimi: iki kimlik gerekir (Uygulama Kimliği `ca-app-pub-…~…`, Reklam birimi `ca-app-pub-…/…`). Şu an Google TEST kimlikleri var (`AndroidManifest.xml` meta-data ve `src/game.html` içindeki `ADS`). Öneri: kapalı testte test reklamları (testçi yanlışlıkla gerçek reklama tıklarsa AdMob hesabı askıya alınabilir), gerçek kimlik üretim sürümünde. Avrupa/Birleşik Krallık kullanıcıları için Google'ın onay penceresi (UMP) gerekir: eklentide `requestConsentInfo`/`showConsentForm`; AdMob panelinde "Gizlilik ve mesajlaşma" bölümünde onay mesajı oluşturulur.
5. **İkon ve mağaza görselleri.** Şu an varsayılan Capacitor ikonu. Gerekenler: uyarlanabilir uygulama ikonu (ön plan + arka plan) ve 512×512 mağaza ikonu, 1024×500 öne çıkan görsel, en az 2 telefon ekran görüntüsü, kısa açıklama (80 karakter), uzun açıklama; Türkçe ve İngilizce. Görsel kararlarda 3-4 canlı alternatif göster (kullanıcı tercihi).
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
