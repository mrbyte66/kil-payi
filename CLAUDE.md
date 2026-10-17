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
- Aletler `TOOL` tablosunda; stok ve seviye `save.tools`. Alet çubuğu ekranın en altında ve tek dokunuşla çalışır (V0.6.1; basılı tutma ve `tapNear` kaldırıldı, kullanıcı "jokerler çalışmıyor" dedi). Kazara kullanımı yerleşim önler: `relayout()` halka ile joker arasında parmak boyu boşluk bırakır (`gapMin` 70, kısa ekranda 54 px); bu boşluğu daraltma.
- Seviyeler (`LEVEL`: rahat, normal, usta, cehennem) ve seri çarpanı (`comboMult`) TUNE bloğunda, sim ile paylaşılır. Cehennem bölümü kademeye göre: `hell: 'none'` (Rahat, Normal), `'phases'` (Usta: seviye sonlarında açılıp kapanır), `'always'` (Cehennem baştan sona; kullanıcı isteği). Cehennem kademesinde ayrıca `drain`, `twins`, `hellScale` alanları (yalnızca onda var). Cehennem ayarı: hedef çarpanı ana kaldıraçtır, hedef: pro bot ≈ %25, usta bot ≈ %5 bitirsin (kullanıcı: "harbi cehennem, refleksi çok iyi olanların yarısı geçebilsin"; V0.6.0'daki pro %35 "kolay" bulundu). Seviye çarpanlarını değiştirince `node tools/sim.mjs 2000 seviye` çalıştır; hedef: Rahat'ta bir beceri düzeyi, Normal'in bir alt düzeyi gibi oynasın.
- Her seviyenin rekoru ayrı (`save.bests`); `save.best` kaldırıldı, eski kayıt Normal'e taşınır.
- Övgü ve laf satırları `LINES` içinde (TR ve EN). Yeni satır eklerken iki dili de doldur; ton hafif şakacı kalsın, aşağılayıcı olmasın. Kullanıcı özellikle "Senin yapacağın iş değil" tarzı laf istedi.
- İki halkada dokunuş ekranın neresinde olursa olsun hedefteki ibreyi vurur (sol/sağ kuralı kaldırıldı); iç halka lila, dış halka şeftali boyanır. Çift pimde iki hedef arası da açıldı. Nedeni: arkadaşlardan "iki tane olan böyle olmamalı" geri bildirimi geldi; kullanıcı bunun iki halka olduğunu doğruladı (çift pimdeki açma önlem olarak yapıldı, şikâyet konusu değildi). Ayrıntıyı (sol/sağ kuralı mı, iki ibreyi aynı anda izlemek mi) arkadaşlar söylemedi; yeni sürümden sonra tekrar sor.
- **Yolculuk (onaylı tasarım, V0.5.0):** `docs/yolculuk-tasarimi.md` ve kilit fikirleri `docs/kilit-katalogu.md`. 10 seviye (~5,5 dk), seviye başında iyi kilit, ortasında engel ikizi, ardından kısa cehennem
  bölümü (cennet kaldırıldı), kontrastlı temalar ve yumuşak geçiş. Ekranda yalnızca "Seviye N" yazar, toplam gösterilmez. Süreler bot ölçümüyle ayarlandı
  (`JOURNEY.normal/hell`, cehennem gücü `hellK`; ölçüm belgede). Kullanıcı kalp simgesini sevmedi: can yeşil "+ Can" kapsülüdür. Jokerler parlayarak
  ipucu verir (`adviceFor`), oyun `save.run` ile kaldığı yerden devam eder. Yeni özellik eklerken önce o belgeyi oku, bitince belgedeki "Yapım sırası ve
  durum" bölümünü güncelle. V0.5.0 tamam (Seviye 4-10 kilitleri); sıradaki: **Işınlanma pimi** (kullanıcı V0.6.0 sonrası istedi: ibre kapıya girer, çıkış anı rastgele ve "hızlı çıksın"; önce görsel tasarım gösterilip onaylanacak, bkz. yolculuk belgesi "Yapım sırası"), sonra katalogdaki kalan fikirler (Sarkaç, Renk, Sis...) sonsuz mod için, kullanıcının oyun sonrası geri bildirimine göre. İkon/imzalı paket/gizlilik sayfası/gerçek reklam kimliği ayrı sürümde (kullanıcı Play hesabı açınca haber verecek).
- Cehennem gücü `JOURNEY.hellTab` (seviye başına tablo, 1 = tam güç) ve `phase.hell` tam güç değerleriyle ayarlanır; her değişiklikten sonra `hellLine(0.08, 0.75)` ile seviye seviye geçme oranına bak (hedef: orta oyuncu ilk seviyelerde ~%95+, 9-10'da ~%40-60;
  yeni başlayan %60-85). Çarpanlar normal bölümün üstüne bindiği için geç seviyelerde güç aşağı inmeli. Süreye göre hedef uzunluğu `WIDE_TAB`/`wideAt` (TUNE bloğunda; süre çubuğunun her saniyesi için ayrı çarpan, 8. sn ×0,8 ... 1. sn ×1,62, bitmek üzereyken ×1,8; kullanıcı isteği). Genişlik tablosunu ya da tier çarpanlarını değiştirince tüm kademeleri yeniden ölç: tablo süresi azalan oyuncuya çok cömert, hep aynı ayarla ölçmek yanıltır.
- Kademe değişimi (V0.6.1): `save.run.lvl` yarım kalan oyunun kademesidir, açılışta kademe seçici ona eşitlenir. Yarım kalan oyun varken başka kademe seçilirse `#swap` onay penceresi çıkar (`runPending` kaybolacak coini hesaplar); "Sil ve geç" `save.run`'ı siler. Kullanıcı resume'u sevdi, yalnızca modlar arası karışmasın istedi.
- Dikende (`nefes` kilidinin diken ikizi) kapanma payı `p.br.a` seviyeyle büyür (`0,22 + 0,4 × yoğunluk + 0,05 × ★`, en çok 0,62); 0,72'ye çıkarınca nefes en büyük katil oldu ve Cehennem aşılmaz hâle geldi; 0,62 sınırında da Cehennem'de pro botun ölümlerinin %35'i nefesten (ayarı daha da büyütme).
- Dene modu (V0.6.0, kilit defterinden): `G.practice` doluyken yolculuk, süre, kayıt ve rekor devre dışıdır (`update`, `lethal`, `persistRun`, `noteSeen` korumaları); yeni kilit eklerken `PRAC_TWIN`/`PRAC_NEED` tablolarına bak ve `tools/bot.js` ile `runBot(..., { setup: () => startPractice(tür) })` her kilidin denemesini bitirebiliyor mu kontrol et.
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
