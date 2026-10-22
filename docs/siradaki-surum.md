# Sonraki sürüm notları (kullanıcı isteği, 2026-10-22)

Kapalı test sırasında bir testçi Play'den indirdiği APK'yı açıp kaynak kodu okudu, tüm jokerleri ekleyip oyunu kendi istediği gibi değiştirdi. Kullanıcı: "kaynak kodu açamamalılar, tüm açıkları kapatmalıyız, bir sonraki sürümde yapılsın, unuturum".

## 1. Kod karıştırma (obfuscation) ve kayıt koruma — ÖNCELİKLİ

- `src/game.html` içindeki JS, yayın derlemesinde (`build.sh`, DEBUG olmayan) küçültülüp karıştırılmalı: değişken/işlev adları bozulur, metinler kodlanır, ölü kod eklenir (ör. `javascript-obfuscator`, ya da `terser` + isim bozma; paket sürümü `--save-exact` kilitli olmalı). Oyun tek dosya olduğu için karıştırma `build.sh`'ye eklenir; `tools/release.sh` denetimleri (`__kp` yok, check-strings) hâlâ geçmeli. Performansı ÖLÇ: ağır karıştırma (kontrol akışı düzleştirme, kendini koruma) kare hızını düşürebilir; telefonda ve 3× yavaşlatılmış başsız Chrome'da kare süresini karşılaştır (Cehennem kademesi, mağaza kaydırma).
- Android tarafı: R8/minify (`build.gradle`, `minifyEnabled`) Capacitor ve AdMob ile bozulma riski taşır; açılırsa kural dosyası (`proguard-rules.pro`) ve emülatörde tam akış testi gerekir. Play "kod karartma %1" uyarısı da buna bağlı.
- Kayıt dosyası: `save` şu an `localStorage` içinde düz JSON; coin, joker, yuva değiştirilebilir ve kullanıcının asıl şikayeti bu (reklam izlenmiyor, çünkü herkes kendine joker/coin basıyor, gelir düşüyor). Önlem: kaydı imzala (HMAC ile sağlama toplamı) ve imza tutmazsa sıfırla ya da son geçerli kayda dön; anahtar kodda olacağı için kırılabilir, hedef "kolayca kurcalanmasın" (tam koruma çevrimdışı oyunda mümkün değil, kullanıcıya dürüstçe söylendi). Kayıt şeması değişirse eski kayıt geçişi bozulmamalı (`save.v`).
- Ek: WebView hata ayıklama (`setWebContentsDebuggingEnabled`) yayın derlemesinde kapalı olmalı, `allowBackup` ve `android:debuggable` kontrol edilmeli; `window.__kp` zaten yayına girmiyor (release.sh denetliyor).
- Dürüst sınır: kod tarayıcıda çalıştığı için ne kadar karıştırılırsa karıştırılsın tamamen okunamaz yapılamaz, amaç alışılmış kopyalamayı ve kolay hileyi zorlaştırmak. Gelir tarafı için ayrıca bkz. madde 3.

## 2. Donma sorunları — ÖNCELİKLİ

- Kullanıcı: oyun ilk açıldığında ana menüde dönen şeftali (ibre) donuyor; ana ekranda da donmalar var; "donma sorunlarını her yerden çözmeliyiz".
- Önce yeniden üret: gerçek cihazda (Play'den kurulan sürüm) ve emülatörde menüyü açıp ibre animasyonunu izle; hangi anda donuyor (açılıştan hemen sonra mı, `WARM` ısınması çalışırken mi, `testSync`/bildirim izni isteği mi, müzik mi, reklam yüklemesi mi). Şüpheliler: V0.9.9 `WARM` görünmez mağaza ısınması menüde ana iş parçacığını meşgul edebilir; menü ibresi `requestAnimationFrame` ile çiziliyorsa ısınma sırasında kare kaçırır; reklam SDK başlatma; bildirim izni penceresi.
- Ölçüm yöntemi (CLAUDE.md "V0.9.12 PERFORMANS ÖLÇÜM DERSİ"): CDP CPU 3× yavaşlatma, `Tracing` uzun görevler, `Profiler`, ve `tools/cold-gpu.mjs` ile ilk açılış kare aralıkları; menüde 10 sn rAF aralıkları kaydedip >33 ms kareleri ve nedenlerini (uzun görev, `WARM` adımı) çıkar.
- Genel tarama: menü, mağaza, Ayarlar, oyun içi, geçişler, reklam kapanışı sonrası dönüş, uygulamaya geri dönüş (`visibilitychange`) — her yerde uzun görev (>50 ms) avı.

## 3. Reklam geliri (kullanıcı kaygısı)

- Kullanıcı: "millet reklam izlemiyor, çünkü jokerleri açabiliyor, para basabiliyor; para kazanamıyorum."
- Madde 1'deki kayıt koruması bunun ön koşulu. Ayrıca ekonomiyi gözden geçir: reklamın değeri (Hediye merdiveni, ikinci şans, coin ödülü) oyuncuya yeterince cazip mi? Bu bir tasarım kararı: önce kullanıcıya 3-4 alternatif göster (CLAUDE.md "Büyük değişiklikte önce görsel tasarım göster"), kodlama onaydan sonra. Gerçek reklam kimliği ve UMP onay formu Play üretim öncesi ayrı iş (bkz. docs/play-store-hazirlik.md).

## 4. Play Console "DEX kodu optimizasyonu" önerileri (kullanıcı, 2026-10-22)

- Play "kod karartma %1, R8 yapılandırması yok, en iyi performans için AGP 9.0'a yükselt ve R8'i kullan" diyor (önem: düşük, yayını engellemez). Madde 1'deki R8/minify ile birlikte yap: `android/app/build.gradle` `minifyEnabled true` + `shrinkResources`, `proguard-rules.pro` (Capacitor ve AdMob eklentisi kuralları), AGP 9.0 yükseltmesi Capacitor 8.5.3 ve Gradle 8.14.3 ile uyumlu mu önce kontrol et (uyumsuzsa AGP'yi mevcut sürümde bırak, yalnızca R8 aç); yükseltmeden sonra emülatörde tam akış (açılış, reklam, bildirim, mağaza) ve `./tools/release-aab.sh` denetimi.
- "Bellek sayfa boyutu: 16 KB'ı destekler" yazıyor, yani bu kısım tamam; yeni AGP/eklenti sürümünde yeniden doğrula (yerel `.so` kitaplığı varsa 16 KB hizalı olmalı).
