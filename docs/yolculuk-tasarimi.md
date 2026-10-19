# Yolculuk tasarımı (V0.9.0, onaylı 2026-10-17; V0.9.0 eklemeleri 2026-10-19)

Bu belge oyunun güncel yolculuk tasarımıdır. V0.4.0'daki ilk tasarımdan (cennet bölümü, 15 dakikalık yolculuk) sonra kullanıcı geri bildirimiyle
sekiz kez değişti (V0.4.1 tempo, V0.5.0 çeşitlilik, V0.5.1 cehennem ve düzeltmeler, V0.6.0 Dene ve Cehennem zorluğu, V0.6.1 süreye göre hedef, kademeye göre cehennem, jokerler, V0.7.0 ışınlanma pimi, V0.8.0 ilk görüşte tanıtım, Cehennem çemberi, altın sırası, belirgin hedef boyu, V0.9.0 süre ortada, yeni kilit ipucu, rekor kutlaması, ikinci şans, yeni ekonomi, V0.9.2 mağaza ve joker yuvaları); değişiklik nedenleri `CHANGELOG.md` içinde. Kilit fikirlerinin tam listesi (yapılanlar ve
yapılmayanlar, Kolay/Orta/Zor grupları) `docs/kilit-katalogu.md` içinde. Hikaye/harita yok.

## Fikir

Oyun hızlanarak değil çeşitlenerek büyür. Bir oyun bir yolculuktur: 10 seviye, ortalama bir oyuncu için yaklaşık 5 buçuk dakika. Her yeni **iyi kilit**
seviyenin başında gelir, **engel ikizi** seviyenin ortasında; yani yeni bir şey yaklaşık 13 sn'de bir görülür (V0.4.1'de "4. seviyeden sonra hep aynı oyun"
geri bildirimi bu yüzden). Ekranda yalnızca "Seviye N" yazar; toplam seviye sayısı kullanıcıya gösterilmez.
10. seviyeden sonra "Sonsuz" mod başlar (10. seviye kuralları, zorluk hızlanır).

## Seviye yapısı

Her seviye bir **normal bölüm** ve onun sonunda kısa bir **cehennem** bölümünden oluşur (cennet bölümü V0.4.1'de kaldırıldı).
Cehennem geçilince: +2 sn, coin (2 × (5 + 2 × seviye)), her 3 seviyede bir rastgele joker hediyesi, kamp kaydı.

| Seviye | Normal | Cehennem | Başlangıç | Yeni kilit (✚ = engel ikizi), olay zamanı normal bölümün kesri |
|---|---|---|---|---|
| 1 | 20 sn | 6 sn | 0:00 | Tek pim; çift pim ✚ tuzak pim (0,30); seri çarpanı (0,65) |
| 2 | 22 sn | 6 sn | 0:26 | Kayan pim ✚ kayan tuzak (0); karışım: çift + kayan (0,5) |
| 3 | 22 sn | 7 sn | 0:54 | Nefes pim ✚ diken (0); karışım: nefes + tuzak (0,5) |
| 4 | 22 sn | 7 sn | 1:23 | Altın pim (0) ✚ lanetli altın (0,42); sabır pimi (0,75) |
| 5 | 24 sn | 7 sn | 1:52 | Kasa turu (0) ✚ alarm turu (0,45); çürük kilit (0,78, sabır pimine) |
| 6 | 26 sn | 8 sn | 2:23 | Ritim pim (0) ✚ sahte nota (0,42); trafik ışığı (0,76) |
| 7 | 28 sn | 8 sn | 2:57 | İki halka (0) ✚ kilitli halka (0,48); ışınlanma pimi (0,74, ikizsiz); ★ güçlenme (0,90) |
| 8 | 28 sn | 9 sn | 3:33 | Hayalet pim (0) ✚ hayalet tuzak (0,42); bomba pim (0,76) |
| 9 | 30 sn | 9 sn | 4:10 | Gelgit ibre (0) ✚ girdap (0,48); ★ güçlenme (0,82) |
| 10 | 32 sn | 10 sn | 4:49 | Tut-bırak pim (0) ✚ sıcak yay (0,45); ★ güçlenme (0,82) |
| Sonsuz | 32 sn | 10 sn | 5:31 | Görülmüş kilitlerin karışımı (Sarkaç, Sis, Renk vb. sonraki sürümlerde) |

Sabır pimi, çürük kilit, trafik ışığı, bomba pim ve ışınlanma pimi (V0.7.0) ilk plandaki yedi çifte ek olarak yapıldı (kullanıcı onayıyla); trafik, bomba ve ışınlanma engel ikizi olmadan seviyenin
sonlarına konuldular. Zamanlar `JOURNEY`, olaylar `JEV` (TUNE bloğu); yapılmamış kilitlerin olayları atlanır (`IMPL_GOOD`/`IMPL_TWIN`).
Her yeni kilit, olaydan sonraki ilk turda (V0.9.0, `CFG.newAfter` = 0 tur; eskiden 2 sn, ortalama 1,4-3,1 tur sonra) ve ibreden uzak doğar; ilk hedefi vurulana ya da ıskalanana kadar kart ekranda kalır (en çok 8 sn).

## Cehennem

Süre hızlı erir, ceza ve engel olasılığı artar, hedefler daralır, ibre hızlanır; kızıl-siyah tema, kor ve çatlak efektleri. V0.5.1'de güçlendi: eskiden en güçlü cehennem bile
normal bölümden yalnızca %4 farklıydı (arkadaşlardan "hiç zor değil"). Gücü `JOURNEY.hellTab[L-1]` ile seviye başına verilir (1 = tam güç): `[0.5, 0.65, 0.8, 0.9, 0.9, 0.8, 0.65, 0.5, 0.42, 0.38]`;
10. seviyeden sonra `hellEnd` (0,08) kadar artar (en çok 2); Cehennem kademesinde `hellScale` ile çarpılır. Güç ilk seviyelerde yumuşak başlar, 4-5. seviyede tepeye çıkar, sonra iner (geç seviyelerde normal bölüm zaten çok yoğundur; çarpanlar onun üstüne biner).
Tam güç (k = 1) değerleri: hedef ×0,82, ibre ×1,13, süre erimesi ×1,18, ceza ×1,4, zorluk +0,09, engel ikizi olasılığı 0,78 (normalde 0,3). Etkiler k ile normal bölümden tam güce doğrusal karışır.
Her vuruşta +1 coin; cehennem bitince +2 sn. Adlar (`hellTier`, açılışta çıkan haberde): seviye 1-3 Kolay cehennem, 4-6 Orta cehennem, 7-9 Zor cehennem, 10+ Cehennem.

## Zorluk ve süre ekonomisi

- Taban yoğunluk `0,02 + 0,0085 × (seviye − 1)²` (10. seviyede 0,71), 10. seviyeden sonra seviye başına +0,1 (`ib0`, `ibs`, `ibq`, `ibEnd`).
  10 vuruşluk dalga (genlik 0,2) ve "nefes" araları sürer. Oyuncu mükemmel vurdukça yoğunluk biraz artar, ıskaladıkça azalır (`DIFF.adaptCap` 0,12).
- Vuruş +0,95 sn (mükemmel +0,08, nefes aralarında +0,2), ıska −0,8 sn, tuzak −1,3 sn; hedefler geniş (hwMax 0,56), ibre yavaş (ωMax 3,8).
  Bonuslar V0.5.0'da kısıldı: vuruş 1,1 → 0,95, mükemmel 0,15 → 0,08, cehennem sonu +4 → +2 sn, joker hediyesi her 2 → her 3 seviyede.
  Her kilidin kendi süre/puan değerleri `MECH` tablosunda (altın vuruşu süre vermez, hayalet ×2, sabır ×3, bomba +25 vb.).
- **Süreye göre hedef uzunluğu (`WIDE_TAB`, `wideAt`; V0.6.1):** süre çubuğunun her saniyesinde başka uzunlukta hedef çıkar; tablo saniye başına, aralarında doğrusal:
  8. sn ×0,62 (en zor; V0.8.0, eskiden ×0,8), 7. ×0,80 (eskiden ×0,87), 6. ×0,94, 5. ×1,02, 4. ×1,12, 3. ×1,25, 2. ×1,42, 1. ×1,62, süre bitmek üzereyken ×1,8 (en kolay, kıl payı kurtulma). Daraltma (×1'in altı) ilk üç seviyede yavaş devreye girer
  (1. seviyede hiç daralmaz, uzatma baştan tamdır). Tur başında hesaplanır (hedefin yanındaki tuzak yerleşimiyle çakışmaz). Kullanıcı isteğiyle yapıldı ("8. saniyede zor, 1. saniyede en kolay"); V0.5.1'deki ×0,9 → ×1,3 doğrusal tablonun yerini aldı
  (eski tabloyla Cehennem ayarları kullanılırsa usta bot oyunu %18 bitirirken yeni tabloyla %98 bitiriyor: süresi azalan oyuncu için yeni tablo çok daha cömert, bu yüzden her kademe yeniden ölçüldü).
  Zayıf oyuncuyu kurtarır, süresi hep dolu olan güçlü oyuncuyu çok az sıkıştırır.
  **V0.8.0:** kullanıcı V0.6.1'de farkı hissetmedi ve haklıydı: iyi oynayan oyuncuda çubuk hep 7,5-8 sn'de durur (her vuruş çubuğu doldurur), eski tabloda bu aralık ×0,80-×0,87 idi (%8). Üst iki saniye sertleşti (×0,62 / ×0,80),
  bir ıskadan sonra çıkan hedef (çubuk ~7 sn) belirgin büyür, iki ıskadan sonra ×0,94 olur; alt tarafı (4 sn ve altı) kurtarma cömertliği değişmesin diye aynı kaldı. Orta kısmı (5-7 sn) dikleştirmek Usta ve Cehennem'i fazla zorlaştırdı (Cehennem pro bot %13),
  bu yüzden yalnızca üst iki saniye değişti. Ölçüm (n = 18-70): Normal yeni %3, orta %50, iyi %84; Usta usta %78; Cehennem pro ulaşma %37, bitirme %27; V0.7.0 ile hata payı içinde aynı.
- Zorluk seçici (`LEVEL`, dört kademe). `hell` alanı cehennem bölümlerini belirler (V0.6.1; kullanıcı "orta modda cehennem açılıp kapanmasın, yalnızca zor modda"): Rahat ve Normal `'none'` (hiç cehennem bölümü yok),
  Usta `'phases'` (her seviyenin sonunda açılıp kapanır), Cehennem `'always'` (baştan sona). `tierPh(faz)` kademeye göre fazı verir. Rahat (hedef ×1,2, ibre ×0,9, vuruş ×1,15, ceza ×0,7, başlangıç 7 sn), Normal,
  Usta (hedef ×0,9, ibre ×1,1, vuruş ×0,8, ıska ×1,4, tuzak ×1,25, başlangıç 5,5 sn), **Cehennem** (V0.6.1: baştan sona cehennem bölümü; hedef ×0,82, ibre ×1,18, süre erimesi ×1,25 (`drain`), ıska ve tuzak cezası ×1,5,
  cehennem gücü `hellScale` 0,64 (`hellK` ile çarpılır), coin ×2, başlangıç 5,5 sn; engel ikizleri kilitle birlikte açılır ve en az %85 olasılıkla gelir (`twins`); kırmızı rozet; ayrı rekor).
  Cehennem haberi oyun başında bir kez çıkar; HUD'daki cehennem geri sayım rozeti yalnızca Usta'da görünür.
  Hedef (kullanıcı isteği): "harbi cehennem; yalnızca refleksi çok iyi oyuncuların yarısı geçebilmeli". Botla: pro bot %25, usta bot %5, iyi bot %0 bitiriyor (ölçüm sonda). Yalnızca çarpanlarla (V0.6.0, cehennem bölümü hep açılıp kapanıyordu,
  yalnızca tema kırmızıydı) pro bot %35, usta bot %18 bitiriyordu ve kullanıcı "kolay" dedi; bu yüzden en iyi bot için de belirgin biçimde sertleştirildi. Hedef genişliği çarpanı ana kaldıraçtır (×0,94'te pro %60, ×0,90'da %33, ×0,80'de %12-20).
  Her kademenin rekoru ayrıdır; Normal'de iki uzun oyun sonra Usta, Usta'da iki uzun oyun sonra Cehennem önerisi çıkar; Cehennem'de üç kısa oyun sonra Usta önerisi.
- **Hedef boyu kademeye göre (V0.9.0, "Keskin"; kullanıcı seçimi):** `LEVEL[kademe].wide = [8 sn çarpanı, 0 sn çarpanı]` (Rahat 0,95 → 2,6; Normal 0,52 → 2,0; Usta 0,45 → 1,8; Cehennem 0,36 → 1,5); `wideAt(süre, seviye, kademe)` bu iki ucu `WIDE_TAB` biçimiyle (üst saniyeler dik, alt saniyeler yumuşak) birleştirir.
  Bir hedefin yarı genişliği `HW_FLOOR` (0,075 rad ≈ 4,3°) ile kademenin `hwCap` değeri (Rahat/Normal 0,8, Usta 0,6, Cehennem 0,35 rad) arasında kırpılır (adil alt ve üst sınır). Kademe çarpanları botla yeniden ayarlandı: `hw` Rahat 0,95, Normal 1,03, Usta 1,0, Cehennem 0,82; Cehennem `drain` 1,25 → 0,9
  (hedef çok daralınca eski süre baskısı Cehennem'i aşılmaz yapıyordu: pro bot %4 bitiriyordu, şimdi %23). Ölçülen ortalama hedef toplam genişliği (derece, 'tek' kilit, çubuk 8 sn → 2 sn): Normal 7-10. seviye 20° → 52°, Rahat 33° → 70°, Usta 17° → 42°, Cehennem 4-6. seviye 12° → 37°, 7-10. seviye 10° → 31°.
  Ayar yaparken `tools/bot.js` içinde `window.__logChal = true` açıp `__chalLog` (tur başına süre ve hedef genişliği) okunur; kademeler yeniden ölçülür (aşağıda "V0.9.0 ölçümü"). Hep aynı ayarla ölçmek yanıltır: süre azalan oyuncu için tablo çok cömerttir.
- **Ekonomi (V0.9.0, kullanıcı seçimi B "Düzenli oyun"):** bütün coin kaynakları `LEVEL[kademe].coin` ile çarpılır (`runCoins`: ham puan/4 + 2 × kıl payı + yolculuk coinleri; seviye ödülü `rewardHell` ve +100 bitiriş ödülü de). Çarpanlar: Rahat 0,12, Normal 0,3, Usta 0,54, Cehennem 0,75; alet yükseltme fiyatları ×1,5 (`TOOL.up`: 135/330, kalkan 180/390). Koşu başına kazanç (bot):
  Rahat orta 71, Normal orta ~100, Usta iyi ~215-235, Cehennem usta ~400 (eskiden 480 / 341 / 521 / 784); dakikada Rahat ~12, Normal ~26, Usta ~61, Cehennem ~143. Alet çantasının tamamı Normal'de orta oyuncu için ~20 koşu (eskiden 4-5). Reklamla coin artık yalnızca Hediye dükkânında: 20 · 30 · 40 · 50 · 500, 24 saatlik pencere ilk reklamla başlar ve dolunca sıfırlanır (V0.9.3). Seviye ödülleri artık kademe çarpanından muaf değil (eskiden muaftı, asıl para oradan geliyordu).
- **İkinci şans (V0.9.0, "Geri sayımlı"):** ölünce (`G.n >= 3`) kartta 5 sn'lik geri sayım halkası (`contLeft`, `CFG.contWait`), "Reklam izle" ve coin düğmesi. Bir koşuda en çok `CFG.contMax` = 3 hak (`G.contN`, `RUN_KEYS`'te kayıtlı), fiyat `contCost(n)` = 25 × 2ⁿ (25 / 50 / 100), reklam yalnızca ilk `CFG.contAds` = 2 hakta; her hak +4 sn ve 3 sn yavaşlatma (`doContinue`).
  Sayaç dükkân açıkken ya da reklam oynarken durur; süre dolunca blok solarak kapanır (`.cont.fade`, yükseklik yumuşakça 0'a iner, kart sıçramaz). Kısa ekranda (≤700 px) başlık gizlenir. Üçüncü hakta yalnızca coin düğmesi görünür ("Devam et · 100").
- **Rekor kutlaması (V0.9.0, "Konfeti yağmuru"):** oyun içinde `G.score > G.best0` (oyun başındaki rekor, en az `CFG.recMin` = 25; kamp ve Dene hariç) ilk kez olunca `celebrateRecord`: halkanın arkasında konfeti (`G.conf`, ana tuvalde), üstte altın "Yeni rekor!" kapsülü (`G.recPill`; seviye şeridi ya da kart açıksa bekler), HUD'da altın "En iyi" çipi (`paintBest`) ve altın çubuk.
  Oyun sonunda yeni rekorda (`G.newBest`, ≥10 vuruş) başlık, puan ve rozet altın olur, konfeti ikinci saydam tuvalde (`#cv2`) kartın önünde patlar. `RM` açıksa konfeti yok.
- **Yeni kilit ipucu: Spot ışığı (V0.9.0, V0.9.1'de kaldırıldı):** her kilit ve engelin ilk üç görünüşünde ekran kararıp ibre yavaşlıyordu (`G.cue`, `cueRate`) ve hedefin yanında küçük ✓/✕ işaretleri çıkıyordu (`makeLabels`).
  Kullanıcı geri bildirimi (V0.9.0 sonrası): "spot ışığı sürekli öğretiyor, bir kere göster; amaç kullanıcıya ilk gördüğü şeyi yanmadan öğretmek; ✓ ve ✕ hiç kalmasın". Spot ışığı fikri yalnızca ilk görüşteki **Hayalet gösteri**nin parçası olarak yaşıyor (aşağıda, `drawSpot`). `CFG.newAfter` = 0 kaldı: yeni kilit olaydan sonraki ilk turda gelir (`G.pendingN`).
- **Süre ortada (V0.9.0, "Sıvı seviyesi"):** halkanın içi bir kap (`drawTimeVessel`: gövde ibrenin altında, yazı en üstte ve hep dik). Sıvı seviyesi `G.tvis` (süreye yumuşak yaklaşır), 2,5 sn'de sarıya, 1 sn'de kırmızıya geçer (0,12 sn'lik kısa geçiş; uzun karışım mor ile sarı arasında çamurlu bir ara renk veriyordu); **son saniyede dalga, şişme, titreşim ve dış halka nabzı yoktur** (kullanıcı isteği: "hata yapmaya meyilli olduğu anda kafasını bulandırmayalım").
  1,2 sn altında altta "Son 1 sn: ×3" yazar. Çift halkada kap iç halkaya sığar; geri sayımda (3-2-1) yazı gizlenir. HUD: üstte puan (dokunuşta zıplar), sağda "En iyi", altında rekora yaklaşma çubuğu (`score / best`, rekor kırılınca altın) + kombo çipi + can çipi, sonra seviye çipi ile joker etki çipleri (üç ve fazlası ikinci satıra sarar). Dene'de kap yok (noktalar).
- Sonsuz modda zorluk hızlanır; Sarkaç, Sis ve Renk kilitleri sonraki sürümlere (sonsuz mod havuzuna) bırakıldı.

## Adil oyun kuralları (bütün kilitlere uygulanır)

1. Vuruş anında ibre ve hedef görünür. İstisnalar: Hayalet pim (hedef önceden görülür, hafızadan vurulur; ibre hep görünür) ve Işınlanma pimi (ibre kapıda 0,15-0,5 sn görünmez, ama hedefe en az yaklaşık yarım saniye kala çıkar ve çıkış kapısı hep görünür).
2. Hiçbir engel hedefi tamamen kapatmaz; oyuncu bir tur boşa beklemek zorunda kalmaz (kilitli halkada kilitli iç hedef sayılmaz, dış ibre oynanır).
3. Anlık hile yok: renk ve görünürlük değişimleri önceden görülebilir (trafik ışığı önce sarı yanıp söner, ibre içerideyken değişmez).
4. Yeni bir şey ilk görüldüğünde bir kez net anlatılır (büyük kart), sonra ipucu çıkmaz.
5. Aynı şekil aynı anlama gelir: altın = vur, yeşil çerçeveli soluk altın = dokunma; gül rengi = dokunma, şeftali = vur.

## Kilit çiftleri (iyi kilit ↔ engel ikizi)

Basamak (★1, ★2, ★3) değerleri slash ile verilmiştir. *(Yapıldı)* işaretliler oyunda var; diğerleri `docs/kilit-katalogu.md` içindeki sonraki tasarımlardır.

| İyi kilit | Kural | Engel ikizi | Kural |
|---|---|---|---|
| Çift pim *(yapıldı)* | İki hedef, 1 ve 2 numaralı | Tuzak pim *(yapıldı)* | Hedefin yanında gül rengi tuzak, dokunursan −1,3 sn |
| Kayan pim *(yapıldı)* | Hedef salınır (genlik 0,45–0,8, 0,32–0,5 Hz) | Kayan tuzak *(yapıldı)* | Hedefin üstünden kayar; hedefin %45'inden dar, hedefin açıkta kalan parçası her zaman vurulabilir; üstündeyken dokunursan seri sıfır, −1 sn |
| Nefes pim *(yapıldı)* | Hedef genişliği nefes alır; tam açıkken vuruş +1 | Diken *(yapıldı)* | Hedefin kapanan kenarları dikenlidir, ortası her zaman açık. **Hızlı girer (0,3 sn), bekler (0,8 sn), yavaş çıkar (1,5 sn)**; süreler ibre hızıyla ters orantılı kısalır (`thornRef` 2,4 rad/sn'de bu değerler, 3,3'te ×0,73) ve dikenin kapanışı ibre hedefe girerken tamamlanacak biçimde zamanlanır (V0.5.1); ★ ile hızlanır. Kapanan pay (`br.a`) seviyeyle büyür: `0,22 + 0,4 × yoğunluk + 0,05 × ★`, en çok 0,62 (3. seviyede 0,24, 5'te 0,28, 7'de 0,35, 10'da 0,50; V0.6.1, eskiden sabit 0,25/0,38/0,5); yani ortadaki açıklık gitgide daralır. Dikenli kenara dokunursan −1,5 sn ve hedefler 3 sn %20 daralır |
| Altın pim *(yapıldı, V0.5.0)* | Önce sıradaki ana hedef, altın ondan sonra gelir (V0.8.0): altın ana hedef vurulana kadar kapalıdır (soluk, kesikli çerçeve, üstünde küçük kilit), vurulunca parlayarak açılır; açıkken ilk dokunuş altına aittir (×3 puan, +1 coin, süre vermez), dokunup tutturamazsan normal ıska ve altın kaybolur, hiç dokunmadan ibre geçerse ceza yok (`G.pins` içinde `gold`, `wait`, `gone`; `goldPending`, `openGold`, `tickGold`) | Lanetli altın *(yapıldı)* | Aynı ince şekil ama soluk, zehir yeşili çerçeveli, damlalı, kafatası işaretli; dokunursan −3 coin, −1 sn, seri sıfır |
| Sabır pimi *(yapıldı)* | Kilitli pim: ibre her geçtiğinde kilidin üstündeki 3 noktadan biri yanar. Beklerken halkanın başka yerinde yan hedefler çıkar (vurunca süre kazanırsın). Üç nokta yanınca kilit açılır, pim altına döner (×3). Kilitliyken dokunursan sarsılır, noktalar sıfırlanır (−1 sn) | Çürük kilit *(yapıldı)* | Açıldıktan sonra yalnızca bir tur açık kalır; kaçırırsan yeniden kilitlenir |
| Kasa turu *(yapıldı)* | 3 hedef art arda, ibre hızlanır (×1,18); üçünü açarsan +10 puan, +0,6 sn, +2 coin | Alarm turu *(yapıldı)* | Hedeflerin arasına "!" işaretli sahte kilit; dokunursan −2 sn, tur sıfırlanır |
| Ritim pim *(yapıldı)* | 3/4/5 küçük hedef art arda, vuruşlarda nota yükselir; zincir tamamlanınca +0,6 sn, +2 puan | Sahte nota *(yapıldı)* | Dizinin arasına gül rengi ×'li nota; dokunursan −1 sn, zincir bozulur |
| Trafik ışığı *(yapıldı, ikizi yok)* | Yan yana iki hedef: biri yeşil, biri kırmızı. Işıklar her 1,4/1,1/0,8 sn yer değiştirir (önce sarı yanıp söner); ibre içerideyken değişmez. Yeşile vur | Kırmızı hedef | Dokunursan −1 sn |
| İki halka *(yapıldı)* | Her ibre kendi hedefinde; dokunuş hedefteki ibreyi vurur (iç halka lila, dış halka şeftali) | Kilitli halka *(yapıldı)* | İç halka 2,4 sn tamamen kilitlenir: ibre durur, hedefi sayılmaz, dokunuşlar yalnızca dış ibreye bakar (ceza yok). Bedel: dış ibre %25 hızlanır. Geri sayım görünür; kilit açılınca iç hedef yeni yere gelir |
| Işınlanma pimi *(yapıldı, V0.7.0, ikizi yok)* | Halkada mavi giriş kapısı (A) ve turuncu çıkış kapısı (B). İbre A'ya girince küçülüp kaybolur, açısı donar; **0,15-0,50 sn** (★: 0,12-0,58 / 0,10-0,66) sonra, **her turda rastgele ve önceden belli olmadan**, B'den çıkar. Hedef (T) B'nin ilerisindedir: çıkıştan hedefe en az 0,52/0,48/0,44 sn (en az 1,1 rad, `isinGapT`/`isinGapMin`). B ile A arası atlanan yaydır (1,1-2,2 rad, `isinSkip`); T ibrenin ilk yoluna (başlangıç ile A arası) düşmez. Tünelde dokunuş ıskadır; süre akar. Vurulana kadar her tur kapı yeniden çalışır | — | Engel ikizi yok (katalogdaki Kara kapı yapılmadı) |
| Hayalet pim *(yapıldı)* | Hedef 0,55/0,8/1,1 sn görünür, sonra tamamen kaybolur (yeri değişmez); hafızadan vur, ×2. İbre hep görünür | Hayalet tuzak *(yapıldı)* | Tuzak da kaybolur; yerini unutup dokunursan −1,5 sn, ekran titrer |
| Bomba pim *(yapıldı, ikizi yok)* | Fitil yanar (3,4/2,9/2,5 sn), çevresindeki halka erir, geri sayım hızlanır. Süre dolmadan vurursan etkisiz (+25 puan) | Patlama | Kaçırırsan patlar: parlama, patlama dalgası, ekran sarsıntısı, halkada krater (−1,5 sn) |
| Gelgit ibre *(yapıldı)* | İbre hızı halkada değişir; hızlı bölge dışta koyu bantla görünür, ibre oklarla gösterilir | Girdap *(yapıldı)* | İçinden geçen ibre 2,4 sn ×1,7 hızlanır |
| Tut-bırak pim *(yapıldı)* | Uzun yay (1,4/1,9/2,4 rad); ibre başa gelince basıp tut, sondaki bölgede bırak (×1,5). Erken ya da geç bırakırsan ıska | Sıcak yay *(yapıldı)* | Yayın son %38'i sıcak: tutarken süre 3 kat hızlı erir, doğru bırakırsan ×2. İlk karşılaşmada kart net uyarır |
| Sarkaç ibre | İbre dönmez, sağa sola salınır; ortada vuruş ×2 | Balyoz | Hedefin üstünden salınan balyoz; üstteyken dokunursan −2 sn *(yapılmadı)* |
| Sis tüneli | **İbre hep görünür**; hedef sisin içinde saklı, ibre yaklaşınca sis dağılır | Zehirli sis | Yeşil sis, içinde gizli tuzak; dokunursan süre hızlı erir *(yapılmadı)* |
| Renk pim | Halka iki renk bölgesidir; yalnızca rengi uyan hedefe dokunulur; hedefin içinde renk asla değişmez | Yanıltıcı renk | Yanlış renk bölgesine konan hedef ("≠"); dokunursan −1 sn *(yapılmadı)* |

Tek pim ve Seri çarpanı çekirdek oyundur; çarpan 5/10/20/35. vuruşta ×2/×3/×4/×5. ★ güçlenme (seviye 7, 9, 10'da): açılmış, ★'lanabilir bir kilidi bir basamak
güçlendirir (`STAR_KINDS`; ışınlanma pimi dahil). Seviye 7'nin ★ olayı %90'a kaydı.

## Ekran ve yardımcılar

- **HUD (V0.9.0):** üstte puan ve "En iyi" kapsülü, altında rekora yaklaşma çubuğu (yanında kombo ve can çipleri), sonra "Seviye N" ve altında ince ilerleme çizgisi (cehennemde kızıl), sağda joker etki çipleri, Usta'da cehennem rozeti. Süre HUD'da değil, halkanın ortasındaki kaptadır (aşağıda). Toplam seviye ve noktalı yol yok.
- **Üst kart ve haber satırı:** HUD'un altında; Dene modunda büyük kart (hareketli mini simge + ad + kural + uyarı), oyunda yalnızca ★/karışım/seri gibi küçük haberler tek satır (4 sn) ve seviye bandı için yer ayrılır (`relayout`: oyunda 56 px, kısa ekranda 62; Dene'de 102).
  **V0.9.1:** yeni kilit ve engel için büyük üst kart ile ✓/✕ nesne işaretleri kaldırıldı; ilk görüşte tanıtım aşağıdaki "Hayalet gösteri"dir (üstte hiçbir şey kapanmaz, halkanın altında tek satırlık şerit çıkar).
  Menüde **Kilit defteri** (V0.6.0): 14 kilidin hepsi görünür; görülenler tam açıklamalıdır, görülmeyenler adı ve açılacağı seviyeyle ("Sıradaki · Seviye 4" kesikli çerçeveli, sonrakiler "Seviye N") soluk gösterilir; başlıkta "N / 14 açıldı".
  Her satırda **Dene** düğmesi vardır (açılmamış kilitler için de).
- **İlk görüşte tanıtım: Hayalet gösteri (V0.9.1; V0.8.0'daki üst kartın yerine, 5 tasarımdan kullanıcı seçimi):** `spawnChallenge`, bir kilit ya da engeli ilk kez içeren turu kurunca `G.introQ`'ya alır (`introWanted(tür)`: sahnesi var, `save.intro[tür]` yok, `save.seen[tür]` sıfır, Dene değil; iyi kilit ve ikiz art arda)
  ve `startIntro` ile `G.mode = 'intro'` yapar: oyun donar (süre, ibre, hedefler; `update` zinciri), gerçek turun pinleri gizli kalır (`G.gateT = 0`), joker sırası soluklaşır (`.tools.dim`). `fireEvent` artık kuyruğa almaz ve kart koymaz, yalnızca sıradaki turu seçer (`G.pendingNew`).
  Halkada `INTRO[tür]` sahnesi gerçek halkanın ölçülerinde çalışır (`introKit`: `K.R`, `K.RW`, `K.R2`, `K.RW2`; bağlam halka merkezine ötelenmiş; `drawPin` ve `drawPointer` sahte pinlerle çağrılır, `withIntroState` `G.pt`, `G.tun`, `G.ang` gibi alanları geçici ayarlar).
  Sahnenin `a0`'ı hayalet ibrenin başladığı açıdır; sahne `K.off` ile bu açı gerçek ibrenin durduğu yere gelecek biçimde döndürülür (hayalet ibre gerçek ibreden doğar; açı alan her çizim `+ K.off` ister, kit yöntemleri bunu kendiliğinden yapar).
  Sahne her karede iki kez çalışır: toplama turu sahte 1×1 tuvalde (`dummyCtx`; yalnızca pinleri verir) `spotSpans` ile spot pencerelerini kurar (yuvarlak uçları değenler birleşir); `drawSpot` ekranı karartıp pencereleri açar ve beyaz çerçeveler (`rgba(41,35,63,.62)`, koyu temada siyah %58; gerçek pinlerden sonra, gerçek ibreden önce);
  çizim turu (`drawDemoFront`) pinleri, saydam hayalet ibreyi (`P.btn`, izsiz: `drawPointer`'a `trailCol` verilmezse iz çizilmez), hayalet parmakları ve halka açılımlarını gerçek ibrenin üstüne çizer. Ödül kapsülü (`K.txt`) ve kilitli halka sayacı (`K.lockPill`) ortadaki süre yazısının üstüne `drawDemoOver` ile gelir; iki halkalı gösterilerde gerçek iç ibre gizlenir.
  Cehennem çemberi dönerken sahne de dönen bağlamda çizilir (pinler çentiklerle hizalı kalır).
  Altta tek satırlık şerit (`drawDemoBar`): "Ad · anlık açıklama" (`ic_<tür>`, `|` ile ayrılmış, sahnenin `capT` zamanlarına göre; sığmazsa yazı küçülür, sonra ad düşer) ve ince ilerleme çizgisi; gösteri kapanırken ve oyun başlayınca ilk 1,3 sn (`G.tail`) aynı şerit yazıya göre daralıp "Sıra sende!" (`introGo`) der.
  Zamanlar `IN_*`: 0,45 sn hazırlık (pinler belirir, ışık yanar), hayalet ×1,15 hızla oynar, 0,7 sn son hâl, kapanış 0,5 sn (ışık söner, gerçek pinler gelir, ibre hâlâ donuk), dokunuşla geçme ilk 0,7 sn'den sonra (`skipIntro`), geri tuşu `closeIntro(true)` hepsini geçer.
  Görüldü işareti kapanışta konur (`save.intro`); `pause()` yarım kalan gösteriyi geri sıraya koyar (`abortIntro`), dönüşte 3-2-1 sayılırken pinler gizli kalır ve gösteri baştan başlar. `start()` içindeki tur gösteriyi hemen başlatmaz (`spawnQuiet`: kayıtlı oyun önce sayar, ilk kare `update` içinde başlatılır).
  Yeni kilit eklerken `INTRO` sahnesi (`a0` ile) ve `ic_<tür>` satırı (TR ve EN, sahnenin `capT` sayısıyla aynı sayıda) gerekir; `tools/check-strings.mjs` bunu (ve k_/rule_/warn_ satırlarını) denetler.
  `DEBUG=1` derlemesinde kapalı (`/*NOINTRO*/` işareti), `DEBUG=2`'de açık; kancada `introNow(tür)` elle başlatır, `demoFrame()` ve `IN` zaman sabitleri verir. Tarayıcı panelinde döngüyü durdurup (`window.requestAnimationFrame = () => 0`) `G.intro.t` ayarlayarak ve `render()` çağırarak istenen kare görülür; tuvaller `toDataURL` ile bir temas sayfasına toplanabilir.
- **Cehennem çemberi (V0.8.0):** yalnızca Cehennem kademesinde (`LV().hell === 'always'`; Usta'nın cehennem bölümlerinde yok, Dene'de yok, `RM` (hareketi azalt) açıksa yok) çember nefes alır, bütün çember ibrenin tersine döner, içinde sarmal döner.
  `HX` nesnesi (`hellFx(raw)`, `update` içinde): `s` etki gücü (yumuşak giriş-çıkış), `b` yarıçap çarpanı `1 − 2a·(0,5 − 0,5·sin faz)` (yalnızca küçülür, ayarlanan boyutu aşmaz; `a` = %1,5 + %1,2 × (seviye − 1), 10. seviyede %12,3; periyot 3,4 → 1,6 sn),
  `r` bütün çemberin dönüşü (0,05 → 0,32 rad/sn, ibrenin tersine; `G.dir` dönünce yumuşakça yön değiştirir), `tr` çentiklerin ek dönüşü, `sp` sarmalın dönüşü. `render` çemberi `HX.r` kadar döndürülmüş bağlamda çizer; etiketler, parçacıklar ve halka efektleri döndürülmez ama
  konumları dönüşü ve nefesi izler (`pinXY`, `ringR`, `drawLabels`, `drawFxs`). Numaralı pimlerin rakamı ters döndürülür (`drawRot`). Yalnızca görüntü: `tap`, `hit`, ibre ve hedef açıları HX'e bakmaz. Kapanırken çember en yakın tam tura ve çentik aralığına oturur.
  Tanıtım sırasında efekt de donar. Kullanıcı seçimi: nefes açık, ters dönüş "bütün çember", sarmal açık, yalnızca Cehennem.
- **Jokerler (V0.6.1 düzeni):** ekranın en altındaki sıra (`#tools`, düğme 60 px, parlayan 76 px; kısa ekranda 54/66). İşe yarayacağı an biri parlar, büyür, etiketini gösterir (etiket ekranın dışına taşmaz)
  (Kronometre: süre ≤ 2,5 sn; Kalkan: art arda iki hata ya da cehennem başı; Steteskop: hedef dar ya da cehennem başı; Kum saati: ibre çok hızlı ya da iki ıska). Parlama yalnızca ipucudur; joker her an kullanılabilir,
  parlarken kullanmak +25 puan ("Akıllı hamle!") verir. **Joker tek dokunuşla (`pointerdown`) çalışır**; kullanınca stok hemen düşer, rozet zıplar. V0.5.1-V0.6.0'da basılı tutmak gerekiyordu; kullanıcı "jokerler çalışmıyor galiba" dedi
  (tutmadığı için kısa dokunuş oyuna gidiyordu), bu yüzden basılı tutma ve `tapNear` kaldırıldı.
  Yanlış basmayı önleyen şey yerleşimdir, gecikme değil: `relayout()` halka ile joker etiketi arasında en az `gapMin` boşluk bırakır (70 px, kısa ekranda 54 px; yaklaşık parmak ucu boyu), dockun altında 24/14 px pay vardır, halka bu boşluğa göre küçülür;
  o boşluğa yapılan dokunuşlar oyuna gider. Ölçülen boşluklar (halkanın alt kenarı ile joker üstü / etiket hariç saf boşluk): 320×568 ≈ 94/60 px, 360×640 ≈ 94/60, 360×740 ≈ 118/84, 412×915 ≈ 186/152.
  Etkiler `TOOL` tablosunda (seviyeyle artar). Yeni oyuncuda her jokerden 2 var; her 3 seviyede bir hediye.
- **Can (yedek):** yeşil "+" hedefi; çift seviyelerin normal bölümünün %55'inden sonra, canın yoksa bir sonraki hedef olur. En fazla 1; rekor çubuğunun
  yanında yeşil "+ Can" kapsülü. Süre bitince kendiliğinden devreye girer: +3 sn, kısa yavaş ibre.
- **Devam etme:** oyun her 5 sn'de ve çıkarken kaydedilir (`save.run`; V0.6.1'den beri `lvl` ile hangi kademeye ait olduğu da yazılır); uygulama kapansa bile menüde "Devam et" ("Normal · Seviye 5 · 4.200 puan"), dokununca 3-2-1.
  Yarım kalan oyun kendi kademesinde sürer: açılışta kademe seçici `save.run.lvl`'ye eşitlenir (eski kayıtta `lvl` yoksa seçili kademe alınır). Yarım kalan oyun varken başka kademe seçilirse `#swap` penceresi çıkar
  ("Yarım kalan oyun silinsin mi? ... kazandığın N coin kaybolur"; `runPending` henüz coine çevrilmemiş kazancı hesaplar); "Sil ve geç" `save.run`'ı siler ve kademeyi değiştirir, "Vazgeç" ya da geri tuşu pencereyi kapatır.
  (Kullanıcı isteği: kolay modda normal modun oyunu sürüyordu; "modlar arası geçişte sıfırlanmalı, kullanıcı uyarılmalı".)
  Duraklatma basılı tutulan tut-bırak pinini bırakır (pim yeniden beklemeye döner).
- **Yazılar:** bölüm ve cehennem haberi (`drawBanner`) halkanın üstündeki kart bandına çizilir (kart ya da ilk dokunuş ipucu varken çizilmez, HUD rozeti yeter); iki halkada puan balonları halkaların dışındadır.
- **Dene (V0.6.0):** kilit defterinden bir kilidin kısa canlı denemesi (`startPractice`, `G.practice`). Aynı oyun kodu çalışır ama yolculuk, süre, puan, coin, kayıt ve rekor yoktur (`G.time` hep dolu, `lethal` etkisiz,
  `persistRun` kapalı, `noteSeen` çağrılmaz). Yavaş ibre (2,2) ve geniş hedefle (0,46) o kilit tekrar tekrar gelir; engel ikizi ikinci turdan sonra eklenir (`PRAC_TWIN`; trafik ışığı, bomba ve sabır pimi ikizsizdir).
  Bir tur, ceza nesnesine (tuzak, kırmızı ışık, patlama, kilide dokunma; `G.chal.fail`) dokunmadan bitirilirse doğru sayılır; 3 doğru tur deneme biter (sabır pimi 1). Ekranda: üstte "Dene" rozeti, üç nokta, "Bitir"; kural kartı sürekli açık; halkanın ortasında
  doğru turlar (nokta ve "2 / 3"); joker sırası yok. Bitince "Öğrendin" + Tekrar dene / Deftere dön. Yaklaşırken ışık değişmez (trafik ışığı denemede adil kalsın). Arka plana gidince ya da geri tuşuyla deneme kapanıp deftere dönülür.
- **Menü:** en iyi puan, ulaşılan seviye, joker stoğu, dört kademeli zorluk seçici (seçilen kademenin tek satırlık açıklaması altında), büyük Devam et/Oyna, Kamp, Kilit defteri, sürüm adı.

## Kamp, rekor, duraklatma

- **Kamp:** Bir seviyeyi (cehennemi dahil) bitirince o seviyenin sonu kayıt noktası olur; menüde "Kamp · Seviye N". Kamp oyunları puan rekorunu etkilemez.
- **Rekor:** Puan rekoru (zorluk başına) yalnızca 1. seviyeden başlayan oyunlarla güncellenir; "en iyi seviye" her oyunda.
- **Duraklatma:** Ana ekran, ekran kilidi, geri tuşu ve uygulamadan çıkış oyunu duraklatır ve kaydeder; sayaçlar, tema geçişi donar; "Devam et"ten sonra 3-2-1.
  Duraklatma ekranında "Menü" düğmesi kaydı bırakıp menüye döner.

## Yapım sırası ve durum

1. **Faz 1 (V0.4.0): TAMAM.** İskelet, tema geçişi, HUD, kamp, duraklatma geri sayımı, Seviye 1-3 kilitleri.
2. **V0.4.1: TAMAM.** Cennet kalktı, yeni tempo (~5 dk), diken kenara alındı, kayan tuzak daraldı, jokerler, can, devam etme, yeni kilit kartı ve
   etiketleri, kilit defteri, "Seviye N" yazısı, menü.
3. **V0.5.0: TAMAM.** Seviye 4-10 kilitleri (altın, sabır, kasa, ritim, trafik, iki halka, hayalet, bomba, gelgit, tut-bırak) ve engel ikizleri
   (lanetli altın, çürük kilit, alarm, sahte nota, kilitli halka, hayalet tuzak, girdap, sıcak yay); iyi kilit seviye başında, ikiz ortada; yeni kart ve ✓/✕
   rozetleri; diken yavaş çıkar; bonuslar kısıldı; zorluk botla yeniden ayarlandı; seviyeler 20-32 sn'e uzadı.
4. **V0.5.1: TAMAM.** Cehennem güçlendi (tablo, kademe adları), süreye göre hedef uzunluğu, diken ibre hızına uyar ve kapanır, altın önce gelir, bölüm geçişinde tur bozulmaz, banner ve balonlar halkanın dışında,
   jokerler basılı tutularak çalışır.
5. **V0.6.0: TAMAM.** Kilit defteri yaklaşan kilitleri gösterir ve her satırda **Dene** (kısa canlı deneme) vardır; dördüncü zorluk kademesi **Cehennem**; trafik ışığı değişim aralığı ±%22 rastgele (devri daim kilitlenmesin); bot kırmızı ışıkta takılmıyor.
6. **V0.6.1: TAMAM.** Hedef uzunluğu süre çubuğunun saniyesine göre (`WIDE_TAB`); cehennem bölümü kademeye göre (`hell`: Rahat/Normal yok, Usta açılıp kapanır, Cehennem baştan sona) ve Cehennem yeniden ayarlandı (pro bot %25);
   dikende nefes oyun ilerledikçe büyür; jokerler tek dokunuş, sıra altta ve halkayla arasında parmak boyu boşluk; kademe değişince yarım kalan oyun uyarısı; botta "pro" becerisi.
7. **V0.7.0: TAMAM.** Işınlanma pimi (kullanıcı isteği, canlı denemeyle onaylandı; "Hızlı" çıkış 0,15-0,50 sn): `G.tun` (tünel: `t`, `d` rastgele süre, `to` çıkış açısı), `ptrFactor()` tünelde 0 döner (ibre açısı donar), `tickPortal` kapıdan geçişi yakalar (`enterPortal`/`exitPortal`), kapılar `kind: 'portal'` pinleri (`portal: 'in'|'out'`),
   ibrenin çizimi `ptrScale()` ile küçülüp büyür. `die()` ve `doContinue()` tünel durumunu bilir (ikinci şansta ibre çıkış kapısından başlar). Bot: tünelde ya da önce kapıya varacaksa hedefi bekler (`tools/bot.js`).
8. **V0.8.0: TAMAM.** İlk görüşte tanıtım (25 tür; üst kart uzar, içinde animasyon; `G.mode = 'intro'`), Cehennem çemberi (nefes, bütün çember ters döner, sarmal; `HX`), altın pim ana hedeften sonra açılır (`wait`/`gone`), süreye göre hedef boyu üst iki saniyede belirgin (`WIDE_TAB`).
9. **V0.9.0: TAMAM.** Süre çemberin ortasında (sıvı seviyesi, `drawTimeVessel`), puan üstte ve rekora yaklaşma çubuğu; yeni kilit ipucu "Spot ışığı" (`G.cue`) ve yeni kilit 0 tur sonra; hedef boyu kademeye göre "Keskin" (`wide`, `hwCap`, `HW_FLOOR`) ve kademeler botla yeniden ayarlandı; ekonomi B (`runCoins`, `LEVEL.coin`);
   ikinci şans: geri sayımlı kart, 3 hak (25/50/100), reklam ilk iki hakta; rekor kutlaması: konfeti yağmuru (oyun içi ve oyun sonu).
10. **V0.9.1: TAMAM.** İlk görüşte tanıtım "Hayalet gösteri" (kullanıcı seçimi): gerçek halkada spot ışığı + hayalet ibre ve parmak + altta tek satırlık şerit + "Sıra sende!"; yalnızca ilk görüşte, 25 türün hepsi; üst kart, ✓/✕ işaretleri ve tekrar eden Spot ışığı kaldırıldı; ana ekranda titreşim düğmesi.
11. **V0.9.2: TAMAM.** Mağaza "Çarşı + halka ikonları" (kullanıcı seçimi; 4 dükkân: Alet çantası, Yetenekler, Görünüm [yakında], Hediye), başlangıçta 1 joker ve 1 yuva, jokerler ve yuvalar coinle açılır (800 / 1.500 / 2.500; 1.200 / 2.400 / 4.000; Otomatik joker 4.000), yuva seçici ve menü çanta satırı, stok 1'den başlar en çok 5 ve fiyat merdiveni, yükseltme–alma açığı kapatıldı (`upPrice` stoğun yükselen değerini de öder), Ayarlar penceresi, Otomatik joker, Hediye merdiveni (20 · 30 · 40 · 50 · 100, sonra 12 saat), rekor kutlaması düzeltmesi, "Steteskop" yazımı. Eski kayıtta her şey açık kalır. Ayrıntı `CHANGELOG.md`.
12. **V0.9.3: TAMAM.** Ayarlardan dil seçimi (Sistem / Türkçe / English), menü müziği (Web Audio ile üretilir, Müzik anahtarı), mağazaya gündüz ve akşam (telefonun saatine göre) ve kayan yıldız, mağaza düzeni (buton çakışması, Joker/Yuva tabelası), Hediye'de son ödül 500 ve 24 saatlik pencere (kadran = pencerenin saati), yumuşak geçişler ve satın alma animasyonları, Türkçe ğ Ğ ş Ş İ harfleri Fredoka'ya uydu. Ayrıntı `CHANGELOG.md`.
13. **Sıradaki:** Kara kapı (ışınlanmanın engel ikizi) ve `docs/kilit-katalogu.md` içindeki yapılmamış kilitler (Sarkaç ✚ Balyoz, Renk, Sis, Aynalı pim, Zırhlı pim, Şifre, Makas, Ani pim, Zil pimi) sonsuz mod havuzu ve sonraki sürümler için.
   Kullanıcının oyun sonrası geri bildirimine göre sıra belirlenir.
14. **Mağaza hazırlığı (ayrı sürüm, kullanıcı hesabı açınca haber verecek):** ikon, imzalı paket (AAB), gizlilik sayfası, gerçek reklam kimliği ve onay penceresi,
   paket adının kesinleşmesi.

Sonsuz mod şimdilik yalnızca 10. seviye sonrası otomatik devam ("Yolculuk tamamlandı", +100 coin); yoğunluk ve cehennem gücü her seviyede artar.

## Bot ile zorluk ölçümü

`tools/bot.js` gerçek oyun kodunu (spawn, update, tap, release) hızlandırılmış zamanla oynatır (kullanımı dosyanın başında; DEBUG=1 derlemesi gerekir).
Beceri = dokunuş zamanlama hatasının standart sapması (yeni 0,12 sn, orta 0,08, iyi 0,05, usta 0,03); her oyunda sapma log-normal sallanır (günlük form),
her dokunuşta küçük bir dikkat kaybı olasılığı vardır. Bot gelgit hızını, kilitli halkayı, tut-bırakı, trafik ışığını, bombayı, sabır ve hayalet pimi bilir;
tuzakların üstündeyse sıklıkla dokunmaz, altına beceriye bağlı olasılıkla uzanır. Joker kullanmaz.
`window.kindStats()` kilit türü başına tur sayısı, süre ve vuruş oranını verir; `bulk()` seviyeye ulaşma yüzdesini, ölümlerin kilit dağılımını, cehennemde ölenlerin payını ve seviye başına cehennemi geçme yüzdesini;
`hellLine(sigma, kaçınma, n, girişSüresi)` yalnızca cehennem bölümünü seviye seviye ölçer (hızlı, ayar denemesi için).

**V0.6.0 ölçümü** (10. seviyeye ulaşma oranı; n = 14-100 oyun, yaklaşık ±6-12 puan hata payı; "—" ölçülmedi). Bu sürümde botun kırmızı ışıkta takılma hatası düzeltildi (önceki sürümlerin ölçümlerinde trafik ışığı olduğundan çok öldürüyordu), bu yüzden sayılar V0.5.1 belgesinden biraz yüksektir:

| Mod | yeni (0,12) | orta (0,08) | iyi (0,05) | usta (0,03) |
|---|---|---|---|---|
| Rahat | %30 | %77 | — | — |
| Normal | %6 | %30 | %80 | %100 |
| Usta | — | %0 | %25 | %93 |
| Cehennem | — | %0 | %0 | %37 |

Cehennem bölümünü geçme (V0.5.1 ölçümü; girişte yeni 5 sn, orta 6 sn süre; seviye 1 → 10), eski cehennem → yeni cehennem:
yeni %98 93 97 93 93 80 70 42 43 20 → %99 95 85 71 63 44 51 35 23 11; orta %100 99 100 100 98 97 94 90 78 53 → %100 99 99 94 96 81 84 91 63 38.
Cehennemde ölenlerin payı artık tüm ölümlerin %40-45'i (eskiden %30). Hedef tablosu (`docs/kilit-katalogu.md`): Normal %5 / %35 / %60 / %90, Rahat %40 / %80 / %95 / %100, Usta %0 / %8 / %25 / %60.
Normal'de orta bot hedefin biraz altında (%30 / %35), iyi bot hedefin üstünde (%80 / %60), usta bot hepsini bitiriyor. Güçlü botlar için cehennem bölümü hâlâ kolay (iyi bot %95+ geçiyor): beceri arttıkça ölümler
hassasiyetten değil rastgele dikkat kayıplarından geldiği için çarpanlarla zorlaştırmak orta oyuncuyu da ezer; güçlü oyuncu için asıl çözüm Usta ve Cehennem kademeleridir (Cehennem'de usta bot %37, iyi bot %0).
`DIFF.adaptCap` 0,15 ve 0,2 denendi: orta oyuncuyu çok düşürüp (%27, %8) iyi oyuncuyu yeterince düşürmedi, 0,12'de bırakıldı. En çok öldüren kilitler: tut-bırak, ritim, sabır pimi, nefes ve (yeni oyuncuda) tek pin.
Dene modunda bot her kilidi 2-13 sn'de 3 doğru turla bitiriyor (`tools/bot.js` içinde `runBot(..., { setup: () => startPractice(tür) })`).
Bu sayılar insan değil bot sonucudur: insan yeni kilitlerin kuralını ilk görüşte öğrenmek zorunda olduğu için ilk oyunlarda daha çok ölür.

**V0.6.1 ölçümü** (saniye başına hedef tablosu açık; Rahat ve Normal'de cehennem bölümü yok, Usta'da açılıp kapanır, Cehennem'de baştan sona). Rahat/Normal/Usta satırları 10. seviyeye ulaşma yüzdesi; n = 30-80, hata payı ±6-10 puan.
Yeni "pro" beceri düzeyi (sapma 0,02, kaçınma 1) `tools/bot.js`te `SKILLS` listesinde:

| Mod | yeni (0,12) | orta (0,08) | iyi (0,05) | usta (0,03) |
|---|---|---|---|---|
| Rahat | %28 | — | — | — |
| Normal | %3 | %40 | %77 | — |
| Usta | — | %0 | %30 | %70 |

Cehennem (baştan sona cehennem; "ulaşma" 10. seviyeye, "bitirme" 10. seviyeyi geçip 11'e varma): iyi bot 10'a %3 ulaşır, bitirme %0 (5. seviyede %53 hayatta); usta bot ulaşma %23, bitirme %5 (n = 80);
pro bot (0,02) ulaşma yaklaşık %52, bitirme yaklaşık %24 (n = 180). Eski Cehennem ayarlarıyla (V0.6.0; cehennem bölümü açılıp kapanıyor, hedef ×0,72, ibre ×1,22, ceza ×1,8, süre erimesi ×1,35) ve eski genişlik tablosuyla: usta bot ulaşma %40, bitirme %18;
pro bot ulaşma %78, bitirme %35. Yeni genişlik tablosuyla aynı eski ayarlar Cehennem'i neredeyse herkese bitirtiyordu (usta bot %98), bu yüzden Cehennem baştan sona cehennem bölümü yapıldı ve tabloya göre yeniden ayarlandı.
Cehennem'de pro botu en çok öldüren kilitler: nefes (diken) %35, iki halka %17, kasa %15 (n = 60).
Cehennem ayarı denemeleri (hedef çarpanı, ibre, ceza, süre erimesi, `hellScale` → pro bot bitirme %): ×0,94/1,12/1,3/1,15/0,65 → %60; ×0,92/1,12/1,35/1,18/0,68 → %46; ×0,88/1,12/1,4/1,2/0,72 → %33; ×0,82/1,18/1,5/1,25/0,64 → %24 (seçilen);
×0,80/1,18/1,5/1,25/0,62 → %12; `hellScale` tek başına ayarda neredeyse etkisiz (0,68 → 0,85: %46 → %50), asıl kaldıraç hedef genişliğidir.

**V0.7.0 ölçümü** (ışınlanma pimi). Yalnızca ışınlanma pimi açık, süre hep dolu, 7. seviye yoğunluğu, Normal: vuruş yüzdesi pro %100, usta %100, iyi %99, orta %92, yeni %74; tur 1,5-1,7 sn (yeni 2,0 sn). Tam oyunlarda oyun başına yaklaşık 5 ışınlanma turu, iyi botta vuruş %89; ölümlerin %0-5'i ışınlanmadan (Normal iyi 0/40, Normal orta 2/40, Cehennem pro 1/60). Bot çıkışı tepki süresiz görür (yalnızca vuruş tahminine +0,02 sn gürültü eklenir, `opt.isinExtra`); insanda çıkıştan sonra tepki süresi ve 0,5 sn'lik aralığı hatırlama zorluğu bu sayıyı düşürür, gerçek geri bildirime göre ayarlanacak (`MECH.isinGapT`, `isinWait`). Yeni genel ölçümler (n = 30-60): Normal orta bot 10. seviyeye %38, iyi bot (n = 40) %83; Usta iyi bot %30; Cehennem pro bot bitirme %25 (öncekiyle aynı, kilit eklenmesi dengeyi bozmadı). Kilide özel ölçüm: `runBot(sg, av, 7, 60, 1/60, { setup: () => { G.open = ['isin']; G.time = 8; k.spawn(false, 'isin'); }, stop: () => { G.time = 8; return false; } })` sonrası `kindStats()`.

**V0.8.0 ölçümü** (altın sırası, belirgin hedef boyu, tanıtım ve Cehennem çemberi eklendikten sonra; tanıtımlar `DEBUG=1`'de kapalı, Cehennem efekti yalnızca görüntü). 10. seviyeye ulaşma: Normal yeni %3 (n = 70), orta %50 (n = 24), iyi %84 (n = 50);
Usta usta bot %78 (n = 18); Cehennem pro bot ulaşma %37, bitirme %27 (n = 30). V0.6.1/V0.7.0 ölçümleriyle (Normal yeni %3, orta %38-40, iyi %77-83; Usta usta %70; Cehennem pro bitirme %25) hata payı (±10) içinde aynı.
Normal orta botun en çok öldüğü kilitler: nefes, trafik, tut-bırak, kasa (n = 24); iyi botta nefes %36 (n = 50). `node tools/sim.mjs 1500` (eski model) hatasız çalıştı.
Altın pim bu sürümde botla ayrıca doğrulandı: bot altın açılınca yalnızca beceriye bağlı olasılıkla uzanır (`goldP`), kapalıyken ya da kaybolmuşken dokunmaz.

**V0.9.0 ölçümü** (hedef boyu kademeye göre "Keskin", ekonomi B, yeni kilit 0 tur, Spot ışığı; başsız Chrome, n = 300; 10. seviyeye ulaşma / 11'e varma, koşu başına coin). Eski V0.8.0 aynı yöntemle (n = 100) ölçülüp karşılaştırıldı.

| Mod · oyuncu | S10 eski → yeni | S11 yeni | coin/koşu eski → yeni |
|---|---|---|---|
| Normal · yeni (0,12) | %5 → %5 | %2 | 151 → 49 |
| Normal · orta (0,08) | %37 → %33 | %15 | 341 → 102 |
| Normal · iyi (0,05) | %79 → %76 | %58 | 628 → 184 |
| Rahat · yeni | %31 → %36 | %15 | 274 → 38 |
| Rahat · orta | %76 → %77 | %51 | 480 → 71 |
| Usta · iyi | %31 → %24 | %8 | 521 → 235 |
| Usta · usta | %86 → %86 | %64 | 918 → 449 |
| Cehennem · iyi | %0 → %0 | %0 | 369 → 191 |
| Cehennem · usta | %15 → %9 | %2 | 784 → 402 |
| Cehennem · pro | %37 → %39 | %23 (eski %24) | 1181 → 663 |

Zorluk düzeyi V0.8.0 ile aynı, hedef Cehennem'de pro botun yaklaşık %25'i bitirmesi (şimdi %23), usta botun %5'e yakın olması (%2). Yeni eğri güçlü oyuncuya sert (çubuk doluyken en dar), zayıf oyuncuya cömert; bu yüzden Rahat için `hw` 1,2 → 0,95, Cehennem için `hw` 0,82 + `drain` 0,9 (ilk deneme: `hw` 0,82 ve `drain` 1,25 ile pro bot %4'ü bitiriyordu).
Yeni kilidin açıldıktan sonraki ilk görünüşü: eski 1,4-3,1 tur (en çok 5), yeni 0 tur. Spot ışığı yalnızca ilk üç görünüşte çıktığı ve ibreyi yalnızca 1,3 sn yavaşlattığı için botlarda fark yaratmadı.
**Başsız ölçüm yöntemi:** `DEBUG=1 ./build.sh`, `www/` içine `tools/bot.js` ve sayfanın sonuna iş betiği (`?job=` ile gelen kodu çalıştırıp sonucu `<pre id="botres">` içine yazan küçük bir betik) koyan bir test sayfası, sonra
`"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --user-data-dir=<geçici> --dump-dom <adres>`; yüzlerce oyun birkaç saniye sürer, 10 işi paralel çalıştırmak mümkündür. `--virtual-time-budget` bayrağı bazı işleri kilitledi, kullanma;
Chrome'un çıktısını boru yerine dosyaya yaz (crashpad süreci boruyu açık tutabilir). Çok yetenekli botla Normal/Rahat'ta oyunlar sonsuz modda 700 sn'ye uzar (n = 300 iş 400 sn'den uzun sürebilir): n'yi azalt ya da süre sınırını (`tmax`) düşür.
