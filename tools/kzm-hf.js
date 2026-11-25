/* KZM İNSAN KATMANI (HF): hem tools/kzm-core.mjs (kapalı formül) hem tools/bot.js (oyun içi bot) bunu kullanır: TEK KAYNAK.
   Klasik betik (export yok): tarayıcıda ve Node'da globalThis.KZM_HF'yi kurar.
   İnsanın bir dokunuşu zamanlama gürültüsü sigma'ya EK olarak mekaniğin kendi belirsizliğiyle de bozulur: varyanslar toplanır,
   sigma_toplam^2 = sigma_oyuncu^2 + sum_m (c_m * d_m)^2.  d_m ms; mekaniğin parametrelerinden psikofiziksel formülle gelir:
     kayan    d = 1000 * (2 pi A phi sqrt(f/0,3)) / v          (salınan hedefin faz tahmini hatası: A genlik °, f Hz, v ibre °/sn)
     hayalet  d = 1000 * sqrt(p_gizli) * (memA + memB * H) / v  (görünmezken konum hafızası; H gizli kalma sn)
     ani      d = 1000 * sqrt((wt L)^2 + (2,5/v)^2)             (ölçekli zamanlama: görünmeyen hedefe L sn kala çakar)
     nabiz    d = a sqrt(pow) + b * p_ekstra                      (atış fazını kestirmek; pow atış gücü)
     gelgit   d = 1000 wf 0,3 tideV ...                          (hız değişimini önceden bilememek)
     degirmen d = (a + b w_kanat) sqrt(n/2) [x1,4 hizkanat]      (kanat izleme/dikkat bölme)
     isin     d = 1000 wt T_çıkış->hedef                         (çıkıştan hedefe ölçekli zamanlama)
     kasa     ardışık vuruş aralığı t0 sn altına inince ritim cezası (psikolojik refrakter dönem)
   Ters dönme (kyon/amb): uyarıyı fark etme olasılığı alpha ve dur-sinyali tepkisi (ssrt ± sd) ile: pf = 1 - alpha Phi((tell + L - commit - ssrt)/sd). */
(function () {
  const HF0 = {
    wf: 0.10, wt: 0.07, phi: 0.035, memA: 2.0, memB: 2.0,
    ssrt: [0.22, 0.04], commit: 0.13, alpha: 0.9,
    prp: { t0: 0.30, k: 22, cap: 60 },
    mill: { a: 10, b: 0.20 }, pulse: { a: 18, b: 9 }, tide: 1.0, isin: 1.0, serit: 14, shr: 8,
    mult: { kayan: 1, nefes: 1, hayalet: 1, ani: 1, nabiz: 1, degirmen: 1, gelgit: 1, kasa: 1, isin: 1, serit: 1, shr: 1, amb: 1 },
    /* model → oyun (insan katmanlı bot) kalibrasyonu (tools/kzm-cal.mjs, 2026-11-20): başarısızlık olasılığına çarpan; trap = tuzak bölgesi ağırlığı;
       shrEff = daralmanın gerçekte yarattığı etki payı; kyonEv = ters dönme olayı çarpanı */
    cal: { nabiz: 2.0, degirmen: 0.8, gelgit: 1, kasa: 0.9, kayan: 1, nefes: 1.1, isin: 1.3, serit: 0.6, ani: 1.2, hayaletT: 1.6, kayanT: 1.35, diken: 5, trap: 1.35, shrEff: 0.6, kyonEv: 0.5, ambEv: 0.9, cift: 1, kayan: 1, hayalet: 1, trapM: 1, alarm: 1, shr: 1, kyon: 1 },
  };
  const merge = (a, b) => { for (const k in b) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k])) { a[k] = a[k] || {}; merge(a[k], b[k]); } else a[k] = b[k]; } return a; };
  const S = { HF0, HF: JSON.parse(JSON.stringify(HF0)) };
  S.setHF = o => { S.HF = merge(JSON.parse(JSON.stringify(HF0)), o || {}); return S.HF; };
  S.DEF = {
    'kayan.amp': 22, 'kayan.f': 0.32, 'nefes.a': 38, 'nefes.P': 1.6, 'hayalet.vis': 1.1, 'hayalet.hid': 1.1, 'ani.lead': 0.65, 'ani.near': 1,
    'nabiz.per': 1.2, 'nabiz.base': 0.6, 'nabiz.pow': 2.2, 'nabiz.extra': 0.4, 'degirmen.w': 50, 'degirmen.hw': 13, 'degirmen.chg': 2.6,
    'kasa.hk': 0.85, 'kasa.gap': 40, 'kasa.flip': 4.5, 'kasa.tell': 0.5, 'gelgit.tideV': 1.0, 'gelgit.tideW': 0.6, 'isin.isinGapT': 0.48, 'serit.span': 16, 'serit.gap': 120,
  };
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const erf = x => { const t = 1 / (1 + 0.3275911 * Math.abs(x)), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; };
  S.Phi = x => 0.5 * (1 + erf(x / Math.SQRT2));
  S.erf = erf; S.clamp = clamp;
  S.gp = (w, key) => (w.p && w.p['m.' + key] != null ? w.p['m.' + key] : S.DEF[key]);
  S.has = (w, t) => (w.m || []).includes(t) || (w.e || []).includes(t) || (w.tr && (w.tr.k || []).includes(t));
  S.nTargets = w => (w.s === 'kasa' ? clamp(Math.round(w.p && w.p['m.kasa.n'] != null ? w.p['m.kasa.n'] : (w.n || 3)), 2, 3) : (w.s === 'isin' ? 1 : Math.max(1, w.n || 1)));
  S.vAvg = w => (w.v1 ? (w.v + w.v1) / 2 : w.v);
  /* hedef idx için ek sigma (ms) */
  S.sigmaX = (w, idx, help) => {
    help = help || 1;
    const H = S.HF, gp = S.gp, has = S.has, v = S.vAvg(w), M = H.mult, parts = [];
    if (has(w, 'kayan')) { const A = gp(w, 'kayan.amp'), f = gp(w, 'kayan.f'); parts.push(M.kayan * 1000 * (2 * Math.PI * A * H.phi * Math.sqrt(f / 0.3)) / v); }
    if (has(w, 'hayalet')) { const vis = gp(w, 'hayalet.vis'), Hh = gp(w, 'hayalet.hid'), F = 0.45, ph = (Hh + F) / (vis + 2 * F + Hh); parts.push(M.hayalet * 1000 * Math.sqrt(ph) * (H.memA + H.memB * Hh) / v); }
    if (has(w, 'ani')) { const L = gp(w, 'ani.lead') * (has(w, 'yakin') ? gp(w, 'ani.near') : 1); parts.push(M.ani * 1000 * Math.sqrt((H.wt * L) ** 2 + (2.5 / v) ** 2)); }
    if (has(w, 'nabiz')) { const pow = gp(w, 'nabiz.pow'), ex = has(w, 'nabizk') ? gp(w, 'nabiz.extra') : 0; parts.push(M.nabiz * (H.pulse.a * Math.sqrt(pow) + H.pulse.b * ex * 2)); }
    if (w.s === 'gelgit') { const tv = gp(w, 'gelgit.tideV'); parts.push(M.gelgit * H.tide * 1000 * H.wf * 0.3 * tv * (0.5 + 0.5 * Math.min(1, 1 / Math.max(0.5, tv)))); }
    if (has(w, 'degirmen')) { const bs = gp(w, 'degirmen.w'), nb = has(w, 'deg3') ? 3 : 2, hz = has(w, 'hizkanat') ? 1.4 : 1; parts.push(M.degirmen * (H.mill.a + H.mill.b * bs) * Math.sqrt(nb / 2) * hz); }
    if (w.s === 'isin') parts.push(M.isin * H.isin * 1000 * H.wt * gp(w, 'isin.isinGapT'));
    if (has(w, 'serit')) parts.push(M.serit * H.serit);
    if (w.x && w.x.shr) parts.push(M.shr * H.shr);
    if (w.s === 'kasa' && idx >= 1) {
      const h0 = (w.d * help / 2) * gp(w, 'kasa.hk'), step = 2 * h0 + gp(w, 'kasa.gap'), dt = step / v;
      if (dt < H.prp.t0) parts.push(M.kasa * Math.min(H.prp.cap, H.prp.k * (H.prp.t0 / dt) ** 2));
    }
    let s2 = 0; for (const x of parts) s2 += x * x;
    const nm = parts.length;
    return Math.sqrt(s2) * (nm > 1 ? 1 + 0.12 * (nm - 1) : 1);
  };
  /* ters dönmede dur-sinyalini kaçırma/yetişememe olasılığı: tell = uyarı süresi (sn), L = dönüş anında hedefe kalan süre (sn) */
  S.pfAmb = (tell, L) => { const H = S.HF; return 1 - H.alpha * S.Phi((tell + L - H.commit - H.ssrt[0]) / H.ssrt[1]); };
  globalThis.KZM_HF = S;
})();
