/* Kilit metinleri ve tanıtım sahneleri denetimi: node tools/check-strings.mjs
   Yeni bir kilit ya da engel eklenince şunlar tamam mı bakar (Türkçe ve İngilizce):
   - IMPL_GOOD / IMPL_TWIN içindeki her tür için k_ (ad) ve rule_ (kural) satırı; engel ikizleri için warn_ (uyarı) satırı,
   - her tür için INTRO sahnesi (ilk görüşte tanıtım) ve ic_<tür> açıklama satırı; açıklama sayısı sahnenin capT sayısıyla aynı olmalı,
   - (V0.9.2) iki dilin metin anahtarları aynı mı; kodda t('anahtar') ve data-i18n ile kullanılan her anahtar iki dilde tanımlı mı.
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
const introBlock = between('const INTRO = {', '/* Gösteri çizimi');
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
for (const lang of ['tr', 'en']) for (const key of ['introGo']) if (!keys[lang].has(key)) problems.push(lang + ' ' + key + ' yok');

/* Genel denetim (V0.9.2): iki dilin anahtarları aynı olmalı; kodda t('anahtar') ya da data-i18n="anahtar" ile geçen her anahtar iki dilde de bulunmalı. */
for (const k of keys.tr) if (!keys.en.has(k)) problems.push('en satırı yok: ' + k);
for (const k of keys.en) if (!keys.tr.has(k)) problems.push('tr satırı yok: ' + k);
const used = new Set();
for (const m of src.matchAll(/\bt\('([A-Za-z_]\w*)'\s*[,)]/g)) used.add(m[1]);
for (const m of src.matchAll(/data-i18n="([A-Za-z_]\w*)"/g)) used.add(m[1]);
for (const k of used) for (const lang of ['tr', 'en']) if (!keys[lang].has(k)) problems.push(lang + ' ' + k + ' kullanılıyor ama tanımlı değil');

/* t('önek_' + id) biçiminde kurulan metin aileleri: her üyesi iki dilde de olmalı. */
const FAMILIES = { st_n_: ['alet', 'yet', 'gor', 'hed'], st_s_: ['alet', 'yet', 'gor', 'hed'], st_dd_: ['kron', 'kalkan', 'steto', 'kum'], ts_: ['kron', 'kalkan', 'steto', 'kum'], tool_: ['kron', 'kalkan', 'steto', 'kum'], d_: ['kron', 'kalkan', 'steto', 'kum'], lv_: ['rahat', 'normal', 'usta', 'cehennem'], lvHint_: ['rahat', 'normal', 'usta', 'cehennem'] };
for (const [pre, ids] of Object.entries(FAMILIES)) for (const id of ids) for (const lang of ['tr', 'en']) if (!keys[lang].has(pre + id)) problems.push(lang + ' ' + pre + id + ' yok');
if (problems.length) { console.log('HATA: kilit metinleri / tanıtım sahneleri eksik:\n - ' + problems.join('\n - ')); process.exit(1); }
console.log('kilit metinleri ve tanıtım sahneleri tamam: ' + goods.length + ' kilit, ' + twins.length + ' engel, ' + Object.keys(scenes).length + ' sahne; ' + keys.tr.size + ' metin anahtarı iki dilde de var, ' + used.size + ' kullanım denetlendi');
