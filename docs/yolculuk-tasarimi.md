# Yolculuk tasarımı (V0.4.1, onaylı 2026-10-17)

Bu belge oyunun güncel yolculuk tasarımıdır. V0.4.0'daki ilk tasarımdan (cennet bölümü, 15 dakikalık yolculuk) sonra kullanıcı geri bildirimiyle
değişti; değişiklik nedenleri `CHANGELOG.md` içinde. Hikaye/harita yok.

## Fikir

Oyun hızlanarak değil çeşitlenerek büyür. Bir oyun bir yolculuktur: 10 seviye, ortalama bir oyuncu için yaklaşık 5 dakika. Her yeni **iyi kilit**,
aynı anda ve aynı zorlukta bir **engel ikiziyle** açılır. Ekranda yalnızca "Seviye N" yazar; toplam seviye sayısı kullanıcıya gösterilmez.
10. seviyeden sonra "Sonsuz" mod başlar (10. seviye kuralları, zorluk hızlanır).

## Seviye yapısı

Her seviye bir **normal bölüm** ve onun sonunda kısa bir **cehennem** bölümünden oluşur (cennet bölümü V0.4.1'de kaldırıldı).
Cehennem geçilince: +4 sn, coin (2 × (5 + 2 × seviye)), her 2 seviyede bir rastgele joker hediyesi, kamp kaydı.

| Seviye | Normal | Cehennem | Başlangıç | Yeni kilit (✚ = engel ikizi) |
|---|---|---|---|---|
| 1 | 20 sn | 6 sn | 0:00 | Tek pim; çift pim ✚ tuzak pim (6. sn); seri çarpanı (13. sn) |
| 2 | 22 sn | 6 sn | 0:26 | Kayan pim ✚ kayan tuzak; karışım: çift + kayan (11. sn) |
| 3 | 22 sn | 7 sn | 0:54 | Nefes pim ✚ diken (kenardan); karışım: nefes + tuzak (11. sn) |
| 4 | 24 sn | 7 sn | 1:23 | Kasa turu ✚ alarm turu *(yapılmadı)* |
| 5 | 24 sn | 8 sn | 1:54 | İki halka ✚ kilitli halka *(iki halka var, kilitli halka yok)* |
| 6 | 24 sn | 8 sn | 2:26 | Altın pim ✚ lanetli altın *(yapılmadı)* |
| 7 | 26 sn | 8 sn | 2:58 | Hayalet pim ✚ hayalet tuzak *(yapılmadı)* |
| 8 | 26 sn | 9 sn | 3:32 | Gelgit ibre ✚ girdap *(yapılmadı)* |
| 9 | 28 sn | 9 sn | 4:07 | Renk pim ✚ yanıltıcı renk, bölgeli *(yapılmadı)* |
| 10 | 28 sn | 10 sn | 4:44 | Tut-bırak pim ✚ sıcak yay *(yapılmadı)* |
| Sonsuz | 28 sn | 10 sn | 5:22 | Ritim pim ✚ sahte nota, sarkaç ✚ balyoz, sis ✚ zehirli sis *(yapılmadı)* |

Her seviyede iki olay: yeni kilit seviye başında, ikincisi (★ güçlenme ya da karışım) normal bölümün yarısında. 1. seviyede üç olay var.
Yapılmamış kilitlerin olayları atlanır (yalnızca yapılmış kilitler, ★ ve karışım çalışır). Zamanlar `JOURNEY`, olaylar `JEV` (TUNE bloğu).

## Cehennem

Süre biraz hızlı erir, ceza ve engel olasılığı artar, hedefler daralır, ibre hızlanır; kızıl-siyah tema, kor ve çatlak efektleri.
Gücü seviyeyle artar: `hellK(L) = hell0 + hellStep × (min(L, 8) − 1) + hellEnd × max(0, L − 10)`; `hell0` 0,1, `hellStep` 0,04, `hellEnd` 0,08.
Yani 1. seviyede %10, 8.-10. seviyede %38, sonsuz modda her seviyede +%8 (18. seviyede tam güç).
Tam güç (k = 1) değerleri: süre ×1,05, ceza ×1,3, hedef ×0,9, ibre ×1,1, zorluk +0,1, engel ikizi olasılığı 0,5 (normalde 0,3).
Etkiler k ile normal bölümden tam güce doğrusal karışır. Her vuruşta +1 coin.

## Zorluk ve süre ekonomisi

- Taban yoğunluk `0,02 + 0,015 × (seviye − 1)`, 10. seviyeden sonra seviye başına 0,1 (`ib0`, `ibs`, `ibEnd`). 10 vuruşluk dalga (genlik 0,2) ve "nefes" araları sürer.
- Vuruş +1,1 sn, ıska −0,7 sn, tuzak −1,2 sn; hedefler daha geniş (hwMax 0,56), ibre daha yavaş (ωMax 3,8).
- Zorluk seçici: Normal bu ayardır; Rahat biraz daha kolay, Usta eski V0.4.0 sertliğine yakın.
- **Bot ölçümü** (`tools/bot.js`, Normal, joker kullanmadan, 4. seviyeden sonraki kilitler yokken): sıradan oyuncu (zamanlama sapması 0,08 sn) 10. seviyeye
  %84-100, iyi (0,05) %100, yeni başlayan (0,12) yaklaşık %50 varıyor. Usta zorlukta sıradan oyuncu %67. Kilitler eklendikçe oranlar düşecek;
  her fazdan sonra yeniden ölçülür. Hedef: sıradan oyuncunun yaklaşık yarısı 5 dakikada 10. seviyeye varsın.
- Sonsuz modda zorluk hızlanır; Ritim, Sarkaç ve Sis kilitleri buraya taşındı (henüz yapılmadı).

## Adil oyun kuralları (bütün kilitlere uygulanır)

1. Vuruş anında ibre ve hedef görünür.
2. Hiçbir engel hedefi tamamen kapatmaz; oyuncu bir tur boşa beklemek zorunda kalmaz.
3. Anlık hile yok: renk ve görünürlük değişimleri önceden görülebilir, hedefin dışında olur.
4. Yeni bir şey ilk görüldüğünde bir kez net anlatılır, sonra ipucu çıkmaz.

## Kilit çiftleri (iyi kilit ↔ engel ikizi)

Basamak (★1, ★2, ★3) değerleri slash ile verilmiştir. *(Yapıldı)* işaretliler oyunda var; diğerleri sonraki fazların tasarımıdır.

| İyi kilit | Kural | Engel ikizi | Kural |
|---|---|---|---|
| Çift pim *(yapıldı)* | İki hedef, 1 ve 2 numaralı | Tuzak pim *(yapıldı)* | Hedefin yanında gül rengi tuzak, dokunursan −1,2 sn |
| Kayan pim *(yapıldı)* | Hedef salınır (genlik 0,45–0,8, 0,32–0,5 Hz) | Kayan tuzak *(yapıldı)* | Hedefin üstünden kayar; hedefin %45'inden dar, hedefin açıkta kalan parçası her zaman vurulabilir; üstündeyken dokunursan seri sıfır, −1 sn |
| Nefes pim *(yapıldı)* | Hedef genişliği nefes alır; tam açıkken vuruş +1 | Diken *(yapıldı)* | Hedefin kapanan kenarları dikenlidir, ortası her zaman açık; dikenli kenara dokunursan −1,5 sn ve hedefler 3 sn %20 daralır |
| Kasa turu | Her 25 vuruşta 3 hedef art arda, ibre hızlanır, hedef daralır; açarsan +3 sn ve alet ya da coin | Alarm turu | Kasanın arasına "!" işaretli sahte kilit; dokunursan −2 sn, kasa sıfırlanır |
| İki halka *(yapıldı)* | Her ibre kendi hedefinde; dokunuş hedefteki ibreyi vurur (iç halka lila, dış halka şeftali) | Kilitli halka | **Kilitliyken iç ibre donar** (hedef kaçmaz), kilit açılınca devam eder; kilitliyken dokunursan −1 sn |
| Altın pim | Geniş hedefin yanında ince altın hedef; altın ×3 puan, +1 sn, +1 coin; kaçırırsan yalnızca ıska | Lanetli altın | Altına benzeyen kafatasımsı hedef; dokunursan −3 coin, −1 sn |
| Hayalet pim | Hedef önce görünür, sonra silikleşir (en az %15 görünür kalır, ibre hep görünür); görünmezken vuruş ×2 | Hayalet tuzak | Tuzak da silikleşir; dokunursan −1,5 sn, ekran 2 sn titrer |
| Gelgit ibre | İbre hızı açıya göre değişir; hızlı bölge dışta koyu bantla görünür | Girdap | İçinden geçen ibre 2,4 sn hızlanır |
| Renk pim | **Halka iki renk bölgesidir** (şeftali ve lila); ibre bulunduğu bölgenin rengini yumuşakça alır; yalnızca rengi uyan hedefe dokunulur; hedefin içinde renk asla değişmez | Yanıltıcı renk | Yanlış renk bölgesine konan hedef ("≠"); dokunursan −1 sn |
| Tut-bırak pim | Uzun yay; ibre başa gelince basıp tut, sondaki bölgede bırak | Sıcak yay | Yayın son üçte biri sıcak; tutarken yanarsın, süre erir. **İlk karşılaşmada** yay kızarır, çubuk alev alır, "Sıcak! Bırak" yazar; sonra ipucu yok |
| Ritim pim (sonsuz) | 3/4/5 küçük hedef art arda, vuruşlarda yükselen nota | Sahte nota | Dizinin arasına gül rengi ×'li nota; dokunursan −1 sn, zincir bozulur |
| Sarkaç ibre (sonsuz) | İbre dönmez, sağa sola salınır; ortada vuruş ×2 | Balyoz | Hedefin üstünden salınan balyoz; üstteyken dokunursan −2 sn, 1 sn dokunuş kilidi |
| Sis tüneli (sonsuz) | **İbre hep görünür**; hedef sisin içinde saklı, ibre yaklaşınca (yarım sn kala) sis dağılır | Zehirli sis | Yeşil sis, içinde gizli tuzak; dokunursan 3 sn süre %50 hızlı erir |

Tek pim ve Seri çarpanı çekirdek oyundur; çarpan 5/10/20/35. vuruşta ×2/×3/×4/×5.

## Ekran ve yardımcılar (V0.4.1)

- **HUD:** süre çubuğu, "Seviye N" ve altında ince ilerleme çizgisi (cehennemde kızıl), cehennem rozeti. Toplam seviye ve noktalı yol yok.
- **Yeni kilit kartı** (üst kart): HUD'un altında; yeni kilitte simge + ad + kural + uyarı, 6 sn; ★/karışım/seri gibi küçük haberler tek satır, 4 sn.
  Yeni kilidin ilk hedefi kart çıktıktan 2 sn sonra ve ibreden uzak doğar. **Nesne etiketi:** yeni kilidin ilk 3 karşılaşmasında hedefin ve
  tuzağın yanında kısa yazı ("Açıkken vur", "Dikene dokunma"). Menüde **Kilit defteri**: görülen kilitlerin açıklamaları.
- **Jokerler:** halkanın altında, başparmak bölgesinde. İşe yarayacağı an biri parlar, büyür, etiketini gösterir (Kronometre: süre ≤ 2,5 sn;
  Kalkan: art arda iki hata ya da cehennem başı; Stetoskop: hedef dar ya da cehennem başı; Kum saati: ibre çok hızlı ya da iki ıska).
  Parlayan jokere dokunmak yeter (+25 puan, "Akıllı hamle!"); parlamayan joker basılı tutulunca (0,45 sn) çalışır, kısa dokunuş oyuna geçer.
  Etkiler `TOOL` tablosunda (seviyeyle artar): stetoskop hedefleri genişletir, kronometre süre ekler, kalkan ceza ve seri bozulmasını önler,
  kum saati ibreyi yavaşlatır. Yeni oyuncuda her jokerden 2 var; her 2 seviyede bir hediye. Oyun jokersiz biterse "… vardı, kullanmadan bitti" notu.
  (Tasarımdaki "yukarı kaydır" kısayolu yapılmadı: kaydırmanın ilk dokunuşu oyunda vuruş sayılırdı.)
- **Can (yedek):** yeşil "+" hedefi; çift seviyelerin normal bölümünün %55'inden sonra, canın yoksa bir sonraki hedef olur. En fazla 1; süre çubuğunun
  yanında yeşil "+ Can" kapsülü ve çubuğun yeşil çerçevesi. Süre bitince kendiliğinden devreye girer: +3 sn, kısa yavaş ibre. Kalp simgesi
  kullanılmadı (kullanıcı isteği).
- **Devam etme:** oyun her 5 sn'de ve çıkarken kaydedilir (`save.run`); uygulama kapansa bile menüde "Devam et" (seviye ve puan yazar), dokununca 3-2-1.
  "Yeni oyun" kayıt varken önce sorar. Oyun bitince kayıt silinir.
- **Menü:** "Oyun" sayacı kalktı; en iyi puan, ulaşılan seviye, joker stoğu, zorluk seçici, büyük Devam et/Oyna, Kamp, sürüm adı.

## Kamp, rekor, duraklatma

- **Kamp:** Bir seviyeyi (cehennemi dahil) bitirince o seviyenin sonu kayıt noktası olur; menüde "Kamp · Seviye N". Kamp oyunları puan rekorunu etkilemez.
- **Rekor:** Puan rekoru (zorluk başına) yalnızca 1. seviyeden başlayan oyunlarla güncellenir; "en iyi seviye" her oyunda.
- **Duraklatma:** Ana ekran, ekran kilidi, geri tuşu ve uygulamadan çıkış oyunu duraklatır ve kaydeder; sayaçlar, tema geçişi donar; "Devam et"ten sonra 3-2-1.
  Duraklatma ekranında "Menü" düğmesi kaydı bırakıp menüye döner.

## Yapım sırası ve durum

1. **Faz 1 (V0.4.0): TAMAM.** İskelet, tema geçişi, HUD, kamp, duraklatma geri sayımı, Seviye 1-3 kilitleri.
2. **V0.4.1: TAMAM.** Cennet kalktı, yeni tempo (~5 dk), diken kenara alındı, kayan tuzak daraldı, jokerler, can, devam etme, yeni kilit kartı ve
   etiketleri, kilit defteri, "Seviye N" yazısı, menü.
3. **Faz 2:** Kasa ✚ Alarm, Kilitli halka (donduran), Altın ✚ Lanetli altın; ★ ve karışımların kalanı.
4. **Faz 3:** Hayalet, Gelgit ve engel ikizleri.
5. **Faz 4:** Renk (bölgeli), Tut-bırak ✚ Sıcak yay (ilk karşılaşma uyarısıyla), sonsuz mod kilitleri (Ritim, Sarkaç, Sis, düzeltilmiş), Antrenman modu,
   yeni tür kutlaması.
6. **Mağaza hazırlığı (ayrı sürüm):** ikon, imzalı paket (AAB), gizlilik sayfası, gerçek reklam kimliği ve onay penceresi, paket adının kesinleşmesi.

Sonsuz mod şimdilik yalnızca 10. seviye sonrası otomatik devam ("Yolculuk tamamlandı", +100 coin); yoğunluk ve cehennem gücü her seviyede artar.

## Bot ile zorluk ölçümü

`tools/bot.js` gerçek oyun kodunu hızlandırılmış zamanla oynatır (kullanımı dosyanın başında). Beceri = dokunuş zamanlama hatasının standart sapması
(yeni 0,12 sn, orta 0,08, iyi 0,05, usta 0,03). Normal zorluk, joker kullanılmadan, 4. seviyeden sonraki kilitler yokken:

| Beceri | 10. seviyeye ulaşan | Medyan ulaştığı seviye |
|---|---|---|
| yeni | ~%50 | — |
| orta | %84-100 | 16-17 |
| iyi | %100 | 19 |
| usta | hepsi | — |

Rahat daha kolay; Usta'da orta bot %67 ile 10. seviyeye varıyor, yeni bot 8. seviyeye kadar ölüyor. Her faz sonunda yeni kilitlerle yeniden ölçülür.
Bu sayılar insan oyuncu değil bot sonucudur; gerçek oyuncu geri bildirimi gelince ayarlanır. V0.4.0'daki ölçümler (3. seviyede sıradan bot ölüyordu) bu
yüzden tempo bu sürümde baştan yeniden ayarlandı.
