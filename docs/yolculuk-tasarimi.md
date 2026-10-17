# Yolculuk tasarımı (V0.6.0, onaylı 2026-10-17)

Bu belge oyunun güncel yolculuk tasarımıdır. V0.4.0'daki ilk tasarımdan (cennet bölümü, 15 dakikalık yolculuk) sonra kullanıcı geri bildirimiyle
dört kez değişti (V0.4.1 tempo, V0.5.0 çeşitlilik, V0.5.1 cehennem ve düzeltmeler, V0.6.0 Dene ve Cehennem zorluğu); değişiklik nedenleri `CHANGELOG.md` içinde. Kilit fikirlerinin tam listesi (yapılanlar ve
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
| 7 | 28 sn | 8 sn | 2:57 | İki halka (0) ✚ kilitli halka (0,48); ★ güçlenme (0,82) |
| 8 | 28 sn | 9 sn | 3:33 | Hayalet pim (0) ✚ hayalet tuzak (0,42); bomba pim (0,76) |
| 9 | 30 sn | 9 sn | 4:10 | Gelgit ibre (0) ✚ girdap (0,48); ★ güçlenme (0,82) |
| 10 | 32 sn | 10 sn | 4:49 | Tut-bırak pim (0) ✚ sıcak yay (0,45); ★ güçlenme (0,82) |
| Sonsuz | 32 sn | 10 sn | 5:31 | Görülmüş kilitlerin karışımı (Sarkaç, Sis, Renk vb. sonraki sürümlerde) |

Sabır pimi, çürük kilit, trafik ışığı ve bomba pim ilk plandaki yedi çifte ek olarak yapıldı (kullanıcı onayıyla); engel ikizi olmadan seviyenin
sonlarına konuldular. Zamanlar `JOURNEY`, olaylar `JEV` (TUNE bloğu); yapılmamış kilitlerin olayları atlanır (`IMPL_GOOD`/`IMPL_TWIN`).
Her yeni kilit, kartı çıktıktan 2 sn sonra ve ibreden uzak doğar; ilk hedefi vurulana ya da ıskalanana kadar kart ekranda kalır (en çok 8 sn).

## Cehennem

Süre hızlı erir, ceza ve engel olasılığı artar, hedefler daralır, ibre hızlanır; kızıl-siyah tema, kor ve çatlak efektleri. V0.5.1'de güçlendi: eskiden en güçlü cehennem bile
normal bölümden yalnızca %4 farklıydı (arkadaşlardan "hiç zor değil"). Gücü `JOURNEY.hellTab[L-1]` ile seviye başına verilir (1 = tam güç): `[0.3, 0.5, 0.7, 0.9, 0.9, 0.8, 0.65, 0.5, 0.42, 0.38]`;
10. seviyeden sonra `hellEnd` (0,08) kadar artar (en çok 1,5). Güç ilk seviyelerde yumuşak başlar, 4-5. seviyede tepeye çıkar, sonra iner (geç seviyelerde normal bölüm zaten çok yoğundur; çarpanlar onun üstüne biner).
Tam güç (k = 1) değerleri: hedef ×0,82, ibre ×1,13, süre erimesi ×1,18, ceza ×1,4, zorluk +0,09, engel ikizi olasılığı 0,78 (normalde 0,3). Etkiler k ile normal bölümden tam güce doğrusal karışır.
Her vuruşta +1 coin; cehennem bitince +2 sn. Adlar (`hellTier`, açılışta çıkan haberde): seviye 1-3 Kolay cehennem, 4-6 Orta cehennem, 7-9 Zor cehennem, 10+ Cehennem.

## Zorluk ve süre ekonomisi

- Taban yoğunluk `0,02 + 0,0085 × (seviye − 1)²` (10. seviyede 0,71), 10. seviyeden sonra seviye başına +0,1 (`ib0`, `ibs`, `ibq`, `ibEnd`).
  10 vuruşluk dalga (genlik 0,2) ve "nefes" araları sürer. Oyuncu mükemmel vurdukça yoğunluk biraz artar, ıskaladıkça azalır (`DIFF.adaptCap` 0,12).
- Vuruş +0,95 sn (mükemmel +0,08, nefes aralarında +0,2), ıska −0,8 sn, tuzak −1,3 sn; hedefler geniş (hwMax 0,56), ibre yavaş (ωMax 3,8).
  Bonuslar V0.5.0'da kısıldı: vuruş 1,1 → 0,95, mükemmel 0,15 → 0,08, cehennem sonu +4 → +2 sn, joker hediyesi her 2 → her 3 seviyede.
  Her kilidin kendi süre/puan değerleri `MECH` tablosunda (altın vuruşu süre vermez, hayalet ×2, sabır ×3, bomba +25 vb.).
- **Süreye göre hedef uzunluğu (`WIDE`, `wideAt`):** süre çubuğu doluyken hedefler ×0,9, süre azaldıkça doğrusal uzar, süre bitmek üzereyken ×1,3 (kıl payı kurtulma). İlk üç seviyede dar kısım yavaş devreye girer
  (1. seviyede ×1,0). Tur başında hesaplanır (hedefin yanındaki tuzak yerleşimiyle çakışmaz). Zayıf oyuncuyu kurtarır, süresi hep dolu olan güçlü oyuncuyu çok az sıkıştırır.
- Zorluk seçici (`LEVEL`, dört kademe): Rahat (hedef ×1,2, ibre ×0,9, vuruş ×1,15, ceza ×0,7, başlangıç 7 sn), Normal, Usta (hedef ×0,9, ibre ×1,1, vuruş ×0,8,
  ıska ×1,4, tuzak ×1,25, başlangıç 5,5 sn), **Cehennem** (V0.6.0: hedef ×0,72, ibre ×1,22, süre erimesi ×1,35 (`drain`), ıska ve tuzak cezası ×1,8, coin ×2, başlangıç 5,5 sn;
  engel ikizleri kilitle birlikte açılır ve en az %85 olasılıkla gelir (`twins`); baştan sona cehennem teması (`hellTheme`), HUD'da ve sonuç ekranında kırmızı rozet; ayrı rekor).
  Taslakta süre erimesi ×1,5 ve ceza ×2 önerilmişti; botla ölçünce kazanılamayacak kadar sert çıktığı için (usta bot %3) ×1,35 ve ×1,8'e indirildi.
  Her kademenin rekoru ayrıdır; Normal'de iki uzun oyun sonra Usta, Usta'da iki uzun oyun sonra Cehennem önerisi çıkar; Cehennem'de üç kısa oyun sonra Usta önerisi.
- Sonsuz modda zorluk hızlanır; Sarkaç, Sis ve Renk kilitleri sonraki sürümlere (sonsuz mod havuzuna) bırakıldı.

## Adil oyun kuralları (bütün kilitlere uygulanır)

1. Vuruş anında ibre ve hedef görünür (Hayalet pim bunun tek istisnasıdır: hedef önceden görülür, hafızadan vurulur; ibre hep görünür).
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
| Nefes pim *(yapıldı)* | Hedef genişliği nefes alır; tam açıkken vuruş +1 | Diken *(yapıldı)* | Hedefin kapanan kenarları dikenlidir, ortası her zaman açık. **Hızlı girer (0,3 sn), bekler (0,8 sn), yavaş çıkar (1,5 sn)**; süreler ibre hızıyla ters orantılı kısalır (`thornRef` 2,4 rad/sn'de bu değerler, 3,3'te ×0,73) ve dikenin kapanışı ibre hedefe girerken tamamlanacak biçimde zamanlanır (V0.5.1); ★ ile hızlanır. Dikenli kenara dokunursan −1,5 sn ve hedefler 3 sn %20 daralır |
| Altın pim *(yapıldı, V0.5.0)* | İbrenin önünde ince altın hedef (parıltılı, açık çerçeveli), ana hedef ondan sonra gelir (V0.5.1: ana hedefi vurunca altın yarım kalmaz); altını vurursan ×3 puan, +1 coin, süre vermez; kaçırırsan ceza yok | Lanetli altın *(yapıldı)* | Aynı ince şekil ama soluk, zehir yeşili çerçeveli, damlalı, kafatası işaretli; dokunursan −3 coin, −1 sn, seri sıfır |
| Sabır pimi *(yapıldı)* | Kilitli pim: ibre her geçtiğinde kilidin üstündeki 3 noktadan biri yanar. Beklerken halkanın başka yerinde yan hedefler çıkar (vurunca süre kazanırsın). Üç nokta yanınca kilit açılır, pim altına döner (×3). Kilitliyken dokunursan sarsılır, noktalar sıfırlanır (−1 sn) | Çürük kilit *(yapıldı)* | Açıldıktan sonra yalnızca bir tur açık kalır; kaçırırsan yeniden kilitlenir |
| Kasa turu *(yapıldı)* | 3 hedef art arda, ibre hızlanır (×1,18); üçünü açarsan +10 puan, +0,6 sn, +2 coin | Alarm turu *(yapıldı)* | Hedeflerin arasına "!" işaretli sahte kilit; dokunursan −2 sn, tur sıfırlanır |
| Ritim pim *(yapıldı)* | 3/4/5 küçük hedef art arda, vuruşlarda nota yükselir; zincir tamamlanınca +0,6 sn, +2 puan | Sahte nota *(yapıldı)* | Dizinin arasına gül rengi ×'li nota; dokunursan −1 sn, zincir bozulur |
| Trafik ışığı *(yapıldı, ikizi yok)* | Yan yana iki hedef: biri yeşil, biri kırmızı. Işıklar her 1,4/1,1/0,8 sn yer değiştirir (önce sarı yanıp söner); ibre içerideyken değişmez. Yeşile vur | Kırmızı hedef | Dokunursan −1 sn |
| İki halka *(yapıldı)* | Her ibre kendi hedefinde; dokunuş hedefteki ibreyi vurur (iç halka lila, dış halka şeftali) | Kilitli halka *(yapıldı)* | İç halka 2,4 sn tamamen kilitlenir: ibre durur, hedefi sayılmaz, dokunuşlar yalnızca dış ibreye bakar (ceza yok). Bedel: dış ibre %25 hızlanır. Geri sayım görünür; kilit açılınca iç hedef yeni yere gelir |
| Hayalet pim *(yapıldı)* | Hedef 0,55/0,8/1,1 sn görünür, sonra tamamen kaybolur (yeri değişmez); hafızadan vur, ×2. İbre hep görünür | Hayalet tuzak *(yapıldı)* | Tuzak da kaybolur; yerini unutup dokunursan −1,5 sn, ekran titrer |
| Bomba pim *(yapıldı, ikizi yok)* | Fitil yanar (3,4/2,9/2,5 sn), çevresindeki halka erir, geri sayım hızlanır. Süre dolmadan vurursan etkisiz (+25 puan) | Patlama | Kaçırırsan patlar: parlama, patlama dalgası, ekran sarsıntısı, halkada krater (−1,5 sn) |
| Gelgit ibre *(yapıldı)* | İbre hızı halkada değişir; hızlı bölge dışta koyu bantla görünür, ibre oklarla gösterilir | Girdap *(yapıldı)* | İçinden geçen ibre 2,4 sn ×1,7 hızlanır |
| Tut-bırak pim *(yapıldı)* | Uzun yay (1,4/1,9/2,4 rad); ibre başa gelince basıp tut, sondaki bölgede bırak (×1,5). Erken ya da geç bırakırsan ıska | Sıcak yay *(yapıldı)* | Yayın son %38'i sıcak: tutarken süre 3 kat hızlı erir, doğru bırakırsan ×2. İlk karşılaşmada kart net uyarır |
| Sarkaç ibre | İbre dönmez, sağa sola salınır; ortada vuruş ×2 | Balyoz | Hedefin üstünden salınan balyoz; üstteyken dokunursan −2 sn *(yapılmadı)* |
| Sis tüneli | **İbre hep görünür**; hedef sisin içinde saklı, ibre yaklaşınca sis dağılır | Zehirli sis | Yeşil sis, içinde gizli tuzak; dokunursan süre hızlı erir *(yapılmadı)* |
| Renk pim | Halka iki renk bölgesidir; yalnızca rengi uyan hedefe dokunulur; hedefin içinde renk asla değişmez | Yanıltıcı renk | Yanlış renk bölgesine konan hedef ("≠"); dokunursan −1 sn *(yapılmadı)* |

Tek pim ve Seri çarpanı çekirdek oyundur; çarpan 5/10/20/35. vuruşta ×2/×3/×4/×5. ★ güçlenme (seviye 7, 9, 10'da): açılmış, ★'lanabilir bir kilidi bir basamak
güçlendirir (`STAR_KINDS`).

## Ekran ve yardımcılar

- **HUD:** süre çubuğu, "Seviye N" ve altında ince ilerleme çizgisi (cehennemde kızıl), cehennem rozeti. Toplam seviye ve noktalı yol yok.
- **Yeni kilit kartı** (üst kart, V0.5.0'da büyüdü): HUD'un altında; yeni kilitte hareketli mini simge + ad (22 punto) + kural (şeftali nokta) + uyarı (gül
  noktası); ilk hedef vurulana ya da ıskalanana kadar kalır (en çok 8 sn). ★/karışım/seri gibi küçük haberler tek satır, 4 sn.
  **Nesne işareti:** yeni kilidin ilk karşılaşmalarında hedefin ve tuzağın dışında küçük ✓ (vur) ve ✕ (dokunma) rozeti; halkanın üstüne yazı konmaz
  (görüşü kapatıyordu). Menüde **Kilit defteri** (V0.6.0): 14 kilidin hepsi görünür; görülenler tam açıklamalıdır, görülmeyenler adı ve açılacağı seviyeyle ("Sıradaki · Seviye 4" kesikli çerçeveli, sonrakiler "Seviye N") soluk gösterilir; başlıkta "N / 14 açıldı".
  Her satırda **Dene** düğmesi vardır (açılmamış kilitler için de).
- **Jokerler:** halkanın altında, başparmak bölgesinde (etiket için halkayla arasında boşluk bırakılır). İşe yarayacağı an biri parlar, büyür, etiketini gösterir (etiket ekranın dışına taşmaz)
  (Kronometre: süre ≤ 2,5 sn; Kalkan: art arda iki hata ya da cehennem başı; Stetoskop: hedef dar ya da cehennem başı; Kum saati: ibre çok hızlı ya da iki ıska).
  **Jokeri kullanmak için basılı tutulur** (V0.5.1: parlayan 0,28 sn, diğerleri 0,48 sn, halka dolar; doğru zamanda +25 puan, "Akıllı hamle!"). Kısa dokunuş her zaman oyuna geçer;
  ibre bir hedefin üstündeyken (`tapNear`) joker sırasına dokunuş hemen vuruş olur, gecikmez (tut-bırak pininde basış ve bırakış da çalışır). Böylece ekrana vururken jokerler yanlışlıkla harcanmaz. Etkiler `TOOL` tablosunda (seviyeyle artar). Yeni oyuncuda her jokerden 2 var; her 3 seviyede bir hediye.
  Alet çubuğu oyun alanının altındadır ve oyun dokunuşu almaz (kasıtlı, kazara kullanımı önler).
- **Can (yedek):** yeşil "+" hedefi; çift seviyelerin normal bölümünün %55'inden sonra, canın yoksa bir sonraki hedef olur. En fazla 1; süre çubuğunun
  yanında yeşil "+ Can" kapsülü. Süre bitince kendiliğinden devreye girer: +3 sn, kısa yavaş ibre.
- **Devam etme:** oyun her 5 sn'de ve çıkarken kaydedilir (`save.run`); uygulama kapansa bile menüde "Devam et", dokununca 3-2-1.
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
6. **Sıradaki (Faz 4):** `docs/kilit-katalogu.md` içindeki yapılmamış kilitler (Sarkaç ✚ Balyoz, Renk, Sis, Aynalı pim, Zırhlı pim, Işınlanma, Şifre, Makas,
   Ani pim, Zil pimi) sonsuz mod havuzu ve sonraki sürümler için; Antrenman modu; yeni tür kutlaması. Kullanıcının oyun sonrası geri bildirimine göre sıra belirlenir.
7. **Mağaza hazırlığı (ayrı sürüm, kullanıcı hesabı açınca haber verecek):** ikon, imzalı paket (AAB), gizlilik sayfası, gerçek reklam kimliği ve onay penceresi,
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
