# Sürüm notları

Sürüm adları `V0.x.y` biçimindedir. Her sürümün APK'sı `kil-payi-v0.x.y.apk` adıyla verilir ve git'te `v0.x.y` etiketini taşır;
"şu sürümdeki şu özelliği koru" denince bu adlar kullanılır. Her sürüm çıkarılınca bu dosya güncellenir, değişiklikler push'lanır.

## V0.4.1 (hazırlanıyor)

Tasarımı kullanıcıyla netleştiriliyor; onaylanınca kodlanacak. Kapsam:

- Cennet bölümü kalkıyor (ödülleri cehennemin sonuna taşınıyor).
- Jokerler oyun sırasında rahat kullanılacak: başparmağa yakın yer, durumu gösteren parlama, seviye hediyesi.
- Uygulamadan çıkınca (kapansa bile) oyun kaldığı yerden devam edecek; menüde "Devam et".
- Ekranda "Seviye 3" yazacak (toplam seviye sayısı gösterilmeyecek); yeni kilit yazıları okunur olacak.
- Seviye 3'teki diken engeli adil olacak (hedefi tamamen kapatıp pas geçirmeyecek); sis, renk ve sıcak yay mantık hataları düzelecek.
- Seviyeler kısalacak, zorluk daha yavaş artacak; hedef: orta düzey bir oyuncu yaklaşık 5 dakikada 10. seviyeye varabilsin.
- En fazla 1 tane toplanabilen "can" (kalp).
- Menü güzelleşecek; "Oyun" sayacı kalkacak.

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
