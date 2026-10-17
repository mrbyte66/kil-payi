# Kıl payı

Refleks oyunu. Kadran üzerinde dönen ibreyi şeftali bölgedeyken yakala; süre bitmek üzereyken (son 1 sn) vurursan puan ×3.

## Yapı

- `src/game.html`: oyunun tamamı (HTML, CSS, JS). Tek kaynak bu dosyadır.
- `build.sh`: `src/game.html` dosyasını tam bir belgeye çevirip `www/index.html` üretir (Capacitor bu klasörü kullanacak).
  `DEBUG=1 ./build.sh` test kancası ekler (`window.__kp`) ve duraklatmayı kapatır; `DEBUG=2` kancayı ekler ama duraklatma açık kalır
  (ana ekran, ekran kilidi, geri tuşu denemeleri için). İkisi de yayın sürümüne girmez.
- `www/`: derlenmiş çıktı.
- `docs/yolculuk-tasarimi.md`: onaylı yolculuk tasarımı, süreler, kilit çiftleri, yapım durumu ve bot ölçümleri.
- `docs/kilit-katalogu.md`: kilit fikirlerinin tam listesi (Kolay/Orta/Zor), V0.5.0'da yapılanlar ve bekleyenler.
- `tools/`: `sim.mjs` (eski vuruş sayısına bağlı zorluk simülatörü), `bot.js` (yolculuğu gerçek kodla oynatan bot).

## Çalıştırma

```sh
./build.sh
python3 -m http.server 8000 --directory www
```

Sonra `http://localhost:8000` adresini aç. Telefon boyutunda denemek için tarayıcıda cihaz modunu kullan.

## Denge ve zorluk ayarları

`src/game.html` içindeki `TUNE-START` / `TUNE-END` arasındaki blok:

- `CFG`: süre ekonomisi (başlangıç süresi, vuruş kazancı, ıska bedeli), devam maliyeti, reklam süresi.
- `DIFF`: zorluk eğrisi. Zorluk dalgalıdır: taban yavaşça yükselir, her 10 vuruşluk dalga önce yükselir (6 vuruş),
  sonra 3 vuruş gevşer ("Nefes al"). `adapt` iyi oynayan oyuncuyu hafifçe zorlaştırır, `mercy` hatadan sonra kısa süre rahatlatır.
  `fatigueFrom` sonrası süre biraz daha hızlı akar, böylece çok uzun oyunlar sonunda biter.

### Kilit türleri ve aletler

- **Yolculuk:** oyun 10 seviyedir (yaklaşık 5 buçuk dk, sonra sonsuz mod). Her seviye bir normal bölüm ve kısa bir **cehennem** bölümüdür (süre hızlı erir,
  ceza ağırdır, hedefler dar; gücü seviyeyle artar). Seviye 4-10'da seviyenin başında yeni bir iyi kilit, ortasında onun engel ikizi gelir (`JEV`).
  Tema yumuşak geçişle kızıl-siyaha döner. Ekranda yalnızca "Seviye N" yazar; yeni kilit üst kartla ve hedefin yanındaki etiketle anlatılır, **Kilit defteri**
  menüden açılır. Bir seviyeyi bitirince **kamp** açılır (menüde "Kamp · Seviye N"). Duraklatma her şeyi dondurur, devam edince 3-2-1 sayılır; oyun uygulamadan
  çıkınca kaydedilir ve menüde "Devam et" çıkar (`save.run`). Zamanlar ve olaylar `JOURNEY`/`JEV` (TUNE bloğu); ayrıntı `docs/yolculuk-tasarimi.md`.
  Kilitler: çift ✚ tuzak, kayan ✚ kayan tuzak, nefes ✚ diken, altın ✚ lanetli altın, sabır pimi ✚ çürük kilit, kasa ✚ alarm, ritim ✚ sahte nota, trafik ışığı,
  iki halka ✚ kilitli halka, hayalet ✚ hayalet tuzak, bomba pim, gelgit ✚ girdap, tut-bırak ✚ sıcak yay. Sayılar `MECH` tablosunda; tür tabloları `JKIND`,
  `JTWIN`, `IMPL_GOOD`/`IMPL_TWIN` (yeni tür eklerken hepsine ve `BOOK` kilit defterine eklenir). Kalan fikirler `docs/kilit-katalogu.md` içinde.
  Tut-bırak pininde dokunuş iki olaydır: basış (`tap`) ve bırakış (`release`).
- **Jokerler ve can:** alet çubuğu ekranın en altındadır; işe yarayacağı an ilgili joker parlar (`adviceFor`, yalnızca ipucu), jokere tek dokunuş yeter (V0.6.1; basılı tutma kalktı). Halka ile joker sırası arasında parmak boyu boş alan bırakılır (`relayout`), oyun dokunuşları oraya gider.
  Her 3 seviyede bir joker hediye edilir. En fazla 1 yedek **can** taşınır (yeşil "+" hedefi, süre bitince +3 sn).
- **Dene (kilit defteri):** defterden bir kilidin kısa canlı denemesi (`startPractice`, `G.practice`); süre, ceza, puan ve kayıt yok, ayrıntı `docs/yolculuk-tasarimi.md`. Yeni kilit eklerken `PRAC_TWIN` (denemede gelecek engel ikizi) ve gerekirse `PRAC_NEED` tablosuna bak.
- **Eski türler (`KIND`):** vuruş sayısına bağlı eski açılış modeli yalnızca `tools/sim.mjs` tarafından kullanılır; oyunda yolculuk (`JKIND`, `JEVENTS`) geçerlidir.
- **Aletler (`TOOL`):** stetoskop (hedefi genişletir), kronometre (+süre), kalkan (ıskayı bağışlar), kum saati (ibreyi yavaşlatır). Stok ve seviye cihazda saklanır; coin ile alınır ve yükseltilir, ödüllü reklam coin verir.
- **Seri (kombo, `COMBO`):** ardışık vuruşlar puan çarpanı kazandırır (5, 10, 20 ve 35. vuruşta ×2, ×3, ×4, ×5). Iska seriyi sıfırlar, kalkan korur. Çarpan yalnızca puanı etkiler; coin ham puandan hesaplanır, ekonomi değişmez.
- **Seviyeler (`LEVEL`):** Rahat, Normal, Usta ve Cehennem (`hell` alanı: Rahat/Normal cehennem bölümü yok, Usta her seviyenin sonunda açılıp kapanır, Cehennem baştan sona; Cehennem'de dar hedef, hızlı ibre, süre çabuk erir, engel ikizleri kilitle birlikte; `drain`, `twins`, `hellScale` alanları). Başka kademeye geçmek yarım kalan oyunu siler, önce sorulur (`#swap`). Hedef genişliği, ibre hızı, süre kazancı, ıska bedeli, kilit eşikleri, başlangıç süresi ve coin çarpanı seviyeye göre değişir. Her seviyenin rekoru ayrıdır (`save.bests`). Üç kısa oyundan sonra "Rahat mod", iki uzun oyundan sonra "Usta mod" (Usta'da "Cehennem modu") önerisi çıkar.
- **Övgü ve laf satırları (`LINES`):** seri kilometre taşlarında övgü ("Wow!"), ıskada hafif laf ("Senin yapacağın iş değil"), oyun sonunda duruma göre başlık. Türkçe ve İngilizce.
- **İki halka:** dokunuş ekranın neresinde olursa olsun hedefindeki ibreyi vurur; iki ibre de hedefteyse hedefine daha yakın olan sayılır.
- Kayıt anahtarı `kilpayi.v1`; yeni alanlar (`tools`, `unl`, `seen`, `lvl`, `bests`, `tips`) eski kayıtla uyumludur. Eski `best` değeri Normal seviyenin rekoruna taşınır.

### Simülasyon

```sh
node tools/sim.mjs 2000          # eski, yalnızca tek pim, ilk oyun ve kariyer modellerini karşılaştırır
node tools/sim.mjs 2000 yeni     # yalnızca yeni model (ilk oyun); tür başına vurma oranı ve dağılım
node tools/sim.mjs 2000 kariyer  # tüm türler zaten açık
node tools/sim.mjs 2000 seviye   # rahat, normal ve usta seviyeleri, her beceri düzeyi için
node tools/sim.mjs curve         # zorluk eğrisi verisi (JSON)
DIFF_OVERRIDE='{"rise":0.7}' node tools/sim.mjs 2500 yeni   # parametre denemesi
```

Yolculuk için ayrı bir bot var: `DEBUG=1 ./build.sh` ile derlenen sayfada (`python3 -m http.server --directory www`, `tools/bot.js` dosyasını `www/` içine kopyalayıp sayfaya
`<script src="bot.js">` ekle ya da içeriğini konsola yapıştır) `bulk(['normal'], 40)` çalıştır; bot gerçek oyun kodunu hızlandırılmış zamanla oynar ve beceri düzeyine göre
kaç saniyede, hangi seviyede, hangi kilitte öldüğünü ve seviyeye ulaşma yüzdelerini verir (`kindStats()` kilit başına tur ve vuruş oranını gösterir, `hellLine(0.08, 0.75)` yalnızca cehennem bölümlerini seviye seviye ölçer;
sonuçlar `docs/yolculuk-tasarimi.md` içinde). Uzun koşuları beceri başına ayrı çalıştır (bir çağrı çok uzarsa tarayıcı aracı hata verir).

Simülasyon, gerçek oyunla aynı `TUNE` bloğunu okur. Oyuncular zamanlama sapması (sigma) ve dikkat kaybı olasılığıyla modellenir;
gerçek oyuncu verisi geldiğinde bu değerler yeniden kalibre edilmelidir.

## Sürümler

Sürüm adları `V0.x.y` biçimindedir; değişiklik listesi `CHANGELOG.md` içindedir ve git'te her sürüm `v0.x.y` etiketini taşır.
`./tools/release.sh` sürüm APK'sını `dist/kil-payi-v<sürüm>.apk` adıyla üretir (sürüm adı `android/app/build.gradle` içindeki `versionName`).

## Android

Capacitor 8 ile paketlenir. Gereken: Node 22, Java 21, Android SDK (`ANDROID_HOME`, platform 36).

```sh
npm install                      # ilk kurulumda
./build.sh && npx cap sync android
cd android && ./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

Emülatörde denemek için:

```sh
~/Library/Android/sdk/emulator/emulator -avd Pixel_8_API_33 -no-window -no-audio &
~/Library/Android/sdk/platform-tools/adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Notlar:

- `DEBUG=1 ./build.sh` ile derlenen sürümde `window.__kp` vardır; WebView'e `adb forward tcp:9222 localabstract:webview_devtools_remote_<pid>` ile bağlanıp oyun durumunu sürebilirsin.
- Reklam kimlikleri Google'ın herkese açık TEST kimlikleridir (`src/game.html` içinde `ADS`, `AndroidManifest.xml` içinde `APPLICATION_ID`). Yayından önce gerçek kimliklerle değiştirilecek.
- Bazı ağlarda Java, `release-assets.githubusercontent.com` adresine bağlanamaz. Gradle dağıtımı takılırsa zip dosyasını curl ile `~/.gradle/wrapper/dists/...` içine koy.

## Platform köprüsü

`Platform` nesnesi web'de demo davranır: `rewardedAd` sahte bir reklam gösterir, `vibrate` tarayıcı titreşimini kullanır,
`track` konsola yazar. Android sürümünde bu üç fonksiyon AdMob, Haptics ve Firebase ile değiştirilecek.

## Yol haritası

1. Android paketleme (Capacitor) ve gerçek AdMob ödüllü reklam
2. Joker mağazası, günlük meydan okuma ve seri
3. Kozmetik (ibre, iz ve hedef renkleri), başarımlar
4. Analytics, mağaza sayfası, kapalı test, yayın
