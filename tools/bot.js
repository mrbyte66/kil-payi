/* Yolculuk botu: gerçek oyun kodunu (update, tap, spawnChallenge...) hızlandırılmış zamanla oynatır.
   Kullanım:
     1. DEBUG=1 ./build.sh   (window.__kp test kancası eklenir)
     2. www/ klasörünü bir yerel sunucuyla aç (ör. python3 -m http.server 8780 --directory www)
     3. Tarayıcı konsoluna bu dosyanın içeriğini yapıştır, sonra:  bulk(['normal'], 40)
   Bot: her hedef için zamanlama hatası ~ N(0, sigmaT) saniye örnekler; ibre hedef merkezine ona göre varınca dokunur.
   Öncelikli tuzakların (kayan tuzak, diken) üstündeyse trapAvoid olasılığıyla dokunmaz.
   Beceri düzeyleri: yeni 0,12 sn, orta 0,08 sn, iyi 0,05 sn, usta 0,03 sn (standart sapma).
   Sonuç: ölüm anındaki yolculuk süresi (sn) ve seviyelere ulaşma sayısı. Seviye başlangıçları: L2 67, L3 143, L4 225, L5 311, L6 401. */
(() => {
  const k = window.__kp, G = k.G;
  const TAU = Math.PI * 2, nrm = a => ((a % TAU) + TAU) % TAU, ad = (a, b) => { const d = nrm(a - b); return d > Math.PI ? TAU - d : d; };
  const gauss = s => { let u = 0; while (!u) u = Math.random(); return s * Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * Math.random()); };
  window.runBot = (sigmaT, trapAvoid, startL = 1, tmax = 1300, dt = 1 / 60) => {
    k.start(startL); let t = 0, taps = 0, miss = 0;
    while (G.mode === 'play' && t < tmax) {
      k.update(dt); t += dt;
      const g = G.pins.find(p => p.kind === 'gate' && !p.done && p.ring === 0) || G.pins.find(p => p.kind === 'gate' && !p.done);
      if (!g) continue;
      const r2 = !!g.ring, a = r2 ? G.ang2 : G.ang, dir = r2 ? G.dir2 : G.dir, om = (r2 ? G.omega2 : G.omega) * (G.slow > 0 ? 0.7 : 1);
      if (g._aimT === undefined) g._aimT = gauss(sigmaT);
      let ahead = nrm((k.pinCenter(g) - a) * dir); if (ahead > Math.PI) ahead -= TAU;
      if (ahead > 0.15) g._armed = true;
      if (g._armed && ahead / om <= -g._aimT) {
        const inGate = ad(a, k.pinCenter(g)) <= k.pinHw(g) + 0.05;
        const danger = G.pins.some(p => p.kind === 'trap' && k.pinHw(p) > 0 && ad(G.ang, k.pinCenter(p)) <= k.pinHw(p) + 0.03 && (p.prio || !inGate));
        if (danger && Math.random() < trapAvoid) continue;
        const n0 = G.n; k.tap(); taps++; if (G.n === n0) miss++;
        g._armed = false; g._aimT = gauss(sigmaT);
      }
    }
    return { L: G.L, ph: G.ph, jt: G.jt, score: G.score, hits: G.n, taps, miss };
  };
  window.bulk = (levels = ['normal'], n = 40, skills = [['yeni', 0.12, 0.5], ['orta', 0.08, 0.75], ['iyi', 0.05, 0.9], ['usta', 0.03, 0.95]]) => {
    const out = {};
    for (const lvl of levels) {
      k.setLevel(lvl);
      for (const [name, sg, av] of skills) {
        const js = []; for (let i = 0; i < n; i++) js.push(window.runBot(sg, av).jt);
        js.sort((a, b) => a - b);
        const q = f => js[Math.min(n - 1, Math.floor(n * f))];
        out[lvl + '/' + name] = 'medyan ' + Math.round(q(0.5)) + ' sn, en iyi %10 ' + Math.round(q(0.9)) + ' sn | L2 ' + js.filter(x => x >= 67).length + '/' + n +
          ' L3 ' + js.filter(x => x >= 143).length + ' L4 ' + js.filter(x => x >= 225).length + ' L5 ' + js.filter(x => x >= 311).length + ' L6 ' + js.filter(x => x >= 401).length;
      }
    }
    k.setLevel('normal');
    return out;
  };
  return 'bot hazır: bulk([\'normal\'], 40)';
})();
