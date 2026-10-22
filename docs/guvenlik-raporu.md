# Güvenlik raporu değerlendirmesi (2026-10-22)

Kapalı testteki bir arkadaş, V0.10.1/V0.10.2 APK'sını tersine mühendislikle inceleyip rapor verdi (anahtarı türetip oyunu çözmüş, kayıt imzasını ve bütünlük mührünü aşan çalışan örnekler yazmış).
Aşağıda her maddenin **doğrulanmış** durumu ve kararı var. Ana ilke: oyun **çevrimdışı ve sunucusuz** (proje kuralı, abonelik/sunucu yok); bu yüzden istemcideki hiçbir denetim güvenlik sınırı olamaz. Kod, anahtar ve ekonomi cihazda durur; cihazın sahibi (ya da APK'yı yeniden paketleyen) hepsini değiştirebilir. Rapor da bunu söylüyor ("caydırıcıdır, güvenlik sınırı değildir").

## Doğru ve KAÇINILMAZ (yalnızca sunucu çözer; yapılmadı, nedeni burada)

| Madde | Durum | Neden kapatılamıyor |
|---|---|---|
| Kritik-1: AES anahtarı APK'dan türetilebiliyor | Doğru | Çevrimdışı oyunun şifresini çözen anahtar uygulamanın içinde olmak zorunda (V0.10.1'de kullanıcıya da böyle söylendi). Şifreleme yalnızca "zip'i aç, dosyayı oku/değiştir" yolunu kapatır. |
| Kritik-2: bütünlük denetimi aşılabilir | Doğru | Denetim de istemcide; DEX'teki sabit değiştirilebilir. Kararlı biri her istemci denetimini yamalar. |
| Kritik-3: kayıt HMAC anahtarı kodda | Doğru | İmzanın amacı kodu okumadan localStorage'ı elle düzenlemeyi engellemek; kodu okuyan biri imzalayabilir. Başka telefona taşınabilirlik için anahtar cihaza bağlı da olamaz. |
| Kritik-4: ekonomi istemci tarafı | Doğru | Çevrimdışı oyunun doğası. Doğrulama için sunucu gerekir. |
| Yüksek-1: AdMob test kimlikleri | Doğru, bekleyen iş | Kullanıcının AdMob hesabı yok; gerçek uygulama ve reklam birimi kimliği gelince (Play üretim öncesi) değiştirilecek. Kapalı testte Google test reklamları bilerek kullanılıyor. |

**Yanlış çıkan iddialar:** `isTesting: false / initializeForTesting: false` (kaynakta `ADS.test = true`, emülatörde reklamda "Test Ad" yazıyor); "test birimi gerçek cihazda No fill verir" (Google'ın test birimleri her cihazda test reklamı verir, emülatörde ödül de alındı); "fonts/ ve fonts.css şifresiz" (V0.10.1'den beri APK ve AAB'de hepsi `.kpe`, `unzip -l` ile doğrulandı); "appName tutarsız" (uygulama adı dile göre: Türkçede "Kıl payı", diğerlerinde "Close Call"; `capacitor.config.ts` appName yalnızca CLI içindir).

## Gerçek ve V0.10.3'te kapatılan

- **Sahte reklam yolu** (reklam gösterilmeden ödül): yalnızca tarayıcıda (`NATIVE` false) çalışıyordu ama yayın derlemesinden tamamen çıkarıldı (`DEMO_ADS`, `build.sh` yayın derlemesinde `false` yapar; `release.sh` bunu denetler).
- **FileProvider**: Capacitor şablonundaki, dış depolamanın tamamını paylaşılabilir yapan `file_paths.xml` ve provider kaldırıldı (oyun dosya seçici/kamera kullanmıyor, hiçbir eklenti istemiyor).
- **WebView sertleştirme** (`MainActivity.hardenWebView`): konum, dosya ve içerik erişimi, otomatik pencere açma, çoklu pencere, karışık içerik kapatıldı; yalnızca kendi yerel sayfasına (`https://localhost`) gezinmeye izin verilir (`GameWebViewClient.shouldOverrideUrlLoading`). `setMediaPlaybackRequiresUserGesture(false)` BİLEREK kalır (menü müziği Web Audio ile ilk dokunuşsuz başlar).
- **Yanıltıcı ad**: "SecureWebView/SecureAssets/SecureWebViewClient" → `GameWebView/GameAssets/GameWebViewClient` (işlevleri değişmedi: ilk yüklemeyi bir tur erteleyip şifre çözen istemciyi devreye sokmak).
- **Yedekleme**: `allowBackup` bilerek AÇIK (oyuncu yeni telefona geçince ilerlemesi, coin, rekor gelsin); açık kurallar (`backup_rules.xml`, `data_extraction_rules.xml`) tanımlandı, cihaza özgü WebView önbellekleri yedeğe girmez.
- **Sessiz hata**: bütünlük ve şifre çözme hataları artık `Log.w("KilPayi", ...)` ile günlüğe yazılıyor. Bütünlük denetimi beklenmedik bir G/Ç hatasında KASITLI olarak oyunu engellemez (yanlış alarm meşru oyuncuyu cezalandırır, saldırganı zaten durdurmaz).
- **Boş mor ekran**: şifre çözme hiç devreye girmezse yedek sayfa 25 yeniden denemeden sonra boş ekran yerine "Oyun açılamadı, Google Play'den yeniden yükle" yazar.
- **META-INF/version-control-info.textproto** pakete girmiyor (`vcsInfo { include false }`); `usesCleartextTraffic="false"` açıkça yazıldı.

## Bilinçli olarak YAPILMAYANLAR

- **Fail-closed bütünlük denetimi**: beklenmedik hatada oyunu kilitlemek meşru oyuncuya zarar verir; saldırgan denetimi zaten yamalar.
- **Daha fazla gizleme katmanı** (anahtarı parçalamak, denetimi çoğaltmak, NDK/C++ denetimi, anahtarı DEX/imza özetine bağlamak): bu raporun yazarını dakikalar kadar yavaşlatır, gerçek koruma değildir; yanlış alarm riski (Play'in yeniden imzalaması/dosya değişimi) ve bakım yükü getirir. Sürekli bir silah yarışı; getirisi sıfıra yakın.
- **Sunucu / Play Integrity / AdMob sunucu tarafı ödül doğrulaması**: gerçek çözüm bunlar, ama proje kuralı "sunucu yok, abonelik yok". Gerekirse ileride yalnızca ödüllü reklamı doğrulayan çok küçük bir sunucu düşünülebilir (kullanıcıya sorarak).

## Gerçek telefondan önceki not

Emülatör (yazılımla çizer) ve Mac yükü yüzünden "uygulama yanıt vermiyor" (ANR) uyarıları görülebiliyor; ANR izinde ana iş parçacığı `HardwareRenderer.syncAndDrawFrame` içinde RenderThread'i bekliyor (ekran kartı yazılım çizimi doyuyor), Java kodumuzda değil. Karşılaştırma: `/tmp/emu-ab.sh` tarzı dönüşümlü koşu (V0.10.3 ve V0.10.2 yayın APK'ları, aynı senaryo).
