# Yolculuk tasarımı (onaylı, 2026-10-16)

Kullanıcı bu tasarımı ve aşağıdaki süreleri onayladı. Süreler "şimdilik kesin" kabul edildi; yolculuk için süre ekonomisi
simülasyonu bilerek ertelendi (ilk oyun testlerinden sonra gerçek oyuncu verisiyle ele alınacak). Hikaye/harita yok.

## Fikir

Oyun hızlanarak değil çeşitlenerek büyür. Bir oyun bir yolculuktur: 10 seviye, aralıksız oynayan biri için yaklaşık 15 dakika.
Her yeni **iyi kilit**, aynı anda ve aynı zorlukta bir **engel ikiziyle** açılır. Engeller "can yakar": süre, seri, coin,
ibre hızı, dokunuş kilidi, zehir gibi farklı biçimlerde ceza verir.

## Seviye yapısı

- Her seviyede 3 **kilit olayı** var. Bir çift (iyi kilit + engel ikizi) tek olay sayılır. Diğer olaylar: `★` (eski bir kilidin
  bir basamak güçlenmesi) ve `Karışım` (bilinen iki kilidin aynı meydan okumada gelmesi).
- Üçüncü olaydan sonra **Cennet** (10 + seviye sn), sonra **Cehennem** (aynı süre), sonra sonraki seviye.
- Ekranda hep `Seviye N/10` yazar (süre çubuğunun altında) ve 10 noktalı yol görünür. Cennet/cehennemde yanında
  `Cennet · 13 sn` / `Cehennem · 13 sn` rozeti çıkar.
- Seviye 10 bitince "Yolculuk tamamlandı" ekranı ve ödül, sonra isteğe bağlı sonsuz mod (seviye 10 kuralları, her dakika bir basamak zorlaşır).

## Zaman çizelgesi (m:ss, yolculuğun başından; toplam 15:00)

Normal bölüm uzunlukları (sn): 45, 52, 56, 58, 60, 60, 62, 62, 65, 70. Cennet ve cehennem: 10 + seviye sn (11 … 20).
Olay zamanları: 1. olay seviye başında, 2. olay normal bölümün %40'ında, 3. olay %75'inde.

| Seviye | Başlangıç | Yeni kilitler (3 olay) | Puan türü | Ceza türü | Cennet + cehennem |
|---|---|---|---|---|---|
| 1 Isınma | 0:00 | Tek pim (0:00) · Çift pim ✚ Tuzak pim (0:18) · Seri çarpanı (0:34) | Düz puan, mükemmel ×2, kıl payı ×3 | Iska −1 sn, tuzak −1,5 sn | 11 + 11 sn, 0:45 |
| 2 Kayma | 1:07 | Kayan pim ✚ Kayan tuzak (1:07) · ★ (1:28) · Karışım: çift + kayan (1:46) | Seri çarpanı ×2'den ×5'e | Iska ve kayan tuzak seriyi sıfırlar | 12 + 12 sn, 1:59 |
| 3 Nefes | 2:23 | Nefes pim ✚ Diken (2:23) · ★ (2:45) · Karışım: nefes + tuzak (3:05) | Nefes bonusu (tam açıkken +1) | Diken: −1,5 sn, hedef 3 sn daralır | 13 + 13 sn, 3:19 |
| 4 Kilit odası | 3:45 | Kasa turu ✚ Alarm turu (3:45) · Ritim pim ✚ Sahte nota (4:08) · ★ (4:29) | Kasa ödülü, nota puanı | Alarm: −2 sn, kasa sıfırlanır. Sahte nota: −1 sn, zincir bozulur | 14 + 14 sn, 4:43 |
| 5 Çifte halka | 5:11 | İki halka ✚ Kilitli halka (5:11) · ★ (5:35) · Karışım: iki halka + tuzak (5:56) | Halka puanı (iki halka art arda +2) | Kilitli halka: −1 sn, halka 4 sn kilitli | 15 + 15 sn, 6:11 |
| 6 Altın çağı | 6:41 | Altın pim ✚ Lanetli altın (6:41) · ★ (7:05) · Karışım: altın + nefes (7:26) | Altın puanı: ×3, +1 sn, +1 coin | Lanetli altın: −3 coin, −1 sn | 16 + 16 sn, 7:41 |
| 7 Hafıza | 8:13 | Hayalet pim ✚ Hayalet tuzak (8:13) · ★ (8:38) · Karışım: hayalet + kayan (8:59) | Hafıza puanı (görünmeden vuruş ×2) | −1,5 sn, ekran 2 sn titrer | 17 + 17 sn, 9:15 |
| 8 Hız | 9:49 | Gelgit ibre ✚ Girdap (9:49) · Sarkaç ibre ✚ Balyoz (10:14) · ★ (10:35) | Hız puanı (hızlı bölgede, sarkaç ortasında ×2) | Girdap: ibre 3 sn hızlanır. Balyoz: −2 sn, 1 sn dokunuş kilidi | 18 + 18 sn, 10:51 |
| 9 Gölge | 11:27 | Renk pim ✚ Yanıltıcı renk (11:27) · Sis tüneli ✚ Zehirli sis (11:53) · ★ (12:16) | Renk zinciri (+1, +2, +3…), sis içinde ×2 | Yanıltıcı renk: −1 sn, 2 sn ters renk. Zehirli sis: 3 sn süre %50 hızlı erir | 19 + 19 sn, 12:32 |
| 10 Final | 13:10 | Tut-bırak pim ✚ Sıcak yay (13:10) · Efsane karışımı: tüm türler (13:38) · Final (14:02) | Tut puanı (tuttukça +1, doğru bırakma ×2), tüm puanlar ×1,5 | Sıcak yay: tutarken yanık, süre erir. Tüm cezalar bir arada | 20 + 20 sn, 14:20 |

Cehennem, cennetin hemen arkasından gelir (cennet başlangıç saatine cennet süresini ekle).

## Cennet ve cehennem

- **Cennet** (10 + seviye sn): süre donar, ıska cezasız (seri de bozulmaz), puan ×2, her 2 vuruşta +1 coin, hedefler %30 geniş,
  ibre %15 yavaş, engel yok. O seviyenin iyi kilidi bol çıkar. Bitince +3 sn ve ödül: 5 + 2×seviye coin; 3., 6., 9. seviyede bir alet.
- **Cehennem** (aynı süre): süre 1,25 kat hızlı erir, ıska ve tuzak cezası ×2, hedefler %20 dar, ibre %20 hızlı, engel ikizleri bol
  (olasılık 0,75; normalde 0,3). Her vuruşta +1 coin. Sağ çıkarsan +3 sn ve 2 × (5 + 2×seviye) coin, sonra sonraki seviye.
  Orada ölürsen oyun biter, ama ulaşılan seviye kaydedilir.
- **Cehennemin gücü seviyeyle artar** (bot testinden sonra eklendi, ilk sürümde 1. seviyedeki cehennem herkesi eliyordu): 1. seviyede
  yukarıdaki etkilerin %40'ı, her seviyede +%12, 6. seviyeden itibaren tam güç. Başlıkta gerçek ceza çarpanı yazar ("Ceza ×1,4").
  Ayar: `JOURNEY.hell0` ve `JOURNEY.hellStep` (TUNE bloğu).
- Zorluk seviyeye bağlı: taban yoğunluk `0,05 + 0,07 × (seviye − 1)` (+ 10 vuruşluk dalga ve "nefes" araları). Cennet −0,25, cehennem +0,15 kayar.
- Uzun oyunda süreyi hızlandıran "yorgunluk" yolculukta yoktur.

## Tema ve görünüm

- Normal: lila + şeftali (sistem açık/koyu temasını izler).
- Cennet: altın-krem arka plan, bulutlar, kıvılcımlar, altın hedefler. Cehennem: kızıl-siyah, kor, çatlaklar, kızıl hedefler.
- Geçiş yaklaşık 1 saniyede, koyu moda geçer gibi yumuşak (renkler üstel yumuşatma ile karışır; `k = 1 − e^(−2,6·dt)`).
- Bölüm başında büyük başlık 2 sn: "Cennet bölümü", "Cehennem bölümü", "Seviye N".
- Cennet'te rozet: "Puan ×2 · ceza yok". Cehennem'de: "Ceza ×2 · süre hızlı erir".

## Kilit çiftleri (iyi ↔ engel ikizi) ve kuralları

Basamak (★1, ★2, ★3) değerleri slash ile verilmiştir.

| İyi kilit | Kural | Engel ikizi | Kural |
|---|---|---|---|
| Çift pim | İki hedef, 1 ve 2 numaralı, aralarında 0,5–1,0 rad boşluk | Tuzak pim | Hedefin yanında gül rengi tuzak, dokunursan −1,5 sn |
| Kayan pim | Hedef salınır (genlik 0,45–0,8, 0,32–0,5 Hz) | Kayan tuzak | Tuzak hedefin üstünden kayar (genlik 0,95, 0,33 Hz); üst üsteyken dokunursan seri sıfır, −1 sn |
| Nefes pim | Hedef yarı genişliği tam genişlik ile (1 − g) arasında nefes alır; g = 0,3/0,5/0,62, periyot 1,7/1,2/0,9 sn; yalnızca o anki genişlikte vuruş sayılır | Diken | Hedefin üstünde dikenli tuzak, genişliği 0,1–0,46 arası 1,4 sn'de nefes alır; açıkken (>0,3) dokunursan −1,5 sn ve hedefler 3 sn %20 daralır |
| Kasa turu | Her 25 vuruşta 3 hedef art arda (1,5 rad aralık, her vuruşta ibre ×1,12, hedef −%18); yarı genişlik 0,36/0,28/0,2; açarsan +3 sn ve alet ya da coin | Alarm turu | Kasanın arasına "!" işaretli sahte kilit; dokunursan −2 sn, kasa sıfırlanır |
| Ritim pim | 3/4/5 küçük hedef (yarı genişlik 0,26/0,2/0,16) 1,15 rad aralıkla; vuruşlarda yükselen nota; hepsi tutarsa +0,6 sn | Sahte nota | Dizinin arasına gül rengi ×'li nota; dokunursan −1 sn, zincir bozulur |
| İki halka | Her ibre kendi hedefinde; dokunuş hedefteki ibreyi vurur; iç halka lila, dış halka şeftali | Kilitli halka | İç halka 2,2 sn'de bir kilitlenir (kilit simgesi, gül tonu); kilitliyken dokunursan −1 sn |
| Altın pim | Geniş normal hedefin yanında ince altın hedef (yarı genişlik 0,24/0,17/0,12); altın ×3 puan, +1 sn, +1 coin; kaçırırsan ibre bir tur döner | Lanetli altın | Altına benzeyen koyu, kafatasımsı işaretli hedef; dokunursan −3 coin, −1 sn |
| Hayalet pim | Hedef 1,2/0,9/0,55 sn görünür, sonra %35/%12/%0 görünürlüğe silikleşir | Hayalet tuzak | Tuzak da silikleşir; dokunursan −1,5 sn, ekran 2 sn titrer |
| Gelgit ibre | İbre hızı açıya göre değişir: ω(a) = ω0(1 + v·sin a), v = 0,25/0,5/0,72; dışarıda koyu bant hızlı bölgeyi gösterir | Girdap | Halkada girdap bölgesi; içinden geçen ibre 2,4 sn ×1,9 hızlanır |
| Sarkaç ibre | İbre dönmez, sağa sola salınır (yarım aralık 0,8/1,1/1,5 rad, 0,42/0,52/0,66 Hz); hedefler salınımın içinde; ortada vuruş ×2 | Balyoz | Hedefin üstünden salınan gül rengi balyoz (genlik 1,0 rad, 0,45 Hz); üstteyken dokunursan −2 sn, 1 sn dokunuş kilidi |
| Renk pim | İbre rengi (şeftali daire / lila elmas) 2,0/1,4/0,95 sn'de bir değişir; yalnızca rengi uyan hedefe dokunulur; şekil renk körlüğü için | Yanıltıcı renk | Renk hedefe varmadan hemen önce değişir (hile); dokunursan −1 sn ve 2 sn ters renk |
| Sis tüneli | Halkanın 0,9/1,7/2,4 rad'ı sisli; ibre içinde görünmez, hedef sisin içinde | Zehirli sis | Yeşil sis, içinde gizli tuzak; dokunursan 3 sn süre %50 hızlı erir |
| Tut-bırak pim | Uzun yay (1,2/1,8/2,5 rad); ibre başa gelince basıp tut, sondaki bölgede (0,34/0,24/0,16 rad) bırak | Sıcak yay | Yayın son üçte biri sıcak (gül); orada basılı tutarsan yanarsın, süre erir |

Tek pim ve Seri çarpanı (combo) çekirdek oyundur; çarpan 5/10/20/35. vuruşta ×2/×3/×4/×5.

## Kamp, rekor, duraklatma

- **Kamp:** Bir seviyeyi (cehennemi dahil) bitirince o seviyenin sonu kayıt noktası olur. Sonraki oyunda menüde "Kamp · Seviye N" ile oradan
  başlanabilir. Kamp oyunları puan rekorunu etkilemez; en iyi seviye ayrı tutulur.
- **Rekor:** Puan rekoru (zorluk seviyesi başına) yalnızca 1. seviyeden başlayan oyunlarla güncellenir. "En iyi seviye" her oyunda güncellenir.
- **Duraklatma:** Ana ekran tuşu, ekran kilidi/kapanması, geri tuşu ve uygulamadan çıkış oyunu duraklatır (zaten çalışır).
  Seviye sayacı, cennet/cehennem geri sayımı, tema geçişi ve ses de duracak; "Devam et"ten sonra 3-2-1 geri sayım.
- Zorluk seçici (Rahat/Normal/Usta) sayıları değiştirir; yolculuk süreleri sabittir. ("Usta'da hızlı açılış" fikri bu yüzden kaldırıldı.)

## Yapım sırası ve durum

1. **Faz 1 (iskelet): TAMAM (0.3.0).** Seviye/cennet/cehennem akışı (`jPhaseAt`), kilit olayları (`JEVENTS`, `fireEvent`), tema geçişi
   (`THEME_H`/`THEME_X`, `applyTheme`), HUD (Seviye N/10, 10 noktalı yol, bölüm rozeti), bölüm başlığı, kamp, duraklatmada her şeyin donması ve
   "Devam et"ten sonra 3-2-1. Kilitler: Çift ✚ Tuzak, Kayan ✚ Kayan tuzak, Nefes ✚ Diken (hedefle ters fazda nefes alan dikenler),
   Seri çarpanı, ★ (en az güçlenmiş kilit güçlenir), Karışım (S2: çift + kayan, S3: nefes + tuzak, S5: iki halka + tuzak), Nefes bonusu (tam açıkken +1),
   İki halka (S5, kilitli halka olmadan). Henüz yapılmamış kilitlerin olayları atlanır.
2. **Faz 2:** Kasa ✚ Alarm, Ritim ✚ Sahte nota, Kilitli halka, Altın ✚ Lanetli altın; ★ ve Karışım olaylarının kalanı.
3. **Faz 3:** Hayalet, Gelgit, Sarkaç ve engel ikizleri.
4. **Faz 4:** Renk, Sis, Tut-bırak ve engel ikizleri; final ve sonsuz mod; Antrenman modu; yeni tür kutlaması.

Sonsuz mod şimdilik yalnızca 10. seviye sonrası otomatik devam ("Yolculuk tamamlandı", +100 coin); bölüm uzunlukları 10. seviyeninkiyle aynı,
yoğunluk her seviyede biraz artar.

## Bot ile zorluk ölçümü (Faz 1 sonrası)

`tools/bot.js` gerçek oyun kodunu hızlandırılmış zamanla oynatır (kullanımı dosyanın başında). Beceri = dokunuş zamanlama hatasının standart sapması
(yeni 0,12 sn, orta 0,08, iyi 0,05, usta 0,03). Her hücre 40 oyun, Normal zorluk, cehennem gücü rampasıyla:

| Beceri | Ölüm anı (medyan) | S2'ye ulaşan | S3 | S4 | S5 | S6 |
|---|---|---|---|---|---|---|
| yeni | 40 sn | 7/40 | 0 | 0 | 0 | 0 |
| orta | 140 sn | 33/40 | 12 | 0 | 0 | 0 |
| iyi | 217 sn | 40/40 | 39 | 12 | 1 | 0 |
| usta | 221 sn | 40/40 | 38 | 14 | 6 | 3 |

Rahat'ta orta bot 194 sn, usta bot 346 sn medyan (S6'ya 11/40); Usta'da orta bot 63 sn, usta bot 197 sn. Yani yolculuğun tamamı (15 dk) şimdilik
yalnızca çok iyi oyuncular ve kamp kayıt noktalarıyla ulaşılabilir; bu bilinçli bir "zor" tercih değil, gerçek oyuncu verisiyle ayarlanacak konu.
Botun bulduğu iki hata düzeltildi: tuzak ikizi çift pimin ikinci hedefinin üstüne düşüyordu; hell ilk sürümde 1. seviyede bile tam güçteydi.

Açık konu: yolculuk süre ekonomisinin (başlangıç süresi, cennet/cehennem etkileri, zorluk eğrisi) gerçek oyuncu geri bildirimiyle ayarı.
Kullanıcı süre simülasyonu adımını bilerek atladı; süreler (normal bölüm uzunlukları, cennet/cehennem 10 + seviye sn) değişmedi.
