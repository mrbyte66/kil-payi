/* Betikli bölümleri gerçek oyunda botla koştur (V1.0.28, Zorluk Modeli ölçüm hattı).
   import { openGame, runScript } from './kzm-run.mjs'
   const g = await openGame();                                  // DEBUG=1 derlemesi (www/index.html) + insan katmanı + bot
   const runs = await runScript(g, { n: 18, script, sigma: 50, av: 0.9, runs: 40 });   // her koşu: { w, x, d, fw, e: [[dalga, 0 ıska | 1 tuzak, etiket]], lg }
   await g.close();
   Sanal can (99): bot ölmez, her hasar olay olarak yazılır; gerçek canlı sonuç levelDP ile aynı olaylardan yeniden oynatılır (laboratuvarın runOne/replay yolu gibi). */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './cdp.mjs';

const T = dirname(fileURLToPath(import.meta.url)), ROOT = join(T, '..');
export const botSource = () => {
  const hf = readFileSync(join(T, 'kzm-hf.js'), 'utf8'), jf = join(T, 'kzm-hf.json');
  return hf + '\n' + (existsSync(jf) ? `KZM_HF.setHF(${readFileSync(jf, 'utf8')});\n` : '') + readFileSync(join(T, 'bot.js'), 'utf8');
};
const PAGE = `
window.__scRun = (n, script, sg, av, runs, hf, opt) => {
  const k = __kp, G = k.G, id = k.blId(n), out = [];
  if (script) { delete script._ov; k.BL_SC[id] = script; }
  if (hf) KZM_HF.setHF(hf);
  for (let r = 0; r < runs; r++) {
    window.__blLog = []; let t0 = 0;
    runBot(sg, av, 1, 900, 1 / 60, { hf: !(opt && opt.hf === false), jitter: 0, setup: () => { k.save.bl.f = {}; k.blStart(n); t0 = G.clock; G.bl.lives = 99; G.bl.lifeAll = 1; }, stop: () => { if (G.bl) G.bl.lives = 99; return false; } });
    const B = G.bl, W = B ? B.waves : 1;
    out.push({ w: W, x: G.mode === 'blwin' ? 1 : 0, d: +(G.clock - t0).toFixed(2), fw: B ? B.wave : 0, e: window.__blLog.map(a => [Math.round(a[2] * W), a[0] === 'tuzak' ? 1 : 0, a[1]]), lg: B ? (B.lifeGot | 0) : 0 });
    k.goMenu();
  }
  return JSON.stringify(out);
};0`;

export const openGame = async () => {
  const b = await launch({ width: 390, height: 844, dpr: 1, lang: 'tr-TR', seed: 'window.requestAnimationFrame=function(){return 0};' });
  await b.goto('file://' + join(ROOT, 'www', 'index.html'));
  await b.eval(botSource());
  await b.eval(PAGE);
  return b;
};
export const runScript = async (b, { n, script, sigma, av, runs = 20, hf = null, noHf = false }) =>
  JSON.parse(await b.eval(`__scRun(${n}, ${script ? JSON.stringify(script) : 'null'}, ${sigma / 1000}, ${av}, ${runs}, ${hf ? JSON.stringify(hf) : 'null'}, ${JSON.stringify({ hf: !noHf })})`, { timeout: 590000 }));
