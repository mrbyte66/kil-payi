# Kıl payı

Refleks oyunu. Kadran üzerinde dönen ibreyi şeftali bölgedeyken yakala; süre bitmek üzereyken (son 1 sn) vurursan puan ×3.

## Yapı

- `src/game.html`: oyunun tamamı (HTML, CSS, JS). Artifact olarak bu dosya yayınlanır.
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

### Simülasyon

```sh
node tools/sim.mjs 2500          # eski ve yeni modeli 5 beceri düzeyinde karşılaştırır
node tools/sim.mjs 2500 yeni     # yalnızca yeni model, dalga konumuna göre vurma oranları
node tools/sim.mjs curve         # zorluk eğrisi verisi (JSON)
DIFF_OVERRIDE='{"rise":0.7}' node tools/sim.mjs 2500 yeni   # parametre denemesi
```

Simülasyon, gerçek oyunla aynı `TUNE` bloğunu okur. Oyuncular zamanlama sapması (sigma) ve dikkat kaybı olasılığıyla modellenir;
gerçek oyuncu verisi geldiğinde bu değerler yeniden kalibre edilmelidir.

## Platform köprüsü

`Platform` nesnesi web'de demo davranır: `rewardedAd` sahte bir reklam gösterir, `vibrate` tarayıcı titreşimini kullanır,
`track` konsola yazar. Android sürümünde bu üç fonksiyon AdMob, Haptics ve Firebase ile değiştirilecek.

## Yol haritası

1. Android paketleme (Capacitor) ve gerçek AdMob ödüllü reklam
2. Joker mağazası, günlük meydan okuma ve seri
3. Kozmetik (ibre, iz ve hedef renkleri), başarımlar
4. Analytics, mağaza sayfası, kapalı test, yayın
