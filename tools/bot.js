/* Yolculuk botu: gerçek oyun kodunu (update, tap, release, spawnChallenge...) hızlandırılmış zamanla oynatır.
   Kullanım:
     1. DEBUG=1 ./build.sh   (window.__kp test kancası eklenir)
     2. www/ klasörünü bir yerel sunucuyla aç (ör. python3 -m http.server 8780 --directory www)
     3. Tarayıcı konsoluna bu dosyanın içeriğini yapıştır (ya da sayfaya <script src="bot.js"> ekle), sonra:  bulk(['normal'], 40)
   Bot: her hedef için zamanlama hatası ~ N(0, sigmaT) saniye örnekler; ibre hedef merkezine ona göre varınca dokunur.
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
  const eta = (c, ring) => {
    const a = ring ? G.ang2 : G.ang, dir = ring ? G.dir2 : G.dir;
    const base = (ring ? G.omega2 : G.omega) * (G.slow > 0 ? G.slowMul : 1);
    const ahead = sgn(c - a, dir);
    if (!ring && G.kind === 'gelgit' && G.tideC != null && ahead > 0) return k.etaTo(c, dir, 0);
    return ahead / (base * (ring ? 1 : k.ptrFactor()));
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
    const goldP = Math.max(0.15, Math.min(0.85, 0.95 - sigmaT * 6.5)), lightMis = sigmaT * 1.2;
    const seed = p => { if (p._aim === undefined) { p._aim = aimE(); p._aim2 = aimE() * 1.2; p._armed = false; } };
    while (G.mode === 'play' && t < tmax) {
      k.update(dt); t += dt;
      if (opt.stop && opt.stop()) break;
      if (G.ph !== prevPh || G.L !== prevL) {
        if (G.ph === 'hell') hstat(G.L).enter++;
        else if (prevPh === 'hell') hstat(prevL).pass++;
        prevPh = G.ph; prevL = G.L;
      }
      if (G.chal !== curChal) {
        if (curChal) { const sx = stat(curChal.kind); sx.ch++; sx.dur += curChal.t; }
        curChal = G.chal;
        if (window.__logChal) window.__chalLog.push({ L: G.L, ph: G.ph, time: G.time, hw: G.hw, kind: G.kind });
      }
      if (G.mode !== 'play') break;
      /* tut-bırak: basılıyken bırakma anını bekle */
      if (G.holding) {
        const hp = G.pins.find(p => p.kind === 'hold' && p.st === 'hold');
        if (hp) {
          seed(hp);
          const rel = k.holdRel(hp), om = G.omega * (G.slow > 0 ? G.slowMul : 1) * k.ptrFactor();
          if ((hp.len - rel) / om <= -hp._aim2) { k.release(); hp._aim = aimE(); hp._aim2 = aimE() * 1.2; hp._armed = false; }
        }
        continue;
      }
      /* hedef seç: en erken varılacak, vurulabilir hedef */
      let best = null, bestEta = 9e9, bestOff = 0;
      for (const p of G.pins) {
        if (p.done) continue;
        let c, gh;
        if (p.kind === 'gate') {
          if (p.locked) continue;
          if (p.gold) { if (p.wait || p.gone) continue; if (p._try === undefined) p._try = Math.random() < goldP; if (!p._try) continue; }
          c = k.pinCenter(p); gh = k.pinHw(p);
        } else if (p.kind === 'lockpin') { if (!p.open) continue; c = p.c0; gh = p.hw; }
        else if (p.kind === 'hold') { c = p.c0; gh = p.hw; }
        else continue;
        /* ışınlanma pini: ibre tünelde ya da önce kapıya varacaksa hedefi bekle (çıkışı görünce hedefe giden yol serbest) */
        if (G.kind === 'isin' && p.kind === 'gate') {
          if (G.tun) continue;
          const pin = G.pins.find(q => q.kind === 'portal' && q.portal === 'in'), at = sgn(c - G.ang, G.dir);
          if (at > 0 && pin && nrm((pin.c0 - G.ang) * G.dir) < at) continue;
        }
        seed(p);
        const ring = p.ring ? 1 : 0;
        const a = ring ? G.ang2 : G.ang, dir = ring ? G.dir2 : G.dir;
        /* hedefin üstünde öncelikli tuzak varsa hedefin açıkta kalan parçasını hedefle (yeterince genişse) */
        let off = 0;
        if (p.kind === 'gate') for (const q of G.pins) {
          if (q.kind !== 'trap' || !q.prio || k.pinHw(q) <= 0) continue;
          const tc = k.pinCenter(q), th = k.pinHw(q), rel = ((tc - c + Math.PI + 4 * TAU) % TAU) - Math.PI;
          if (Math.abs(rel) < gh + th) {
            const left = rel - th - (-gh), right = gh - (rel + th);
            if (Math.max(left, right) > 0.14) off = left > right ? (-gh + (rel - th)) / 2 : ((rel + th) + gh) / 2; else off = NaN;
          }
        }
        if (Number.isNaN(off)) continue;
        const e = eta(c + off, ring), ahead = sgn(c + off - a, dir);
        if (ahead > 0.15) p._armed = true;
        if (!p._armed) continue;
        if (e < bestEta) { best = p; bestEta = e; bestOff = off; }
      }
      if (!best) continue;
      if (bestEta > -best._aim) continue;
      const ring = best.ring ? 1 : 0, a = ring ? G.ang2 : G.ang;
      const gc = best.kind === 'hold' ? best.c0 : k.pinCenter(best), gh = best.kind === 'hold' ? best.hw : k.pinHw(best);
      const inGate = ad(a, gc) <= gh + 0.05;
      /* trafik ışığı: kırmızıya vurma (yeni oyuncular ara sıra yanılır) */
      if (best.light && !best.green && Math.random() > lightMis) { best._armed = false; best._aim = aimE(); continue; }
      const danger = G.pins.some(p => (p.kind === 'trap' && k.pinHw(p) > 0 && ad(G.ang, k.pinCenter(p)) <= k.pinHw(p) + 0.03 && (p.prio || !inGate)) ||
        (p.kind === 'lockpin' && !p.open && !p.done && best !== p && ad(G.ang, p.c0) <= p.hw + 0.03 && !inGate));
      if (danger && Math.random() < trapAvoid) { best._armed = false; best._aim = aimE(); continue; }
      const n0 = G.n, t0 = G.time, kd0 = G.kind;
      k.tap(); taps++;
      { const sx = stat(kd0); sx.taps++; if (G.n > n0) sx.hits++; else sx.pen++; }
      if (best.kind === 'hold') { best._armed = false; best._aim2 = aimE() * 1.2; }
      else if (G.n === n0 && G.time <= t0) miss++;
      best._armed = false; best._aim = aimE();
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
