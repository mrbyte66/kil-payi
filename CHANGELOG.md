# Sürüm notları

Sürüm adları `V0.x.y` biçimindedir. Her sürümün APK'sı `kil-payi-v0.x.y.apk` adıyla verilir ve git'te `v0.x.y` etiketini taşır;
"şu sürümdeki şu özelliği koru" denince bu adlar kullanılır. Her sürüm çıkarılınca bu dosya güncellenir, değişiklikler push'lanır.

## V0.7.0 — Işınlanma pimi (2026-10-17)

- **Yeni kilit: Işınlanma pimi** (Seviye 7'nin sonuna doğru gelir, Kilit defterinde ve **Dene**'de de var). Halkada iki kapı olur: **mavi kapı** ibreyi içeri alır, **turuncu kapı** dışarı verir.
  İbre mavi kapıya girince küçülüp kaybolur; **ne zaman çıkacağı belli olmaz**: 0,15 ile 0,50 saniye arasında (her turda farklı), turuncu kapıdan çıkar. Hedef turuncu kapının ilerisindedir
  (çıkıştan yaklaşık yarım saniye sonra), yani çıktığını görüp vurabilirsin. Kapının içindeyken dokunursan ıska sayılır. İbre kapıdayken süre akmaya devam eder.
  Kullanıcı isteğiyle yapıldı ("ışına girip ne zaman çıkacağı belli olmasın, her an çıkabilir, hızlı çıksın"); önce canlı bir deneme gösterilip onaylandı, çıkış hızı "Hızlı" seçildi.
- ★ güçlenme bu kilide de uygulanabilir: bekleme aralığı 0,12-0,58 sn, sonra 0,10-0,66 sn'ye genişler, hedef çıkışa biraz yaklaşır.
- Kilit defteri artık 15 kilit gösterir. Seviye 7'nin ★ güçlenmesi seviyenin %82'sinden %90'ına kaydı (ışınlanma pimine yer açmak için).
- Botla ölçüldü: ışınlanma pimini zayıf bot bile %74, iyi bot %99 vuruyor (bot çıkışı hiç şaşırmadan görür, insan için daha zor olabilir); bir tur yaklaşık 1,6 sn sürer, bu yüzden süre kazancı ×1,2.
  Diğer kademelerin zorluğu değişmedi (Normal orta bot %38, iyi bot %83; Usta iyi bot %30; Cehennem pro bot %25 bitiriyor).
- **GitHub'da iki ayrı dal:** `android` = Android projesi (oyunun paketlenmiş hali dahil; Android Studio'da `android` klasörünü açarsın), `html` = yalnızca HTML oyunu. İkisi de her sürümde güncellenir, `main`'e birleştirilmez (`main` ilk sürüm olarak kaldı). `tools/publish.sh` ikisini birden gönderir.
- Bekleyen: Işınlanma'nın engel ikizi **Kara kapı** (ibreyi geri atan kapı) yapılmadı; sonsuz mod için Sarkaç, Renk, Sis fikirleri duruyor.

## V0.6.1 — Süreye göre hedef, mod geçişi, sağlam jokerler (2026-10-17)

- **Hedefin uzunluğu süre çubuğunun her saniyesinde farklı.** Süre doluyken (8. saniye) hedefler en dar (×0,8: zor), sonra saniye saniye uzar: 7. sn ×0,87, 6. sn ×0,94, 5. sn ×1,02, 4. sn ×1,12, 3. sn ×1,25, 2. sn ×1,42, 1. sn ×1,62, süre bitmek üzereyken ×1,8 (en kolay).
  Dar kısım ilk üç seviyede yavaş yavaş devreye girer (1. seviyede hedefler hiç daralmaz).
- **Cehennem bölümü yalnızca Usta'da açılıp kapanır.** Rahat ve Normal'de artık hiç cehennem bölümü yok, seviyeler kesintisiz akar (botla ölçüldü: Normal'de orta bot 10. seviyeye %40, iyi bot %77 ulaşıyor; V0.6.0'da %30 ve %80'di, yani zorluk neredeyse aynı kaldı). Usta'da her seviyenin sonunda kısa cehennem eskisi gibi sürer.
  Cehennem kademesinde baştan sona cehennem bölümü vardır ve cehennem gücü artık her seviyede etkindir.
- **Cehennem gerçekten zor.** Baştan sona cehennem bölümü olarak yeniden ayarlandı (hedef ×0,82, ibre ×1,18, süre erimesi ×1,25, hata cezası ×1,5, cehennem gücü ×0,64). Botla ölçüldü (10 seviyeyi bitirme): kusursuza yakın oynayan bot (pro) %25'ini,
  usta bot %5'ini, iyi bot hiçbirini bitiriyor (iyi bot çoğunlukla 5.-6. seviyede kalıyor). Aynı ölçümle V0.6.0'daki Cehennem ayarlarını pro bot %35, usta bot %18 bitiriyordu; yani en iyi oyuncu için de belirgin biçimde zorlaştı.
  Bot insan değildir: insan yeni kuralı ilk görüşte öğrenmek zorundadır ama jokerleri kullanabilir, gerçek oyuncuda sayılar farklı çıkabilir. Çok zor gelirse bir tık kolaylaştırılır.
- **Dikende nefes oyun ilerledikçe büyüyor.** Diken ikizinde hedefin kapanan payı seviyeyle artar: 3. seviyede yaklaşık %24, 7. seviyede %35, 10. seviyede %50 (★'lı kilitte ve cehennemde en çok %62); yani ortadaki açıklık gitgide daralır.
- **Jokerler tek dokunuşla çalışıyor.** Basılı tutmak kalktı. Kullanınca sayı hemen azalır, düğme zıplar. Joker istediğin an kullanılabilir (yandığında değil); parlaması yalnızca "şimdi işe yarar" ipucudur.
  Sıra ekranın en altında ve düğmeler büyüdü (60 px, parlayan 76 px); halka ile jokerler arasında en az parmak boyu (yaklaşık 1,5 cm) boş alan kalır, oyun dokunuşları oraya gider ve jokerlere değmez.
- **Mod değiştirince yarım kalan oyun silinir, uyarılırsın.** Yarım kalan oyun varken başka bir kademe (Rahat, Normal, Usta, Cehennem) seçersen "Yarım kalan oyun silinsin mi?" penceresi çıkar: bu oyun ve henüz alınmamış coinin kaybolacağı yazar, "Sil ve geç" ya da "Vazgeç".
  "Devam et" artık kademeyi de gösterir ("Normal · Seviye 5 · 4.200 puan"); yarım kalan oyun kendi kademesinde sürer, yanlış moda karışmaz. Eski kayıtta kademe yoksa şimdi seçili olan kademeye bağlanır.
- Küçük: Cehennem'de "Cehennem" haberi yalnızca bir kez, oyun başında çıkar; HUD'daki cehennem geri sayım rozeti yalnızca Usta'da; botta "pro" becerisi eklendi (`tools/bot.js`).
- Bekleyen: **Işınlanma pimi** (ibre kapıya girer, rastgele bir an sonra çıkar). Önce görsel tasarım gösterilip onaylanacak, sonra yapılacak.

## V0.6.0 — Dene ve Cehennem zorluğu (2026-10-17)

- **Kilit defteri baştan yazıldı.** Artık 14 kilidin hepsi görünür: açtıkların tam açıklamalarıyla, açmadıkların adı ve açılacağı seviyeyle (sıradaki kesikli çerçeveli "Sıradaki · Seviye 4"). Başlıkta "3 / 14 açıldı" yazar.
- **Dene.** Defterde her satırda **Dene** düğmesi var, açılmamış kilitlerde de. Dokununca o kilidin kısa canlı denemesi başlar: yavaş ibre, geniş hedef, süre ve ceza yok, puan ve kayıt yok.
  Engelinden de çıkar (ikinci turdan sonra). Ceza nesnesine dokunmadan 3 turu bitirirsen "Öğrendin" yazar (sabır pimi 1 tur). Üstte "Dene" rozeti, üç nokta ve "Bitir"; kural kartı hep açık kalır;
  ortada doğru turlar sayılır. Uygulamadan çıkarsan ya da geri tuşuna basarsan deneme kapanır, deftere dönersin. Denerken oyun kaydın ve rekorların değişmez.
- **Dördüncü zorluk: Cehennem.** Rahat, Normal, Usta, **Cehennem**. Baştan sona cehennem teması (kırmızı-siyah, kor ve çatlaklar); hedefler %28 dar, ibre %22 hızlı, süre %35 çabuk erir (taslakta %50'ydi, çok sert çıktı), hata cezası %80 ağır,
  engel ikizleri kilitle birlikte açılır ve çok sık gelir, coin ×2. Ayrı rekoru ve kırmızı rozeti var (oyun içinde seviye rozeti kırmızı, sonuç ekranında "Cehennem · Seviye N"). Menüde seçince altında tek satırlık açıklaması çıkar
  (küçük ekranda gizlenir). Usta modunda iki uzun oyundan sonra "Usta kolay mı? Cehennem modu" önerisi çıkar; Cehennem'de üç kısa oyundan sonra Usta önerisi.
  Botla ölçüldü: en iyi oyuncunun (usta bot) %37'si 10. seviyeyi bitiriyor, iyi oyuncunun %0'ı.
- **Trafik ışığı:** ışık değişim aralığı biraz rastgele (±%22); eskiden belli hız ve aralıkta ibre hep kırmızıya denk gelip tur uzayabiliyordu.
- Dört kademe 320 piksel genişlikte de sığar; yeni defter satırları dar ekranda sıkılaşır.
- Bekleyen: kalan kilit fikirleri (Sarkaç, Renk, Sis...) sonsuz mod için, mağaza hazırlığı (kullanıcı hesabı açınca).

## V0.5.1 — Cehennem zorlaştı, düzeltmeler (2026-10-17)

- **Cehennem artık gerçekten zor.** Eskiden en güçlü cehennem bile normal bölümden yalnızca %4 farklıydı. Şimdi cehennem bölümünde ibre %13'e kadar hızlı, hedefler %18'e kadar dar,
  süre %18'e kadar çabuk erir, hata cezası %40'a kadar ağır ve engel ikizleri daha sık gelir. Cehennemin adı seviyeyle büyür: seviye 1-3 **Kolay cehennem**, 4-6 **Orta cehennem**,
  7-9 **Zor cehennem**, 10 ve sonrası **Cehennem**. Güç ilk seviyelerde yumuşak başlar (yeni oyuncu ilk cehennemde boğulmasın), 4-5. seviyede en yüksek olur, sonra normal bölüm zaten çok yoğun olduğu için biraz iner.
  Botla ölçüldü: yeni başlayan bir oyuncunun 3.-6. seviyelerdeki cehennemi geçme şansı yaklaşık %95'ten %85-45 arasına indi; sıradan oyuncuda 6.-8. seviyelerde %80-90, 9. ve 10. seviyede %63 ve %38.
- **Süre azalınca hedef uzar.** İlk sürümlerdeki denge geri geldi: süre çubuğu doluyken hedefler biraz dar, süre azaldıkça (tam yanacakken) %30'a kadar uzar; yani kıl payı kurtulma şansın var.
  İlk üç seviyede dar kısım yavaş yavaş devreye girer.
- **Diken ibreye uyuyor.** İbre hızlandıkça diken de hızlı girip hızlı çıkıyor ve ibre hedefe girerken dikenler kapanmış oluyor (hedefin ortası yine hep açık). Artık dikenden önce vuruvermek yok.
- **Altın yarım kalmıyor.** Altın hedef hep ana hedeften önce gelir; ana hedefi vurunca altın ortadan kalkamaz.
- **Bölüm geçişi düzeldi.** Bölüm ya da cehennem başlayınca ibre hedefe varmak üzereyken hedef artık ortadan kaybolmuyor (yeni bölüm bir sonraki turdan başlar). Tema geçişi daha az güncelleme yapıyor (telefonda takılma azalır).
- **Yazılar halkadan çıktı.** "Seviye N" ve "Cehennem" haberi halkanın üstünde, kart yerinde çıkıyor (yeni kilit kartı varken HUD rozeti yetiyor). İki halkada puan balonları halkaların dışında. Joker etiketi halkaya binmiyor.
- **Jokerler yanlışlıkla harcanmıyor.** Jokeri kullanmak için basılı tutulur (parlayan 0,3 sn, diğerleri 0,5 sn; halka dolar). Kısa dokunuş her zaman oyuna gider; ibre bir hedefin üstündeyken joker sırasına dokunsan da vuruş gecikmez.
  Tut-bırak pininde parmağın joker sırasındayken de basış ve bırakış çalışır.
- Bekleyen tasarımlar (onay istendi): kilit defterinde açılmamış kilitleri de gösterme ve kilit başına kısa canlı deneme ("Dene"); dört kademeli zorluk (Rahat, Normal, Usta, Cehennem).

## V0.5.0 — Yeni kilitler ve gerçek zorluk (2026-10-17)

- **Her seviye artık yeni bir oyun:** Seviye 4-10'da her seviyenin başında yeni bir kilit, ortasında onun engeli gelir; yeni bir şey yaklaşık 13 saniyede bir görülür.
  Seviye 4: **Altın pim** (ince altın hedef, ×3 puan) ✚ **Lanetli altın** (aynı şekil ama soluk, zehir yeşili çerçeveli, kafatası işaretli: dokunma) ve **Sabır pimi**
  (kilitli pim; ibre üç kez geçince açılır, beklerken yan hedeflere vurursun). Seviye 5: **Kasa turu** ✚ **Alarm turu**, **Çürük kilit**.
  Seviye 6: **Ritim pim** ✚ **Sahte nota**, **Trafik ışığı** (yeşil hedefe vur, kırmızıya dokunma; ışıklar yer değiştirir). Seviye 7: **İki halka** ✚ **Kilitli halka**
  (kilitli iç halka donar, dış ibre hızlanır, geri sayım görünür). Seviye 8: **Hayalet pim** ✚ **Hayalet tuzak** (hedef ve tuzak gerçekten kaybolur, hafızadan vurursun),
  **Bomba pim** (fitil yanar; vurmazsan patlar). Seviye 9: **Gelgit ibre** ✚ **Girdap**. Seviye 10: **Tut-bırak pim** ✚ **Sıcak yay** (bas, tut, sonda bırak).
- **Seviyeler uzadı:** normal bölüm 20-32 sn; 10. seviyenin sonuna kadar yaklaşık 5 buçuk dakika.
- **Zorluk yeniden ayarlandı:** bonuslar kısıldı (vuruş +1,1 → +0,95 sn, mükemmel vuruş bonusu yarıya, cehennem sonu +4 → +2 sn, joker hediyesi her 3 seviyede),
  ıska ve tuzak biraz daha pahalı. Botla ölçüldü: Normal'de yeni başlayanın %4'ü, sıradan oyuncunun %32'si, iyi oyuncunun %86'sı 10. seviyeye varıyor; Usta modunda
  iyi oyuncunun %33'ü. (Bunlar bot sonucu; gerçek oyuncu geri bildirimine göre ayarlanacak.)
- **Diken:** hızlı girer (0,3 sn), bekler (0,8 sn), yavaş çıkar (1,5 sn); kenar daha uzun süre dikenli kalır, hedefin ortası yine her zaman açık.
- **Yeni kilit kartı büyüdü ve düzeldi:** büyük yazı, hareketli mini simge, şeftali nokta (ne yapacağın) ve gül nokta (nelere dokunmayacağın). Yeni kilidin ilk hedefi
  çözülene kadar ekranda kalır. Halkanın üstündeki yazı etiketleri kalktı (görüşü kapatıyordu); yerine hedefin dışında küçük ✓ (vur) ve ✕ (dokunma) işaretleri geldi.
- **Kilit defteri** 14 kilidi gösterir (simge, kural, uyarı).
- **Küçük düzeltmeler:** joker etiketi ekranın dışına taşmıyor; duraklatma basılı tutulan tut-bırak pinini bırakır; İngilizce kart yazıları kısaltıldı (küçük ekranda sığıyor);
  kamptan başlayınca o seviyenin yeni kilidi kartıyla gelir (önceden sessizce açılıyordu). Seviye süreleri değiştiği için V0.4.1'den kalan yarım oyun "Devam et" ile sürdürülmez; kamp kayıtların aynen duruyor.
- Bilinen eksikler: Sarkaç, Sis, Renk, Aynalı pim gibi kalan fikirler (`docs/kilit-katalogu.md`) sonsuz mod ve sonraki sürümler için bekliyor. Gerçek telefonda denenmedi
  (emülatör, tarayıcı ve botla sınandı). Mağaza hazırlığı (ikon, imzalı paket, gizlilik sayfası, gerçek reklam kimliği, paket adı) kullanıcı hesabı açınca yapılacak.

## V0.4.1 — Rahat oynanan yolculuk (2026-10-17)

- **Tempo:** cennet bölümü kalktı. Seviyeler kısaldı (normal 20-28 sn, cehennem 6-10 sn), zorluk 3 kat daha yavaş artıyor, "Normal" daha kolay;
  hedef: sıradan bir oyuncu yaklaşık 5 dakikada 10. seviyeye varabilsin. Seviye bitince +4 sn, coin, her 2 seviyede bir joker hediyesi.
  "Usta" eski V0.4.0 sertliğine yakın.
- **Jokerler artık kullanışlı:** halkanın hemen altında, başparmağın bulunduğu yerde. İşe yarayacağı an ilgili joker parlayıp büyür ve ne işe
  yarayacağını yazar; dokununca çalışır, doğru zamanda kullanırsan +25 puan ("Akıllı hamle!"). Parlamayan joker basılı tutulunca çalışır.
  Yeni oyuncu her jokerden 2 ile başlar. Joker kullanmadan biten oyunda sonda küçük bir hatırlatma çıkar.
- **Can:** en fazla 1 tane toplanan yeşil "+" hedefi; süre çubuğunun yanında yeşil "+ Can" rozeti ve yeşil çerçeve. Süre bitince kendiliğinden
  +3 sn verip oyunu sürdürür. (Kalp simgesi kullanılmadı.)
- **Kaldığın yerden devam:** uygulamadan çıksan ya da uygulama kapansa bile oyun kaydedilir; menüde "Devam et" çıkar, 3-2-1 sayıp devam eder.
  "Yeni oyun" kayıt varken önce sorar.
- **Ekran:** yalnızca "Seviye N" yazar (toplam yok), altında ince ilerleme çizgisi. Yeni kilit için üst kart (simge, ad, kural, uyarı) ve ilk üç
  karşılaşmada hedefin yanında kısa etiket ("Açıkken vur", "Dikene dokunma"). Yeni kilidin ilk hedefi kart çıktıktan 2 sn sonra, ibreden uzak doğar.
- **Menü:** güzelleşti; "Oyun" sayacı kalktı; **Kilit defteri** eklendi (gördüğün kilitlerin açıklamaları); büyük Devam et / Oyna düğmesi.
- **Düzeltmeler:** Seviye 3'teki diken artık kenardan kapanır, hedefin ortası her zaman açıktır (pas geçmek zorunda kalmazsın); kayan tuzak hedeften
  dar ve hedefin açıkta kalan parçası her zaman vurulabilir; duraklatma ekranına "Menü" düğmesi eklendi.
- **Tasarım kuralları (sonraki sürümler için):** sis, renk ve sıcak yay kilitlerindeki mantık hataları (görmeden atış, hedefe girmeden değişen renk,
  sıcak yayın ilk karşılaşmada anlaşılmaması) tasarımda düzeltildi; bu kilitler henüz oyunda olmadığı için kodu yok. Ritim, Sarkaç ve Sis sonsuz moda taşındı.
- Bilinen eksikler: Seviye 4 ve sonrasının yeni kilitleri (Kasa, Altın, Hayalet, Gelgit, Renk, Tut-bırak) henüz yok; o seviyelerde yalnızca ★ güçlenme
  ve bilinen kilitlerin karışımı çıkar. İkon, imzalı paket, gizlilik sayfası ve gerçek reklam kimliği ayrı bir sürümde yapılacak.

## V0.4.0 — Yolculuk (2026-10-16)

- 10 seviyelik yolculuk: ilerledikçe yeni kilitler açılır. Seviye 1-3: çift pim ✚ tuzak pim, kayan pim ✚ kayan tuzak, nefes pim ✚ diken.
  Seri çarpanı, ★ güçlenme, karışım olayları ve nefes bonusu (tam açıkken +1).
- Her seviyede cennet (süre donar, ıska cezasız, puan ×2) ve cehennem (süre hızlı erir, ceza ağır, hedefler dar) bölümü.
  Cehennemin gücü seviyeyle artar.
- Tema yumuşak geçişle altın-krem (cennet) ve kızıl-siyaha (cehennem) döner; bulut, kıvılcım, kor ve çatlak efektleri.
- Ekranda "Seviye N/10", 10 noktalı yol, bölüm rozeti ve bölüm başlığı.
- Kamp: seviye bitince kayıt noktası, menüde "Kamp · Seviye N". Kamp oyunları puan rekorunu etkilemez, en iyi seviye ayrı tutulur.
- Duraklatma her şeyi dondurur; "Devam et"ten sonra 3-2-1 sayılır.
- Menüde en iyi seviye. En fazla iki puan balonu, HUD'un altında.
- Düzeltme: tuzak, çift pimin ikinci hedefinin üstüne düşmüyor.
- Bilinen sorunlar (V0.4.1'de ele alınacak): jokerler oyun sırasında zor kullanılıyor, uygulamadan çıkınca oyun kaldığı yerden devam etmiyor,
  yeni kilit yazıları zor okunuyor, 3. seviyedeki diken hedefi tamamen kapatıp pas geçirtebiliyor, süreler uzun.

## V0.3.0 — Seri, övgü ve zorluk seviyeleri (2026-10-16)

- Seri çarpanı: 5, 10, 20 ve 35 ardışık vuruşta puan ×2..×5; ıska seriyi bozar, kalkan korur.
- Övgü ve laf satırları: seri kilometre taşlarında "Wow!" tarzı övgü, ıskada hafif laf ("Senin yapacağın iş değil"), oyun sonunda duruma göre başlık.
- Zorluk seviyeleri: Rahat, Normal, Usta; her birinin rekoru ayrı. Üç kısa oyundan sonra Rahat, iki uzun oyundan sonra Usta önerisi.
- İki halka: dokunuş ekranın neresinde olursa olsun hedefteki ibreyi vurur; iç halka lila, dış halka şeftali.
- Puan tepesindeki hap ve yazılar ortalandı.
- (Telefonda uygulama bilgisinde "0.2.0" görünür; adlandırma sonradan değişti.)

## V0.2.0 — Kilit türleri ve alet çantası (2026-10-15)

- Oyun ilerledikçe açılan kilit türleri: çift pim, kayan pim, tuzak pim, iki halka.
- Alet çantası: stetoskop (hedefi genişletir), kronometre (+süre), kalkan (ıskayı bağışlar), kum saati (ibreyi yavaşlatır).
  Coin ile alınır ve yükseltilir; ödüllü reklam +20 coin verir.
- Küçük ekranlarda halka, ipucu satırları ve alet çubuğu birbirine çarpmıyor.

## V0.1.0 — İlk Android sürümü (2026-10-15)

- Kadranda dönen ibre, şeftali hedef bölge, eriyen süre çubuğu; süre bitmek üzereyken (son 1 sn) vuruş ×3.
- Dalgalı zorluk (10 vuruşluk dalga, "Nefes al" aralığı); ölünce "İkinci şans" (reklam izle ya da 25 coin ile +4 sn).
- Android paketi (Capacitor), çevrimdışı yazı tipleri, Google test reklamı, titreşim, açık ve koyu tema, Türkçe ve İngilizce.
- (Önceki web prototipi: "Kıl payı: ilk oynanabilir sürüm", yalnızca tarayıcı.)
