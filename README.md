# Kıl payı

Refleks oyunu. Kadran üzerinde dönen ibreyi şeftali bölgedeyken yakala; süre bitmek üzereyken (son 1 sn) vurursan puan ×3.

## Yapı

- `src/game.html`: oyunun tamamı (HTML, CSS, JS). Tek kaynak bu dosyadır.
- `build.sh`: `src/game.html` dosyasını tam bir belgeye çevirip `www/index.html` üretir (Capacitor bu klasörü kullanacak).
  `DEBUG=1 ./build.sh` test kancası ekler (`window.__kp`), yayın sürümüne eklenmez.
- `www/`: derlenmiş çıktı.

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

- **Türler (`KIND`):** tek pim, çift pim, kayan pim, tuzak pim, iki halka. Bir oyunda belirli bir vuruş sayısına ulaşınca tür kalıcı olarak açılır, sonraki oyunlarda daha erken karışır. Dalganın "nefes" bölümünde hep tek pim gelir.
- **Aletler (`TOOL`):** stetoskop (hedefi genişletir), kronometre (+süre), kalkan (ıskayı bağışlar), kum saati (ibreyi yavaşlatır). Stok ve seviye cihazda saklanır; coin ile alınır ve yükseltilir, ödüllü reklam coin verir.
- **Seri (kombo, `COMBO`):** ardışık vuruşlar puan çarpanı kazandırır (5, 10, 20 ve 35. vuruşta ×2, ×3, ×4, ×5). Iska seriyi sıfırlar, kalkan korur. Çarpan yalnızca puanı etkiler; coin ham puandan hesaplanır, ekonomi değişmez.
- **Seviyeler (`LEVEL`):** Rahat, Normal, Usta. Hedef genişliği, ibre hızı, süre kazancı, ıska bedeli, kilit eşikleri, başlangıç süresi ve coin çarpanı seviyeye göre değişir. Her seviyenin rekoru ayrıdır (`save.bests`). Üç kısa oyundan sonra "Rahat mod", iki uzun oyundan sonra "Usta mod" önerisi çıkar.
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

Simülasyon, gerçek oyunla aynı `TUNE` bloğunu okur. Oyuncular zamanlama sapması (sigma) ve dikkat kaybı olasılığıyla modellenir;
gerçek oyuncu verisi geldiğinde bu değerler yeniden kalibre edilmelidir.

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
