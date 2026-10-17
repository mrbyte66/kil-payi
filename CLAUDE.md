# Kıl payı

Android refleks oyunu. Kullanıcı Türkçe konuşuyor ve teknik değil; kararları sen ver, sonucu sade Türkçeyle anlat.
Hedef: abonelik, sunucu ya da API'ye bağlı olmayan, tamamen çevrimdışı çalışan oyun. Ücretli SaaS ekleme.

## Yapı

- `src/game.html`: oyunun tamamı (HTML, CSS, JS). Tek kaynak bu dosya; `build.sh` onu tam belgeye çevirir. Web (Artifact) sürümü kullanıcı isteğiyle silindi, yeniden yayınlama.
- `build.sh`: `src/game.html` -> `www/index.html`. `DEBUG=1 ./build.sh` test kancası ekler (`window.__kp`), yayın sürümüne eklenmez.
- `src/fonts/`: Fredoka ve Nunito (OFL). `node tools/fetch-fonts.mjs` ile indirilir, `www/` sürümü bunları yerelden okur.
- `tools/sim.mjs`: zorluk simülatörü. `src/game.html` içindeki `TUNE-START`/`TUNE-END` bloğunu okur.
- `CHANGELOG.md`: sürüm notları (Türkçe, kullanıcı gözüyle). `tools/release.sh`: sürüm APK'sını `dist/kil-payi-v<sürüm>.apk` adıyla üretir.
- `android/`: Capacitor 8.5.3 Android projesi. `capacitor.config.ts` içinde geçici appId `com.mrbyte66.kilpayi` (yayından önce kullanıcıyla kesinleştir).

## Kararlar

- Paketleme: Capacitor. Reklam: `@capacitor-community/admob` (topluluk eklentisi), sürüm kilitli (8.2.1). Sorun çıkarsa kendi köprümüzü yazarız.
- Geliştirirken yalnızca Google test reklamları kullan; gerçek reklam kimliğiyle kendi cihazında tıklama yapma.
- Paket sürümleri `--save-exact` ile kilitli. Anahtar dosyaları (`*.keystore`, `*.jks`) depoya girmemeli.
- Sunucu gerektiren özellik ekleme (skor tablosu gibi). İleride Google Play Games Services düşünülebilir.

## Oyun sistemleri

- Oyunda geçerli olan kilit modeli yolculuktur: `JKIND` (iyi kilitler), `JTWIN` (engel ikizleri), `JEV` → `JEVENTS` (hangi seviyede ne açılır), `MECH` (kilitlerin sayıları), `MIXES` (karışımlar); spawn `spawnChallenge` (+ `addTwin`), vuruş `tap`/`release`/`hit`/`trap` (tut-bırak pininde dokunuş basış ve bırakış olarak iki olaydır), tur durumu `G.chal` ve `updateChal`, tür açılışı `fireEvent`. Yeni tür eklerken `IMPL_GOOD`/`IMPL_TWIN` ve `BOOK` (kilit defteri) tablolarına, `STR`'de `k_`/`rule_`/`warn_` satırlarına (TR ve EN), `drawPin` ve `drawLockIcon` çizimlerine de ekle (yapılmamış türlerin olayı atlanır). `KIND` tablosu eski modeldir, yalnızca `tools/sim.mjs` kullanır.
- Yolculuk zorluğunu `tools/bot.js` ile ölç (DEBUG=1 derlemesinde; `www/` içine kopyalayıp sayfaya yükle, ya da konsola yapıştır): `bulk(['normal'], 40, [['orta', 0.08, 0.75]])`, her beceri ayrı çağrıda (uzun çağrı tarayıcı aracında hata verir); `kindStats()` kilit başına vuruş oranını gösterir. Kilit ya da ayar değiştirdiğin her seferde çalıştır, tuzakların hedeflerin üstüne düşmediğinden emin ol. Hedef tablosu ve son ölçüm `docs/yolculuk-tasarimi.md` sonunda. Bot insan değildir: insan yeni kuralı ilk görüşte öğrenmek zorunda kaldığı için daha çok ölür. Tarayıcı panelinde sayfa önbellekte kalır: yeniden derleyince adrese `?v=N` ekle. `www/` içine koyduğun geçici test dosyalarını `tools/release.sh` siler.
- Aletler `TOOL` tablosunda; stok ve seviye `save.tools`. Alet çubuğu oyun alanının altında ve oyun dokunuşu almaz (kasıtlı, kazara kullanımı önler).
- Seviyeler (`LEVEL`: rahat, normal, usta) ve seri çarpanı (`comboMult`) TUNE bloğunda, sim ile paylaşılır. Seviye çarpanlarını değiştirince `node tools/sim.mjs 2000 seviye` çalıştır; hedef: Rahat'ta bir beceri düzeyi, Normal'in bir alt düzeyi gibi oynasın.
- Her seviyenin rekoru ayrı (`save.bests`); `save.best` kaldırıldı, eski kayıt Normal'e taşınır.
- Övgü ve laf satırları `LINES` içinde (TR ve EN). Yeni satır eklerken iki dili de doldur; ton hafif şakacı kalsın, aşağılayıcı olmasın. Kullanıcı özellikle "Senin yapacağın iş değil" tarzı laf istedi.
- İki halkada dokunuş ekranın neresinde olursa olsun hedefteki ibreyi vurur (sol/sağ kuralı kaldırıldı); iç halka lila, dış halka şeftali boyanır. Çift pimde iki hedef arası da açıldı. Nedeni: arkadaşlardan "iki tane olan böyle olmamalı" geri bildirimi geldi; kullanıcı bunun iki halka olduğunu doğruladı (çift pimdeki açma önlem olarak yapıldı, şikâyet konusu değildi). Ayrıntıyı (sol/sağ kuralı mı, iki ibreyi aynı anda izlemek mi) arkadaşlar söylemedi; yeni sürümden sonra tekrar sor.
- **Yolculuk (onaylı tasarım, V0.5.0):** `docs/yolculuk-tasarimi.md` ve kilit fikirleri `docs/kilit-katalogu.md`. 10 seviye (~5,5 dk), seviye başında iyi kilit, ortasında engel ikizi, ardından kısa cehennem
  bölümü (cennet kaldırıldı), kontrastlı temalar ve yumuşak geçiş. Ekranda yalnızca "Seviye N" yazar, toplam gösterilmez. Süreler bot ölçümüyle ayarlandı
  (`JOURNEY.normal/hell`, cehennem gücü `hellK`; ölçüm belgede). Kullanıcı kalp simgesini sevmedi: can yeşil "+ Can" kapsülüdür. Jokerler parlayarak
  ipucu verir (`adviceFor`), oyun `save.run` ile kaldığı yerden devam eder. Yeni özellik eklerken önce o belgeyi oku, bitince belgedeki "Yapım sırası ve
  durum" bölümünü güncelle. V0.5.0 tamam (Seviye 4-10 kilitleri); sıradaki: katalogdaki kalan fikirler (Sarkaç, Renk, Sis...) sonsuz mod için, kullanıcının oyun sonrası geri bildirimine göre. İkon/imzalı paket/gizlilik sayfası/gerçek reklam kimliği ayrı sürümde (kullanıcı Play hesabı açınca haber verecek).
- Cehennem gücü `JOURNEY.hellTab` (seviye başına tablo, 1 = tam güç) ve `phase.hell` tam güç değerleriyle ayarlanır; her değişiklikten sonra `hellLine(0.08, 0.75)` ile seviye seviye geçme oranına bak (hedef: orta oyuncu ilk seviyelerde ~%95+, 9-10'da ~%40-60;
  yeni başlayan %60-85). Çarpanlar normal bölümün üstüne bindiği için geç seviyelerde güç aşağı inmeli. Süreye göre hedef uzunluğu `WIDE`/`wideAt` (TUNE bloğunda). Joker sırası: basılı tutarak çalışır, kısa dokunuş oyuna geçer; yeni dokunuş yolları `tapNear` mantığını bozmamalı.
- Kullanıcıdan onay bekleyen tasarımlar (V0.5.1 sonrası gösterildi): kilit defterinde açılmamış kilitleri gösterme + her satırda "Dene" (kısa canlı deneme), dördüncü zorluk "Cehennem". Onay gelmeden kodlama.
- Sis ve renk kilitleri yapılırken tasarım kuralları belgede ("Adil oyun kuralları"): ibre hep görünür, renk hedefin içinde değişmez
  (halka iki bölgeli). `DEBUG=2 ./build.sh` kancayı ekler ama duraklatmayı kapatmaz (yaşam döngüsü testi için; `DEBUG=1`'de `pause()` hiçbir şey yapmaz).
- Kullanıcı geri bildirimi (V0.4.1 sonrası): yeni kilit görünüşleri tutarlı olmalı (aynı şekil aynı anlam), etiket yazıları halkanın üstüne konmaz, bonuslar az,
  zorluk gerçekten artmalı. Yeni kilidi önce görsel olarak çizip göster, onaylanınca kodla.
- Hikaye/harita yok; kullanıcı gereksiz buldu. Eklenmesi önerilmesin.

## Ortam notları (bu makine)

- Node 22, Java 21 (JAVA_HOME=$(/usr/libexec/java_home)), Android SDK `~/Library/Android/sdk` (platform 34, build-tools 34/35, emülatör Pixel_8_API_33 arm64). cmdline-tools yok.
- Capacitor 8 için SDK platform 36 gerekir (compileSdk/targetSdk 36); AGP kendisi indirmeye çalışır, lisans kabulü gerekebilir (kullanıcıya sor).
- Bu ağda Java, `release-assets.githubusercontent.com` adresine bağlanamıyor (curl bağlanıyor). Gradle dağıtımı bu yüzden curl ile
  `~/.gradle/wrapper/dists/gradle-8.14.3-all/<hash>/gradle-8.14.3-all.zip` konumuna elle indirildi. Benzer GitHub kaynaklı indirmeler de takılabilir.

## Sürüm süreci

- Sürüm adları `V0.x.y`. Kullanıcı sürümleri bu adlarla anar ("V0.4.0'daki şu seviyeyi koru"), bu yüzden APK'yı hep sürüm adıyla ver: `dist/kil-payi-v0.x.y.apk`.
  Sürüm adı `android/app/build.gradle` içindeki `versionName`; her sürümde `versionCode` da bir artar. Eski sürümlerin APK'larını silme (`dist/` git'te yok).
- Her sürümde sırayla: `CHANGELOG.md`'yi güncelle, `./tools/release.sh` ile APK üret, commit'le, `git tag -a v0.x.y -m "..."`,
  `git push origin android-capacitor --tags` (kullanıcı her sürümde push'lamamı istedi), sonra APK'yı Wi-Fi/QR ve SendUserFile ile ver.
- Büyük değişiklikte önce görsel tasarım göster, kullanıcı onaylayınca kodla.

## Çalışma kuralları

- Oyun mantığını değiştirince `node tools/sim.mjs 2500` ile zorluk dengesini kontrol et.
- Arayüz değişikliklerinde açık ve koyu tema, telefon genişliği ve mevcut tasarım dili (lila + şeftali, yuvarlak formlar) korunmalı.
- Dal: Android çalışması `android-capacitor` dalında; `main` dokunulmamış.
