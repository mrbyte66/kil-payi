/* Kilit metinleri ve tanıtım sahneleri denetimi: node tools/check-strings.mjs
   Yeni bir kilit ya da engel eklenince şunlar tamam mı bakar (Türkçe ve İngilizce):
   - IMPL_GOOD / IMPL_TWIN içindeki her tür için k_ (ad) ve rule_ (kural) satırı; engel ikizleri için warn_ (uyarı) satırı,
   - her tür için INTRO sahnesi (ilk görüşte tanıtım) ve ic_<tür> açıklama satırı; açıklama sayısı sahnenin capT sayısıyla aynı olmalı.
   Eksik varsa listeler ve 1 ile çıkar (tools/release.sh çalıştırır, eksik metinle sürüm çıkmasın). */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'src', 'game.html'), 'utf8');
const problems = [];

const between = (from, to) => {
  const a = src.indexOf(from);
  if (a < 0) { problems.push('bulunamadı: ' + from); return ''; }
  const b = src.indexOf(to, a + from.length);
  return b < 0 ? src.slice(a) : src.slice(a, b);
};
const keysOf = block => { const m = new Set(); for (const x of block.matchAll(/(?:^|[\s,{])([A-Za-z_]\w*):\s*['"`]/g)) m.add(x[1]); return m; };
const objKeys = name => { const m = src.match(new RegExp('const ' + name + ' = \\{([^}]*)\\}')); return m ? [...m[1].matchAll(/(\w+):/g)].map(x => x[1]) : (problems.push(name + ' bulunamadı'), []); };

const strBlock = between('const STR = {', '\nconst t = (k, v)');
const iTr = strBlock.indexOf('\n  tr: {'), iEn = strBlock.indexOf('\n  en: {');
const STR = { tr: strBlock.slice(iTr, iEn), en: strBlock.slice(iEn) };
const keys = { tr: keysOf(STR.tr), en: keysOf(STR.en) };
const rawValue = (lang, key) => { const m = STR[lang].match(new RegExp('(?:^|[\\s,{])' + key + ":\\s*(?:'((?:[^'\\\\]|\\\\.)*)'|\"((?:[^\"\\\\]|\\\\.)*)\")")); return m ? (m[1] !== undefined ? m[1] : m[2]) : null; };

const goods = objKeys('IMPL_GOOD').filter(k => k !== 'tek'), twins = objKeys('IMPL_TWIN');
const introBlock = between('const INTRO = {', '/* bir sahneyi verilen merkez');
const scenes = {};
for (const m of introBlock.matchAll(/^  (\w+): \{ dur: [\d.]+, capT: (?:n => )?\[([^\]]*)\]/gm)) scenes[m[1]] = m[2].split(',').length;

for (const kd of [...goods, ...twins]) {
  const isTwin = twins.includes(kd);
  if (!(kd in scenes)) problems.push(kd + ': INTRO sahnesi yok');
  for (const lang of ['tr', 'en']) {
    for (const pre of isTwin ? ['k_', 'rule_', 'warn_', 'ic_'] : ['k_', 'rule_', 'ic_']) if (!keys[lang].has(pre + kd)) problems.push(kd + ': ' + lang + ' ' + pre + kd + ' yok');
    const ic = rawValue(lang, 'ic_' + kd);
    if (ic !== null && kd in scenes && ic.split('|').length !== scenes[kd]) problems.push(kd + ': ' + lang + ' ic_ ' + ic.split('|').length + ' açıklama, sahne ' + scenes[kd] + ' bekliyor');
  }
}
for (const kd of Object.keys(scenes)) if (![...goods, ...twins].includes(kd)) problems.push(kd + ': INTRO sahnesi var ama IMPL_GOOD/IMPL_TWIN içinde yok');
for (const lang of ['tr', 'en']) for (const key of ['introTag', 'introTagTw', 'introHint', 'introResume']) if (!keys[lang].has(key)) problems.push(lang + ' ' + key + ' yok');

if (problems.length) { console.log('HATA: kilit metinleri / tanıtım sahneleri eksik:\n - ' + problems.join('\n - ')); process.exit(1); }
console.log('kilit metinleri ve tanıtım sahneleri tamam: ' + goods.length + ' kilit, ' + twins.length + ' engel, ' + Object.keys(scenes).length + ' sahne');
