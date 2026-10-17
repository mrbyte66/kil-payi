# Kilit kataloğu ve V0.5.0 (onaylandı ve uygulandı)

Kaynak: V0.4.1 geri bildirimi (2026-10-17). Kullanıcı özeti: oyun 4. seviyeden sonra "hep aynı oyun", hiç ölmüyor, yeni kilitleri göremedi;
etiket yazıları görüşü kapatıyor; diken hedefe sızıyor ama çok çabuk çekiliyor; bonuslar fazla. İstek: 10 yeni kilit/engel fikri daha, eski ve yeni
önerilerin hepsi Kolay/Orta/Zor gruplarında; V0.5.0'da ele alınacak; zorluk/süre buna göre yeniden ayarlanacak. Play Store işi: kullanıcı hesabı alınca haber verecek.
Durum (V0.5.0): aşağıdaki "V0.5.0'da yapılanlar" tablosundaki 14 kilit ve 11 engel/ikiz oyunda; geri kalan fikirler (Aynalı pim, Zırhlı pim, Sarkaç, Renk, Sis, Şifre, Makas, Ani pim, Zil; Işınlanma pimi V0.7.0'da yapıldı, yalnızca Kara kapı ikizi bekliyor) sonsuz mod havuzu ve sonraki sürümler için bekliyor.
Görsel kaynak: konuşmadaki animasyonlu katalog (bu dosya aynı içeriğin yazılı kaydıdır). İkinci tur (2026-10-17): kullanıcı lanetli altın, sabır pimi, kilitli halka, hayalet pim, trafik ışığı ve bomba pim için düzeltme istedi; yeniden çizildi, bu tabloda "v2" yazanlar güncel hali. Diken düzeltmesi onaylandı.

## Kolay (tek yeni fikir, hata bağışlayıcı)

| Kod | Kilit ✚ engel ikizi | Kaynak | Ne yapar / engel |
|---|---|---|---|
| K1 | Altın pim ✚ Lanetli altın | eski | İnce altın hedef (parıltılı, açık çerçeve), vurursan ×3 puan (süre vermez). Lanetli altın aynı ince şekil ama soluk, zehir yeşili çerçeveli, damlalı, kafatası işaretli; dokunursan −3 coin, −1 sn. |
| K2 | Kasa turu ✚ Alarm turu | eski | Üç hedef art arda, ibre hızlanır, üçünü açarsan ödül. Araya "!" işaretli sahte kilit girer: −2 sn, tur sıfırlanır. |
| K3 | Aynalı pim ✚ Kara ayna | yeni | Hedefin tam karşısında yansıması var, hangisi önce gelirse vur. Yansıma bazen kararır, dokunma (−1 sn). |
| K4 | Sabır pimi ✚ Çürük kilit | yeni (v2) | Kilidin üstünde 3 nokta, ibre her geçtiğinde biri yanar. Beklerken halkanın başka yerinde küçük yan hedefler çıkar (vurunca süre kazanırsın). Üç nokta yanınca kilit açılır, pim altına döner (×3). Kilide erken dokunursan sarsılır, noktalar sıfırlanır (−1 sn). Çürük kilit: açıldıktan sonra yalnızca bir tur açık kalır. |

## Orta (dikkat ister)

| Kod | Kilit ✚ engel ikizi | Kaynak | Ne yapar / engel |
|---|---|---|---|
| O1 | Ritim pim ✚ Sahte nota | eski | 3-4-5 küçük hedef art arda, vuruşlarda nota yükselir. Gül renkli × nota: −1 sn, zincir bozulur. |
| O2 | İki halka ✚ Kilitli halka | eski (iki halka oyunda var; v2) | Kilitlenen iç halka tamamen kapanır: ibre durur, hedefi kilit altında kalır ve sayılmaz; dokunuşlar yalnızca dış ibreye bakar, ceza yok. Bedel: dış ibre kilit süresince %25 hızlanır. Geri sayım görünür, kilit açılınca iç hedef yeni yere gelir. |
| O3 | Hayalet pim ✚ Hayalet tuzak | eski (v2) | Hedef ve tuzak 1,5 sn görünür, sonra tamamen kaybolur (yerleri değişmez); hafızandan vur: hayalet ortaya çıkar, ×2. Tuzağın yerini unutursan −1,5 sn, ekran titrer. ★ arttıkça görünme süresi kısalır. İbre hep görünür. |
| O4 | Trafik ışığı pimi | yeni (v2) | Yan yana iki hedef: biri yeşil, biri kırmızı; ışıklar her 1,4 sn yer değiştirir (önce sarı yanıp söner). Yeşile vur, kırmızıya dokunma (−1 sn). İbre içerideyken ışık değişmez. ★ arttıkça ritim hızlanır (1,4 → 1,1 → 0,8 sn). |
| O5 | Zırhlı pim ✚ Cam tuzak | yeni | İri hedef üç vuruşta kırılır, ibre biraz hızlanır. Cam tuzak gridir, dokunursan −1 sn. |
| O6 | Bomba pim | yeni (v2) | Fitil yanar, bombanın çevresindeki halka eriyip kırmızıya döner, geri sayım hızlanır. Süre dolmadan vurursan etkisiz (+25). Kaçırırsan patlar: parlama, patlama dalgası, ekran sarsıntısı, halkada çatlak (−1,5 sn). ★ arttıkça fitil kısalır, sonra ikinci bomba gelir. |
| O7 | Işınlanma pimi *(yapıldı, V0.7.0)* ✚ Kara kapı *(yapılmadı)* | yeni | Mavi kapıya giren ibre görünmez olur, 0,15-0,50 sn sonra (her turda rastgele) turuncu kapıdan çıkar; hedef çıkıştan yaklaşık yarım saniye ilerisindedir. Kara kapı ibreyi biraz geri atar. |

## Zor (iki şeyi birden izle ya da yeni dokunuş)

| Kod | Kilit ✚ engel ikizi | Kaynak | Ne yapar / engel |
|---|---|---|---|
| Z1 | Gelgit ibre ✚ Girdap | eski | İbre hızı halkada değişir (hızlı bölge bantlı). Girdap: içinden geçen ibre 2,4 sn hızlanır. |
| Z2 | Sarkaç ibre ✚ Balyoz | eski | İbre sallanır, ortada ×2. Hedefin üstünde sallanan balyoz: −2 sn. |
| Z3 | Renk pim ✚ Yanıltıcı renk | eski (düzeltilmiş) | Halka iki renk bölgesi; yalnızca aynı renk hedef. Yanlış bölgedeki hedef (≠): −1 sn. Hedefin içinde renk değişmez. |
| Z4 | Sis tüneli ✚ Zehirli sis | eski (düzeltilmiş) | İbre hep görünür, hedef sisin içinde, ibre yaklaşınca dağılır. Yeşil zehirli sis: süre hızlı erir. |
| Z5 | Tut-bırak pim ✚ Sıcak yay | eski | Uzun yayda basılı tut, sonda bırak. Son bölüm sıcak; ilk karşılaşmada net uyarı. |
| Z6 | Şifre kilidi ✚ Yanlış şifre | yeni | Üç hedef 1-2-3 numaralı, ibre karışık sırayla gelir. Yanlış sıra: −1,5 sn, şifre sıfırlanır. |
| Z7 | Makas pim | yeni | İki yarım hedef birbirine kayar; kesişimde ×2. Engel ikizi yok. |
| Z8 | Ani pim ✚ Yalancı şimşek | yeni | İbrenin önünde ansızın çakan hedef, 0,7 sn yaşar. Gül renkli yalancı şimşek: dokunma. |
| Z9 | Zil pimi ✚ Fazla tık | yeni | İbrenin yavaşladığı geniş bölgede iki kez dokun. Üçüncü dokunuş: −1 sn. |

## V0.5.0'da yapılanlar

Seviye 1-3 aynı kaldı (diken yavaş çıkıyor). Seviye 4-10'da her seviyenin başında iyi kilit, ortasında engel ikizi gelir (yenilik yaklaşık 13 sn'de bir).
Kullanıcı düzeltmelerinden sonra Sabır pimi ✚ Çürük kilit, Trafik ışığı ve Bomba pim de eklendi; bunlar tablodaki "Sonda" sütununda, seviyenin son çeyreğinde gelir.
Kolay seviye 4-5, Orta 6-8, Zor 9-10. Bir seviye 29 sn → 42 sn; seviye 10 başlangıcı 4:49, ölmeden toplam 5:31.

| Seviye | Normal + cehennem | Başlangıç | Başta | Ortada | Sonda |
|---|---|---|---|---|---|
| 4 | 22 + 7 | 1:23 | K1 Altın pim | Lanetli altın | K4 Sabır pimi |
| 5 | 24 + 7 | 1:52 | K2 Kasa turu | Alarm turu | Çürük kilit (sabır pimine) |
| 6 | 26 + 8 | 2:23 | O1 Ritim pim | Sahte nota | O4 Trafik ışığı |
| 7 | 28 + 8 | 2:57 | O2 İki halka | Kilitli halka | ★ güçlenme |
| 8 | 28 + 9 | 3:33 | O3 Hayalet pim | Hayalet tuzak | O6 Bomba pim |
| 9 | 30 + 9 | 4:10 | Z1 Gelgit ibre | Girdap | ★ güçlenme |
| 10 | 32 + 10 | 4:49 | Z5 Tut-bırak pim | Sıcak yay | ★ güçlenme |

Seçilmeyenler (yeni fikirler dahil) sonsuz modun havuzuna ve sonraki sürümlere gider; sonsuz mod, görülmüş kilitlerin rastgele karışımı olur.
Kodda: iyi kilitler `JKIND`, ikizler `JTWIN`, olaylar `JEV`, sayılar `MECH`; yeni tür eklerken `IMPL_GOOD`/`IMPL_TWIN`/`BOOK` tablolarına da eklenir.

## Diğer V0.5.0 değişiklikleri

- **Yazılar:** Halkanın üstündeki etiket pili kalkar (hedefi kapatıyordu). Kart büyür (başlık 22, kural 17 punto), hareketli mini gösterim ve renkli noktalar
  (şeftali = vur, gül = dokunma) eklenir, kart yeni kilidin ilk hedefi vurulana ya da ıskalanana kadar kalır (en çok 8 sn). Halkada yalnızca dışarıda iki küçük
  işaret kalır (✓ vur, ✕ dokunma), hiç yazı yok.
- **Diken:** Hızlı girer (0,3 sn), bekler (0,8 sn), yavaş çıkar (1,5 sn); dikenli kalma süresi %67 → %77, tam açık süre %20 → %14. Hedefin ortası her zaman açık.
- **Bonuslar kısıldı (botla ayarlandı):** vuruş +1,1 → +0,95 sn, mükemmel bonusu 0,15 → 0,08, cehennem sonu +4 → +2 sn,
  joker hediyesi her 2 seviyede → her 3 seviyede. Başlangıç jokeri 2'de kaldı (V0.4.1'de jokerler işe yarar hale geldi, kullanıcı beğendi).
- **Zorluk hedefleri (10. seviyeye varma oranı, bot, tüm kilitler açıkken):**

| Mod | yeni (σ 0,12) | orta (0,08) | iyi (0,05) | usta (0,03) |
|---|---|---|---|---|
| Rahat (kolay) | %40 | %80 | %95 | %100 |
| Normal (orta) | %5 | %35 | %60 | %90 |
| Usta (zor) | %0 | %8 | %25 | %60 |

  Kilitler yapıldıkça her fazdan sonra `tools/bot.js` ile ölçülür ve ayar (TUNE bloğu) buna göre yapılır.
  **V0.5.0 ölçümü** (Normal): yeni %4, orta %32, iyi %86, usta %92; Rahat: %28 / %75 / %97; Usta: %0 / %0 / %33 / %78. Ayrıntı ve yorum `docs/yolculuk-tasarimi.md` sonunda.
