# Sürüm notları

Sürüm adları `V0.x.y` biçimindedir. Her sürümün APK'sı `kil-payi-v0.x.y.apk` adıyla verilir ve git'te `v0.x.y` etiketini taşır;
"şu sürümdeki şu özelliği koru" denince bu adlar kullanılır. Her sürüm çıkarılınca bu dosya güncellenir, değişiklikler push'lanır.

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
