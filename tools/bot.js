/* Yolculuk botu: gerçek oyun kodunu (update, tap, release, spawnChallenge...) hızlandırılmış zamanla oynatır.
   Kullanım:
     1. DEBUG=1 ./build.sh   (window.__kp test kancası eklenir)
     2. www/ klasörünü bir yerel sunucuyla aç (ör. python3 -m http.server 8780 --directory www)
     3. Tarayıcı konsoluna bu dosyanın içeriğini yapıştır (ya da sayfaya <script src="bot.js"> ekle), sonra:  bulk(['normal'], 40)
   Bot: her hedef için zamanlama hatası ~ N(0, sigmaT) saniye örnekler; ibre nişan noktasına ona göre varınca dokunur.
   Nişan noktası (2026-11-17, kullanıcı: "hedefin herhangi bir yerine vursan kabul, engel varsa kenarına vurabilir"): yakında engel yoksa hedefin ortası
   (zamanlama hatası simetrik olduğu için en iyisi); tuzak ya da değirmen kanadı hedefe yakınsa hedefin içinde beklenen kaybı (ıska 1, tuzak 2 can) en aza indiren nokta
   (engellerin dokunuş anındaki yeri hızlarından kestirilir).
   Gelgit hızlanmasını (etaTo), kilitli halkayı, tut-bırak (bas ve bırak), trafik ışığı, bomba, sabır pimi ve hayalet pimi bilir.
   Işınlanma pininde ibre tünelde ya da önce kapıya varacaksa bekler; çıkışı gördükten sonra hedefe dokunur (süre tahminine ek 0,02 sn gürültü: çıkış anı bir uyarandır).
   Tuzakların (kayan tuzak, diken, lanetli altın, alarm, sahte nota, hayalet tuzak) üstündeyse trapAvoid olasılığıyla dokunmaz.
   Altına yalnızca beceriye bağlı bir olasılıkla uzanır (ince hedef riskli).
   Beceri düzeyleri: yeni 0,12 sn, orta 0,08 sn, iyi 0,05 sn, usta 0,03 sn, pro 0,02 sn (standart sapma; pro = "refleksi çok iyi"). Her oyunda sapma log-normal sallanır
   (insanın günlük formu) ve her dokunuşta küçük bir dikkat kaybı olasılığı vardır (sapma 3 katına çıkar).
   Sonuç: ölüm anındaki yolculuk süresi (medyan, sn), medyan seviye, koşu başına kazanılan coin (ortalama ve medyan), "L>=k" oranları ve ölüm anındaki kilit türü dağılımı.
   Başsız Chrome ile hızlı toplu ölçüm: DEBUG=1 derlemesinde www/ içine bot.js'i koyup sayfanın sonuna kendi iş betiğini ekleyen bir sayfa hazırla, sonra
   "Google Chrome" --headless=new --dump-dom <adres> ile çalıştır (yüzlerce oyun birkaç saniye sürer; tarayıcı panelindeki araç süresine takılmaz). */
(() => {
  const k = window.__kp, G = k.G;
  const TAU = Math.PI * 2, nrm = a => ((a % TAU) + TAU) % TAU, ad = (a, b) => { const d = nrm(a - b); return d > Math.PI ? TAU - d : d; };
  const gauss = s => { let u = 0; while (!u) u = Math.random(); return s * Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * Math.random()); };
  const sgn = (a, dir) => { let x = nrm(a * dir); if (x > Math.PI) x -= TAU; return x; };
  /* ibrenin c açısına varma süresi (sn); işaretli: geçtiyse negatif. Gelgit ve girdap hızlanmaları hesaba katılır. */
  const base0 = ring => (ring ? G.omega2 : G.omega) * (G.slow > 0 ? G.slowMul : 1) * (ring ? 1 : k.ptrFactor());
  const eta = (c, ring) => {
    const a = ring ? G.ang2 : G.ang, dir = ring ? G.dir2 : G.dir;
    const base = (ring ? G.omega2 : G.omega) * (G.slow > 0 ? G.slowMul : 1);
    const ahead = sgn(c - a, dir);
    if (ahead > 0) return k.etaTo(c, dir, ring ? 1 : 0);   /* V0.9.12: ibre hızı yumuşar (gecikme); etaTo bunu bilir */
    return ahead / (base * (ring ? 1 : k.ptrFactor()));
  };
  /* nişan noktası: hedef merkezine göre açı farkı (rad). s = dokunuştaki açısal sapma (zamanlama sapması × ibre hızı).
     Gerçek çizgi engel ve hedef sınırlarıyla parçalara bölünür; her parçanın olasılığı × sonucu (öncelikli tuzak > hedef > tuzak > ıska) toplanır. */
  const erf = x => { const t = 1 / (1 + 0.3275911 * Math.abs(x)), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; };
  const Phi = x => 0.5 * (1 + erf(x / Math.SQRT2));
  const aimOff = (c, gh, s, horizon, vg) => {
    const tr = [], hz = Math.max(0, Math.min(0.6, horizon));
    for (const q of G.pins) {
      if (q.kind !== 'trap' || q.done) continue;
      const th = k.pinHw(q); if (!(th > 0)) continue;
      const pc = k.pinCenter(q) + ((q._v || 0) - (vg || 0)) * hz;   /* dokunuş anında hedefe göre yeri: ikisinin şimdiki hızıyla */
      const rel = ((pc - c + Math.PI + 4 * TAU) % TAU) - Math.PI;
      if (Math.abs(rel) > gh + th + 4 * s) continue;
      tr.push([rel - th, rel + th, !!q.prio, Math.abs((q._v || 0) - (vg || 0)) > 0.05]);
    }
    if (!tr.length) return 0;
    const cut = [-gh, gh]; tr.forEach(t => cut.push(t[0], t[1]));
    const cost = m => { if (tr.some(t => t[2] && m >= t[0] && m <= t[1])) return 2; if (m >= -gh && m <= gh) return 0; return tr.some(t => m >= t[0] && m <= t[1]) ? 2 : 1; };
    const exp = x => {
      const xs = cut.map(v => v - x).sort((a, b) => a - b); let e = 0, prev = -Infinity;
      for (const b of xs.concat([Infinity])) { const pm = Phi(b / s) - (prev === -Infinity ? 0 : Phi(prev / s)); if (pm > 1e-9) e += pm * cost(x + (prev === -Infinity ? b - 1 : b === Infinity ? prev + 1 : (prev + b) / 2)); prev = b; }
      return e;
    };
    /* kenara yalnız açık kazanç varsa kayılır (kayan ya da nefes alan hedefin kenarı dokunuşa kadar oynar): en çok genişliğin %70'i, kazanç en az 0,03 can */
    const e0 = exp(0); let best = 0, be = e0;
    for (let i = 0; i <= 20; i++) { const x = (-0.7 + 1.4 * i / 20) * gh, e = exp(x); if (e < be - 1e-6) { be = e; best = x; } }
    if (be > e0 - 0.03) { best = 0; be = e0; }
    /* hareketli engel (değirmen kanadı, kayan tuzak) hedefi kapatıyorsa insan bir sonraki turu bekler: engelin eklediği risk 0,15 canı aşarsa bu tur basılmaz */
    const clean = 2 * Phi(-gh / s);
    aimOff.last = { add: Math.max(0, be - clean), mov: tr.some(t => t[3]) };   /* ölçüm (tools/bl-fair.mjs): engelin bu vuruşa eklediği risk */
    if (be >= 1.999 || (be - clean > 0.15 && tr.some(t => t[3]))) return NaN;
    return best;
  };
  /* tür başına istatistik: tur sayısı, toplam süre, dokunuş, vuruş (zorluk dengesi için) */
  window.__stats = {}; window.__hell = {}; window.__chalLog = [];  /* window.__logChal = true ise her turun başındaki süre ve hedef yarı genişliği (rad) burada toplanır */
  const hstat = L => window.__hell[L] || (window.__hell[L] = { enter: 0, pass: 0 });
  const stat = kd => window.__stats[kd] || (window.__stats[kd] = { ch: 0, dur: 0, taps: 0, hits: 0, pen: 0 });
  window.runBot = (sigmaT, trapAvoid, startL = 1, tmax = 1500, dt = 1 / 60, opt = {}) => {
    k.start(startL); if (opt.setup) opt.setup();
    let t = 0, taps = 0, miss = 0, curChal = null, prevPh = G.ph, prevL = G.L;
    sigmaT = sigmaT * Math.exp(gauss(opt.jitter == null ? 0.25 : opt.jitter));
    const lapse = opt.lapse == null ? 0.01 + sigmaT * 0.15 : opt.lapse, aimE = () => gauss(sigmaT * (Math.random() < lapse ? 3 : 1)) + (G.kind === 'isin' ? gauss(opt.isinExtra == null ? 0.02 : opt.isinExtra) : 0);
    const lead = opt.lead || 0;  /* sn: kaba adımda (dt) vuruşun hep geç kalmasını dengeler (laboratuvarın İdealist oyuncusu) */
    const goldP = Math.max(0.15, Math.min(0.85, 0.95 - sigmaT * 6.5)), lightMis = sigmaT * 1.2;
    /* İNSAN KATMANI (kzm-hf.js, V1.0.28): mekaniğin kendi belirsizliği (kayma fazı, hayalet hafızası, şipşak ölçekli zamanlaması, nabız, gelgit, değirmen, ritim...) vuruş zamanına
       ek gürültü olarak biner; ters dönmede dur-sinyalini kaçırma olasılığı pfAmb. Betikli bölümde dalganın özelliklerinden (BL_SC) hesaplanır; eski bölümlerde etkisiz. opt.hf === false kapatır. */
    const HFON = opt.hf !== false && !!window.KZM_HF && !!k.blOv;
    const waveSpec = () => { if (!HFON || !G.bl) return null; const o = k.blOv(G.bl.n); return o && o.sc ? o.w[Math.min(G.bl.wave, o.w.length - 1)] : null; };
    const hfx = p => {
      const w = waveSpec(); if (!w) return 0;
      let idx = 0;
      if (p.kasa) { const d0 = sgn(p.c0 - G.ang, G.dir); for (const q of G.pins) if (q.kasa && q !== p && sgn(q.c0 - G.ang, G.dir) < d0) idx++; }
      return window.KZM_HF.sigmaX(w, idx, G.bl.hp) / 1000;
    };
    const seed = p => { if (p._aim === undefined) { const x = hfx(p); p._aim = aimE() + (x ? gauss(x) : 0); p._aim2 = aimE() * 1.2 + (x ? gauss(x) : 0); p._armed = false; p._sx = x; } };
    const reseed = p => { p._aim = aimE() + (p._sx ? gauss(p._sx) : 0); };
    let lastDir = G.dir;
    while (G.mode === 'play' && t < tmax) {
      k.update(dt); t += dt;
      for (const q of G.pins) if (q.kind === 'trap' || q.kind === 'gate') { const pc = k.pinCenter(q); if (q._pc != null) { let d = pc - q._pc; d = ((d + Math.PI + 4 * TAU) % TAU) - Math.PI; q._v = Math.abs(d) < 0.5 ? d / dt : 0; } q._pc = pc; }
      if (opt.stop && opt.stop()) break;
      if (G.dir !== lastDir) {   /* ters dönme: hazırlanmış vuruşlar için dur-sinyali yarışı */
        lastDir = G.dir;
        const lf = G.bl && G.bl.lastFlip;
        if (HFON && lf && G.clock - lf.t < 0.2) for (const p of G.pins) if (p.kind === 'gate' && !p.done && p._armed && p._ePrev != null && p._ePrev > -0.05 && p._ePrev < 1.2 && Math.random() < window.KZM_HF.pfAmb(lf.tell, Math.max(0, p._ePrev))) p._blind = t + Math.max(0, p._ePrev + (p._aim || 0));
      }
      { let bl = null; for (const p of G.pins) if (p._blind != null && t >= p._blind) { bl = p; break; } if (bl) { bl._blind = null; bl._armed = false; reseed(bl); k.tap(); taps++; miss++; continue; } }
      if (G.ph !== prevPh || G.L !== prevL) {
        if (G.ph === 'hell') hstat(G.L).enter++;
        else if (prevPh === 'hell') hstat(prevL).pass++;
        prevPh = G.ph; prevL = G.L;
      }
      if (G.chal !== curChal) {
        if (curChal) { const sx = stat(curChal.kind); sx.ch++; sx.dur += curChal.t; }
        curChal = G.chal;
        if (window.__logChal) window.__chalLog.push({ L: G.L, ph: G.ph, time: G.time, hw: G.hw, om: G.omega, kind: G.kind });
      }
      if (G.mode !== 'play') break;
      /* tut-bırak: basılıyken bırakma anını bekle */
      if (G.holding) {
        const hp = G.pins.find(p => p.kind === 'hold' && p.st === 'hold');
        if (hp) {
          seed(hp);
          const rel = k.holdRel(hp), om = G.omega * (G.slow > 0 ? G.slowMul : 1) * k.ptrFactor();
          if ((hp.len - rel) / om <= -hp._aim2 + lead) { k.release(); hp._aim = aimE(); hp._aim2 = aimE() * 1.2; hp._armed = false; }
        }
        continue;
      }
      /* hedef seç: en erken varılacak, vurulabilir hedef */
      let best = null, bestEta = 9e9, bestOff = 0;
      for (const p of G.pins) {
        if (p.done) continue;
        let c, gh;
        if (p.kind === 'gate') {
          if (p.locked || (p.slT != null && p.slt < 0.3)) continue;
          if (p.gold) { if (p.wait || p.gone) continue; if (p._try === undefined) p._try = Math.random() < goldP; if (!p._try) continue; }
          if (p.blLife) { if (p.gone) continue; if (p._try === undefined) p._try = Math.random() < 0.9; if (!p._try) continue; }   /* can pimi: insan neredeyse hep dener */
          c = k.pinCenter(p); gh = k.pinHw(p);
        } else if (p.kind === 'lockpin') { if (!p.open) continue; c = p.c0; gh = p.hw; }
        else if (p.kind === 'hold') { c = p.c0; gh = p.hw; }
        else continue;
        /* ışınlanma pini: ibre tünelde ya da önce kapıya varacaksa hedefi bekle (çıkışı görünce hedefe giden yol serbest) */
        if ((G.kind === 'isin' || G.pins.some(q => q.kind === 'portal')) && p.kind === 'gate') {   /* yeni parkurda kapılar başka türlerle birlikte gelir */
          if (G.tun) continue;
          const pin = G.pins.find(q => q.kind === 'portal' && q.portal === 'in'), at = sgn(c - G.ang, G.dir);
          if (at > 0 && pin && nrm((pin.c0 - G.ang) * G.dir) < at) continue;
        }
        if (p.ani && !p.ani.on) continue;   /* Ani: çakmadan görünmez, bot da göremez */
        seed(p);
        const ring = p.ring && !(G.bl && G.bl.br) ? 1 : 0;   /* İki halka (şerit): tek ibre, iç halkadaki hedef de aynı ibreyle */
        const a = ring ? G.ang2 : G.ang, dir = ring ? G.dir2 : G.dir;
        /* nişan: engel yoksa orta, varsa hedefin en güvenli noktası (hedefin her yeri sayılır) */
        let off = 0;
        /* nişan noktası ibre yaklaşınca (0,3 sn kala) kilitlenir: insan son anda hedefin bir kenarından ötekine atlamaz (atlarsa geçilmiş noktaya hemen basardı) */
        if (p.kind === 'gate') {
          const om = Math.abs((ring ? G.omega2 : G.omega) * (ring ? 1 : k.ptrFactor()) * (G.slow > 0 ? G.slowMul : 1)) || 1, hz = eta(c, ring);
          if (p._off != null && hz < 0.3) off = p._off; else { off = aimOff(c, gh, Math.max(0.004, sigmaT * om), hz, p._v); p._off = hz < 0.3 ? off : null; if (window.__fair && !p._dc && hz < 0.6 && hz > 0.35) { p._dc = 1; let cov = 0; const c0 = k.pinCenter(p); for (const q of G.pins) { if (q.kind !== 'trap' || q.done) continue; const th = k.pinHw(q), d = Math.abs(((k.pinCenter(q) - c0 + Math.PI + 4 * TAU) % TAU) - Math.PI); cov = Math.max(cov, Math.max(0, Math.min(gh, th + gh - d) * 2 / (2 * gh))); } window.__dec = window.__dec || []; window.__dec.push(cov); }   /* karar anı (varışa 0,6-0,35 sn): engel hedefin ne kadarını kapatıyor */
          if (hz < 0.3 && !p._lg && window.__fair) { p._lg = 1; const L = aimOff.last || { add: 0 }; window.__fair.push([isNaN(off) ? 1 : 0, L.add || 0, L.mov ? 1 : 0, G.bl ? G.bl.wave / G.bl.waves : 0]); aimOff.last = null; } }
        }
        if (Number.isNaN(off)) continue;
        const ahead = sgn(c + off - a, dir);
        let e = eta(c + off, ring);
        /* hedefi geçmiş: kalan süre "geçeli ne kadar oldu" olarak gerçek saatten (hız değişse de doğru: nabız, gelgit, ters dönme) */
        if (ahead <= 0) { if (p._tc == null) { const vv = Math.abs(ring ? G.vel2 : G.vel), sp = vv === vv && vv > 0 ? vv : Math.abs(base0(ring)); p._tc = G.clock + ahead / Math.max(0.4, sp); } e = -(G.clock - p._tc); } else p._tc = null;
        if (G.bl && (G.bl.tags.includes('yon') || G.bl.tags.includes('kyon') || G.bl.lastFlip) && ahead < -(gh + 0.08)) { p._armed = false; reseed(p); continue; }   /* Yön değiştir: ters dönünce arkada kalan hedef "yeni geçti" sanılmasın */
        p._ePrev = e;
        if (ahead > 0.15) p._armed = true;
        if (!p._armed) continue;
        if (e < bestEta) { best = p; bestEta = e; bestOff = off; }
      }
      if (!best) continue;
      if (bestEta > -best._aim + lead) continue;
      const ring = best.ring ? 1 : 0, a = ring ? G.ang2 : G.ang;
      const gc = best.kind === 'hold' ? best.c0 : k.pinCenter(best), gh = best.kind === 'hold' ? best.hw : k.pinHw(best);
      const inGate = ad(a, gc) <= gh + 0.05;
      /* trafik ışığı: kırmızıya vurma (yeni oyuncular ara sıra yanılır) */
      if (best.light && (!best.green || (G.bl && G.chal.light && G.chal.light.warn)) && Math.random() > lightMis) { best._armed = false; reseed(best); continue; }
      const danger = G.pins.some(p => (p.kind === 'trap' && k.pinHw(p) > 0 && ad(G.ang, k.pinCenter(p)) <= k.pinHw(p) + 0.03 && (p.prio || !inGate)) ||
        (p.kind === 'lockpin' && !p.open && !p.done && best !== p && ad(G.ang, p.c0) <= p.hw + 0.03 && !inGate));
      if (danger && Math.random() < trapAvoid) { best._armed = false; reseed(best); continue; }
      const n0 = G.n, t0 = G.time, kd0 = G.kind;
      k.tap(); taps++;
      { const sx = stat(kd0); sx.taps++; if (G.n > n0) sx.hits++; else sx.pen++; }
      if (best.kind === 'hold') { best._armed = false; best._aim2 = aimE() * 1.2; }
      else if (G.n === n0 && G.time <= t0) miss++;
      best._armed = false; reseed(best); best._off = null;
    }
    return { L: G.L, ph: G.ph, jt: G.jt, score: G.score, hits: G.n, taps, miss, kind: G.kind, chal: G.chal && G.chal.tw ? G.chal.tw : '', alive: G.mode === 'play', time: G.time, coins: G.gain || 0 };
  };
  const SKILLS = [['yeni', 0.12, 0.5], ['orta', 0.08, 0.75], ['iyi', 0.05, 0.9], ['usta', 0.03, 0.95], ['pro', 0.02, 1]];
  window.kindStats = () => Object.keys(window.__stats).sort().map(kd => { const x = window.__stats[kd]; return kd + ': ' + x.ch + ' tur, ' + (x.dur / Math.max(1, x.ch)).toFixed(2) + ' sn/tur, vuruş %' + Math.round(100 * x.hits / Math.max(1, x.taps)) + ' (' + x.taps + ' dokunuş)'; });
  /* cehennem bölümlerinde hayatta kalma: seviye başına girenlerin yüzde kaçı çıktı (bulk sonrası) */
  window.hellStats = () => Object.keys(window.__hell).map(Number).sort((a, b) => a - b).filter(L => L <= 12).map(L => { const h = window.__hell[L]; return 'S' + L + ' %' + Math.round(100 * h.pass / Math.max(1, h.enter)) + ' (' + h.enter + ')'; }).join('  ');
  /* Tek bir cehennem bölümünü ölç: o seviyenin cehennemine t0 saniye süreyle girilir; hayatta kalan yüzdesi ve kalan süre. */
  window.hellTest = (L, sg, av, n = 100, t0 = 6) => {
    let ok = 0, left = 0;
    for (let i = 0; i < n; i++) {
      const r = window.runBot(sg, av, L, 60, 1 / 60, {
        setup: () => {
          G.jt = k.jStart(L) + k.JOURNEY.normal[Math.min(L, 10) - 1] + 0.01; G.evi = 0; G.open = []; G.eng = {}; G.stars = {}; G.mixes = []; G.comboOn = true; k.applyEvents(true);
          k.update(1 / 60); G.time = t0; k.spawn(false);
        },
        stop: () => G.mode === 'play' && G.ph === 'normal' && G.L > L
      });
      if (r.alive) { ok++; left += r.time; }
    }
    return 'S' + L + ' %' + Math.round(100 * ok / n) + (ok ? ' (kalan ' + (left / ok).toFixed(1) + ' sn)' : '');
  };
  window.hellLine = (sg, av, n = 100, t0 = 6, Ls = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) => Ls.map(L => window.hellTest(L, sg, av, n, t0)).join('  ');
  window.bulk = (levels = ['normal'], n = 40, skills = SKILLS, ups = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) => {
    window.__stats = {}; window.__hell = {}; k.save.run = null;
    const out = {};
    for (const lvl of levels) {
      k.setLevel(lvl);
      for (const [name, sg, av] of skills) {
        const rs = []; for (let i = 0; i < n; i++) rs.push(window.runBot(sg, av));
        const js = rs.map(r => r.jt).sort((a, b) => a - b), ls = rs.map(r => r.L).sort((a, b) => a - b);
        const kinds = {}; rs.forEach(r => { kinds[r.kind] = (kinds[r.kind] || 0) + 1; });
        const cs = rs.map(r => r.coins).sort((a, b) => a - b), cm = Math.round(cs.reduce((x, y) => x + y, 0) / n);
        out[lvl + '/' + name] = 'medyan ' + Math.round(js[n >> 1]) + ' sn, seviye ' + ls[n >> 1] + ', coin ort. ' + cm + ' (medyan ' + cs[n >> 1] + ') | ' +
          ups.map(u => 'S' + u + ' %' + Math.round(100 * rs.filter(r => r.L >= u).length / n)).join(' ') + ' | ölüm: ' +
          Object.keys(kinds).sort((a, b) => kinds[b] - kinds[a]).map(x => x + ':' + kinds[x]).join(' ') +
          ' | cehennemde ölen %' + Math.round(100 * rs.filter(r => r.ph === 'hell').length / n) + ' | cehennemi geçme: ' + window.hellStats();
      }
    }
    k.setLevel('normal');
    return out;
  };
  return 'bot hazır: bulk([\'normal\'], 40)';
})();
