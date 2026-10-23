# V0.10.4 güvenlik düzeltmeleri

Temel: android dalındaki V0.10.3 (4608071059b633a306c73cc7179390d4a80cb7f6). Sunucu, SaaS veya ağ zorunluluğu eklenmedi. Paket kimliği değişmedi: com.mrbytestudio.kilpayi. versionCode 31.

## Kayıt ve uyumluluk

İmzasız kaydı eski sürüm sayan geçiş yolu kaldırıldı. İmza ve şema doğrulaması tamamlanmadan ekonomi canlı kayda aktarılmaz; geçiş geçici nesnede yapılır. Geçiş hatası kısmen yüklenmiş parayı koruyamaz. Sonlu olmayan sayılar, bozuk araç nesneleri, uygunsuz kayıtlı tur türleri ve oyun sınırlarını aşan tur süresi reddedilir.

Geçerli imzalı V0.10.3 kayıtları, alışverişler ve normal yarım turlar korunur. İmzasız çok eski kaydın para/ilerlemesi güvenilir şekilde ayırt edilemediğinden sıfırlanır. Ses, titreşim, müzik, animasyon ve dil gibi sınırlı tercihler korunur. Bu bilinçli uyumluluk değişikliğidir; imzasız kayıtların kabul edildiğini söyleyen eski sürüm belgeleri V0.10.4 için geçerli değildir.

## Devam ve reklam ödülü

Kota ve süre denetimi işlem noktasında uygulanır. Gizlenen düğmenin çağrılması fazladan devam hakkı sağlamaz. Para harcaması geçerli ve sonlu sayı gerektirir.

Aynı anda bir native ödül isteği kabul edilir. Her asenkron aşamadan sonra istek durumu kontrol edilir; zaman aşımı sonrasındaki başlatma, dinleyici kaydı ve hazırlama gösterime devam edemez. Yeni tur veya menü önceki tüketiciyi geçersiz kılar. Gösterilmeye başlanmış reklam kapanana kadar istek kilidi tutulur; eski native olayların yeni istek tarafından tüketilmesi engellenir. Başarısız başlatma daha sonra yeniden denenebilir. Ödülsüz kapanış ödül vermez.

Reklam testleri taklit native olaylarıyla yapıldı; gerçek reklam ağı/telefon doğrulaması yerine geçmez. Google test reklam kimlikleri korunuyor.

## Zaman

Kare başına simülasyon adımı sınırlı kalırken oyun ve devam sayaçları gerçek geçen süreyi kullanır. Duraklatma davranışı korunur. Hediye saati aynı oturumda performance.now tabanlıdır; Date.now değiştirmek günlük pencereyi o oturumda sıfırlamaz.

## Kalan sunucusuz sınırlar

- Geçerli eski imzalı kaydı geri yüklemek hâlâ mümkündür. İmza tazelik kanıtı değildir; taşınabilir yedek korunur.
- Uygulamayı yeniden başlatmalar arasında cihaz saatini ve tüm yerel durumu kontrol eden kişiye karşı güvenilir takvim garantisi yoktur.
- AES ve kayıt doğrulama anahtarları ile denetleyen kod istemcidedir. Kodunu değiştirdiği APK'yi başka anahtarla yeniden dağıtan kişi kesin engellenemez. Android, resmi imzası farklı APK'nin resmi kurulumun üzerine normal güncelleme olarak yüklenmesini engeller.
- Tekrar şifreleme veya daha fazla obfuscation bu sınırları ortadan kaldırmaz. Bu sürüm bütün açıkların bittiğini iddia etmez.

## Yayın ve imza

`tools/release.sh` yalnız imzalı `dist/kil-payi-v0.10.4-release.apk` üretir; debug APK üretmez. `KP_KEYSTORE_PROPERTIES` mevcut yayın anahtarının özellik dosyasına yönlendirilebilir. Değişken yoksa eski ../KilPayi-keys/keystore.properties yolu kullanılır. Anahtar eksikse yayın durur; debug imzasına geri dönülmez. Gradle dağıtımının SHA-256 değeri sabitlendi. Betik APK imzasını, sürümü, debuggable bayrağını ve şifreli içerik varlığını denetler.

Bu bulut test derlemesinde mevcut resmi anahtara erişilemediği için ayrı RSA release test anahtarı kullanıldı. Anahtar ve parolalar depo dışındadır. Bu APK release optimizasyonlarını içerir fakat **Play Store'un imzasıyla aynı değildir**, Play'den kurulu uygulamaya güncelleme olarak kurulamaz. İlk test için ayrı cihaz/profil önerilir; resmi uygulamayı kaldırmak yerel ilerlemeyi kaybettirebilir. Play App Signing kullanan projede upload anahtarı ile Play'in uygulama imza anahtarı da farklı olabilir.

## Doğrulama

- `node tools/security-test.mjs`: 16 regresyon senaryosu; imzasız kayıt, geçiş istisnası, bozuk imzalı şema, geçerli kayıt/tur geri yükleme, dört zorlukta 1–12. seviyelerin kayıtları, devam kotası/süresi, gerçek zaman, oturum içi saat oynama ve reklam yaşam döngüsü.
- `node tools/store-test.mjs`: mağaza, kayıt/imza, hediye, dil, animasyon, dokunma ve HUD grupları geçti. İmzalı geçiş testleri bağımsız Node HMAC ile hazırlanır; imzasız eski ekonomi için artık ret beklenir.
- `node tools/hell-test.mjs`: 39 kontrol geçti. Devam efekti testi gerçek uygunluk koşulunu (en az üç kilit) sağlar.
- `node tools/sim.mjs 2500`: tamamlandı; zorluk ayarları değiştirilmedi. Bu simülatör gerçek cihaz performans testi değildir.
- `node tools/check-strings.mjs`: iki dilde 420 anahtar, 234 kullanım, 14 kilit ve 11 engel kontrolü geçti.
- `node tools/encrypt-assets.mjs --selftest`: 12 olumlu/olumsuz kontrol geçti.
- Yayın betiği karıştırılmış, test kancasız HTML üzerinde menü, mağaza, ayarlar, oyun başlatma ve ilk açılış duman testini çalıştırır.

Buluttaki Chromium file:// erişimini engellediğinden test sayfaları yalnız loopback üzerinden sunulur. Bu sunucu oyunun parçası değildir. Fiziksel Android cihazda oynanış, kurulum ve gerçek SDK gösterimi kullanıcı testinde ayrıca doğrulanmalıdır.
