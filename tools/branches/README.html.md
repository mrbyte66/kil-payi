# Kıl payı

Refleks oyunu. Kadran üzerinde dönen ibreyi şeftali bölgedeyken yakala; süre bitmek üzereyken (son 1 sn) vurursan puan ×3.

## Dallar

Bu dal yalnızca **HTML projesidir**: oyun tarayıcıda çalışır. Aynı oyunun Android'e paketlenmiş hali ayrı dalda: **`android`** (Android Studio projesi, APK). İki dal da `main`'e birleştirilmez,
ayrı ayrı sürdürülür; her sürümde ikisi de güncellenir. `main` ilk oynanabilir sürümdür ve olduğu gibi bırakıldı.

## Yapı

- `src/game.html`: oyunun tamamı (HTML, CSS, JS). Tek kaynak bu dosyadır.
- `build.sh`: `src/game.html` dosyasını tam bir belgeye çevirip `www/index.html` üretir (Android dalı bu dosyayı paketler).
  `DEBUG=1 ./build.sh` test kancası ekler (`window.__kp`) ve duraklatmayı kapatır; `DEBUG=2` kancayı ekler ama duraklatma açık kalır
  (ana ekran, ekran kilidi, geri tuşu denemeleri için). İkisi de yayın sürümüne girmez.
- `www/`: derlenmiş çıktı (depoda yok).
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
  iki halka ✚ kilitli halka, ışınlanma pimi (V0.7.0: mavi kapıdan girer, turuncudan rastgele bir an sonra çıkar), hayalet ✚ hayalet tuzak, bomba pim, gelgit ✚ girdap, tut-bırak ✚ sıcak yay. Sayılar `MECH` tablosunda; tür tabloları `JKIND`,
  `JTWIN`, `IMPL_GOOD`/`IMPL_TWIN` (yeni tür eklerken hepsine ve `BOOK` kilit defterine eklenir). Kalan fikirler `docs/kilit-katalogu.md` içinde.
  Tut-bırak pininde dokunuş iki olaydır: basış (`tap`) ve bırakış (`release`).
  **İlk görüşte tanıtım: Hayalet gösteri (V0.9.1):** yeni kilit ya da engel ilk kez geleceği an oyun durur; gerçek halkada yeni pinler spot ışığıyla aydınlanır, saydam bir hayalet ibre ve hayalet parmak doğru hamleyi bir kez oynar, halkanın altındaki tek satırlık şerit anlatır, sonra gerçek pinler gelir ve "Sıra sende!" yazar (`INTRO`, `G.mode = 'intro'`, `drawSpot`, `drawDemoFront`); dokununca geçilir, yalnızca ilk görüşte çıkar (`save.intro`).
  V0.8.0'daki üst kart, V0.9.0'daki tekrar eden Spot ışığı ve ✓/✕ işaretleri kaldırıldı. Yeni kilit eklerken `INTRO` sahnesi (`a0` ile) ve `STR`'de `ic_<tür>` satırı da gerekir.
  **Cehennem çemberi (V0.8.0, V0.9.6):** yalnızca Cehennem kademesinde çember nefes alır ve ibrenin tersine döner (`HX`, `hellFx`): Seviye 1-2'de dönmez, 3-5'te tek yönlü yavaş, 6-10'da iki yönlü karışık (yön 5-9 sn'de bir yavaşça ters döner, `HELL_ROT`); sarmal yoktur, sıvı dönüşü izlemez; yalnızca görüntüdür. **Oyuncu yanınca (her kademede) çember yanıp küle döner** (`startBurn`: alev, 8 parça, ~150 kor; ikinci şansta çember yeniden belirir). Test: `node tools/hell-test.mjs`.
  **Süre ortada, yeni kilit ipucu, ikinci şans, rekor (V0.9.0):** süre çemberin ortasındaki kaptadır (sıvı seviyesi, `drawTimeVessel`; son saniyede dalga ya da titreşim yok), puan HUD'un üstündedir ve altında rekora yaklaşma çubuğu vardır; yeni kilit açıldıktan hemen sonraki turda gelir (`CFG.newAfter`); hedef boyu kademeye göre süreyle değişir (`LEVEL.wide`, `hwCap`, `HW_FLOOR`); coin kaynakları kademe çarpanıyla çarpılır (`runCoins`; Rahat ×0,12, Normal ×0,3, Usta ×0,54, Cehennem ×0,75; alet yükseltmesi ×1,5); ölünce geri sayımlı ikinci şans kartı (en çok 3 hak: 25 / 50 / 100 coin, reklam yalnızca ilk iki hakta); rekor kırılınca konfeti (`celebrateRecord`). Ayrıntı `docs/yolculuk-tasarimi.md`.
- **Jokerler ve can:** alet çubuğu ekranın en altındadır; işe yarayacağı an ilgili joker parlar (`adviceFor`, yalnızca ipucu), jokere tek dokunuş yeter (V0.6.1; basılı tutma kalktı). Halka ile joker sırası arasında parmak boyu boş alan bırakılır (`relayout`), oyun dokunuşları oraya gider.
  Her 3 seviyede bir joker hediye edilir. En fazla 1 yedek **can** taşınır (yeşil "+" hedefi, süre bitince +3 sn).
- **Dene (kilit defteri):** defterden bir kilidin kısa canlı denemesi (`startPractice`, `G.practice`); süre, ceza, puan ve kayıt yok, ayrıntı `docs/yolculuk-tasarimi.md`. Yeni kilit eklerken `PRAC_TWIN` (denemede gelecek engel ikizi) ve gerekirse `PRAC_NEED` tablosuna bak.
- **Eski türler (`KIND`):** vuruş sayısına bağlı eski açılış modeli yalnızca `tools/sim.mjs` tarafından kullanılır; oyunda yolculuk (`JKIND`, `JEVENTS`) geçerlidir.
- **Aletler ve Mağaza (V0.9.2; `TOOL`, `save.own` / `slots` / `equip`, mağaza kodu `JK_PRICE`, `unitPrice`, `upPrice`, `openShop`):** dört joker: steteskop (hedefi genişletir), kronometre (+süre), kalkan (ıskayı bağışlar), kum saati (ibreyi yavaşlatır). Yeni oyuncu yalnızca Kronometre ve 1 yuva ile başlar; diğer jokerler (kalkan 800, steteskop 1.500, kum saati 2.500 coin) ve çanta yuvaları (2. / 3. / 4. yuva: 1.200 / 2.400 / 4.000) **Mağaza**'da açılır; oyuna ve oyun içi joker sırasına yalnızca yuvalardaki jokerler girer (yuvadan fazla joker varsa menüdeki çanta satırından ya da Alet çantası dükkânından seçilir). Stok 1'den başlar, en çok 5; yeni tanenin fiyatı elindeki sayıyla ve joker seviyesiyle artar (30 → 45 → 60 → 90 → 120; seviye 2 ×1,3, seviye 3 ×1,6). Yükseltme, elindeki stoğun yükselen değerini de öder: önce biriktirip sonra yükseltmek ya da tersi toplamda aynı tutardır. Mağaza dört dükkândır: Alet çantası, Yetenekler (Otomatik joker 4.000 coin; Yedek canla başla yakında), Görünüm (yakında), Hediye (ödüllü reklam: 20 · 30 · 40 · 50 · 500 coin; 24 saatlik pencere ilk reklamla başlar ve dolunca hepsi sıfırlanır, `giftState`, kadran pencerenin saatidir). Sahne 296 × 604'lük tasarım alanında çizilip ekrana oranlanır (`fitStore`). **Ayarlar** penceresi (müzik, ses efektleri, titreşim, animasyonlar, Otomatik joker, dil seçimi: Sistem / Türkçe / English, `setLang`) ana ekranın sağ üstündedir; menü müziği (`Music`) çevrimdışı Web Audio ile üretilir ve yalnızca menüde, mağazada, ayarlarda ve kilit defterinde çalar. Mağaza sokağı telefonun saatine göre gündüz (06:30-18:00) ya da akşamdır (`stDay`). Otomatik joker açıkken önerilen joker 0,7 sn sonra kendiliğinden kullanılır (elle de kullanılabilir). Eski kayıtta dört joker ve dört yuva açık kalır. **Animasyonlar (V0.9.4):** oyun telefonun "animasyonları kaldır" ayarına BAKMAZ (kullanıcının telefonunda bu ayar açıktı: konfeti, mağaza geçişleri ve bütün ekran animasyonları görünmüyordu); `RM` yalnızca Ayarlar'daki Animasyonlar anahtarına (`save.anim`, varsayılan açık) bağlıdır, kapalıyken `html.calm` ve `RM` eski "sakin" davranışı verir. Mağaza açılışında başlık, cepheler, buton ve alt şerit sırayla girer (`opening`), dükkâna girerken kapıdan ışık yayılır (`#stBloom`). Geçişleri kare kare görmek için `node tools/anim-frames.mjs <klasör> open enter back close swap`. **Mağaza performansı (V0.9.5):** kaydırma işleyicisi kare başına bir kez ve yalnızca değişince yazar, gökyüzü paralaksı `ScrollTimeline` ile bileşende çalışır, yalnızca odaktaki dükkânın ve seçili dock simgesinin süsleri hareketlidir, görünmeyen görünüm durur, biten animasyon katman bırakmaz; ölçüm `node tools/perf-store.mjs` (GPU=1). **V0.9.7:** dükkân vitrini yerel kaydırma yerine kendi sayfalayıcısıyla gider (parmak şeridi izler, en çok bir dükkân ilerler, `pagerTo`), kaydırırken süs animasyonları kalkar (`mv`); gündüz gökyüzünde bulutlar dükkânların önünden geçer, bulut gölgeleri ve kuş sürüsü vardır (`skyFx`); ölme animasyonu 2,3 kat yavaştır. **V0.9.8:** oyun ekranın en yüksek yenileme hızını ister (`MainActivity`), kaydırma oturma animasyonu bileşende (Web Animations), gündüz bulutları ve kuşları dükkânların arkasındaki gökyüzünde yavaş akar, fiş önce görünmez çizilip sonra kayar, Ayarlar'da tanılama satırı (Hz, WebView, ekran). Test: `node tools/store-test.mjs`. **V0.9.9:** mağaza ilk girişte de akıcı: menü boşta kalınca mağaza görünmez bir kez oynatılıp ısıtılır (`warmStore`, `WARM`), animasyon sırasında parmağın altından kayan öğeye dokunuş kaybolmaz (`stDown`). Ölçüm: `node tools/cold-gpu.mjs`. **V0.9.10:** geri tuşu giriş animasyonu sürerken de ilk dokunuşta çalışır (`leaveRoom`), doğrudan girilen dükkândan geri menüye döner (`SS.direct`), oyun içinde sağ üstte Duraklat düğmesi (`#pauseBtn`) ve puanın yanında çerçeveli "128 / 180" hedef rozeti (`paintBest`). **V0.9.11:** Ayarlar'daki Hz satırı kalktı; kapalı test bildirimleri (17 gün, günde iki kez 09:00 ve 16:30, kurulumdan 1 dk sonra bilgilendirme, o gün girildiyse ikincisi gitmez, dokununca "Gün n/17" kartı; kapatma anahtarı yok; `testSync`, `testPlan`, `TEST`).
- **Seri (kombo, `COMBO`):** ardışık vuruşlar puan çarpanı kazandırır (5, 10, 20 ve 35. vuruşta ×2, ×3, ×4, ×5). Iska seriyi sıfırlar, kalkan korur. Çarpan yalnızca puanı etkiler; coin ham puandan hesaplanır ve kademe çarpanıyla çarpılır (V0.9.0).
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

Sürüm adları `V0.x.y` biçimindedir; değişiklik listesi `CHANGELOG.md` içindedir. Etiketler (`v0.x.y`) `android` dalındadır; bu dalın her sürüm commit'i aynı mesajı taşır.
