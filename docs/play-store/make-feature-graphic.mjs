import { launch } from '/Users/beytullahgonulal/Desktop/AndroidDevelopment/KilPayi/tools/cdp.mjs';
import { writeFileSync, readFileSync } from 'node:fs';
const D = process.argv[2], ROOT = '/Users/beytullahgonulal/Desktop/AndroidDevelopment/KilPayi';
const py = readFileSync(ROOT + '/tools/make-icon.py', 'utf8');
const grab = n => py.match(new RegExp("^" + n + " = '''([\\s\\S]*?)'''", 'm'))[1];
const DEFS = grab('DEFS'), FG = grab('FG');
const dial = (x, y, s) => `<svg x="${x}" y="${y}" width="${s}" height="${s}" viewBox="18 18 72 72">${FG}</svg>`;
const font = `<style>@font-face{font-family:F;src:url(file://${ROOT}/src/fonts/fredoka-latin.woff2);font-weight:300 700}@font-face{font-family:F;src:url(file://${ROOT}/src/fonts/fredoka-latin-ext.woff2);font-weight:300 700;unicode-range:U+0100-02AF}text{font-family:F,sans-serif;font-weight:700}</style>`;
const wrap = body => `<!doctype html><body style="margin:0;background:#000"><svg width="1024" height="500" viewBox="0 0 1024 500" xmlns="http://www.w3.org/2000/svg">${font}<defs>${DEFS.replace(/^<defs>|<\/defs>$/g, '')}
<radialGradient id="bgA" cx="75%" cy="45%" r="80%"><stop offset="0" stop-color="#9D8BFF"/><stop offset=".55" stop-color="#5B45D6"/><stop offset="1" stop-color="#241670"/></radialGradient>
<radialGradient id="bgC" cx="72%" cy="55%" r="75%"><stop offset="0" stop-color="#FF7A3D"/><stop offset=".35" stop-color="#8A1F2B"/><stop offset="1" stop-color="#12060F"/></radialGradient>
<radialGradient id="bgD" cx="30%" cy="30%" r="90%"><stop offset="0" stop-color="#FFE9D6"/><stop offset="1" stop-color="#FFC9A6"/></radialGradient>
<linearGradient id="fire" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE29A"/><stop offset=".5" stop-color="#FF9A4D"/><stop offset="1" stop-color="#FF4A2E"/></linearGradient>
<radialGradient id="glow"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".45"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>
<radialGradient id="glowO"><stop offset="0" stop-color="#FF8A3D" stop-opacity=".8"/><stop offset="1" stop-color="#FF8A3D" stop-opacity="0"/></radialGradient>
</defs>${body}</svg></body>`;
const rings = (cx, cy, rs, col, op) => rs.map(r => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${col}" stroke-opacity="${op}" stroke-width="2"/>`).join('');
const V = {};
V.A = wrap(`<rect width="1024" height="500" fill="url(#bgA)"/>${rings(760, 250, [190, 260, 340, 430], '#fff', .14)}<circle cx="760" cy="250" r="260" fill="url(#glow)"/>${dial(540, 25, 440)}
<text x="70" y="235" font-size="118" fill="#fff" style="letter-spacing:-1px">Close</text><text x="70" y="345" font-size="118" fill="#fff">Call</text>
<text x="74" y="405" font-size="34" fill="#FFC48A" style="font-weight:600">One tap. Hit it by a hair.</text>`);
V.B = wrap(`<rect width="1024" height="500" fill="url(#bgA)"/>${rings(512, 250, [150, 215, 290, 380, 480], '#fff', .12)}<circle cx="512" cy="240" r="250" fill="url(#glow)"/>${dial(312, 20, 400)}
<text x="150" y="235" font-size="62" fill="#fff" text-anchor="middle">ONE TAP</text><text x="874" y="235" font-size="62" fill="#FFC48A" text-anchor="middle">ONE HAIR</text>
<rect x="352" y="415" width="320" height="64" rx="32" fill="#fff"/><text x="512" y="463" font-size="46" fill="#3B2A9E" text-anchor="middle">Close Call</text>`);
V.C = wrap(`<rect width="1024" height="500" fill="url(#bgC)"/><circle cx="760" cy="270" r="300" fill="url(#glowO)"/>${rings(760, 250, [190, 260, 340, 430], '#FFB36B', .22)}${dial(540, 25, 440)}
<text x="70" y="225" font-size="118" fill="url(#fire)">CLOSE</text><text x="70" y="338" font-size="118" fill="url(#fire)">CALL</text>
<text x="74" y="400" font-size="32" fill="#FFE9D6" style="font-weight:600">Four levels. The last one is Hell.</text>`);
const ring = (cx, cy, R, a0, a1) => { const p = a => [cx + R * Math.cos(a), cy + R * Math.sin(a)]; const [x0, y0] = p(a0), [x1, y1] = p(a1); return `M${x0} ${y0}A${R} ${R} 0 0 1 ${x1} ${y1}`; };
const na = -0.62, nx = 770 + 205 * Math.cos(na), ny = 250 + 205 * Math.sin(na);
V.D = wrap(`<rect width="1024" height="500" fill="#201457"/><rect width="1024" height="500" fill="url(#bgA)" opacity=".55"/>
<circle cx="770" cy="250" r="205" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="46"/>
<path d="${ring(770, 250, 205, -0.85, -0.38)}" fill="none" stroke="#FF9A4D" stroke-width="46" stroke-linecap="round"/>
<path d="${ring(770, 250, 205, -0.72, -0.52)}" fill="none" stroke="#FFE9C8" stroke-width="46" stroke-linecap="butt" stroke-opacity=".0"/>
<circle cx="770" cy="250" r="150" fill="url(#g_glass)"/>
<path d="M770 250L${nx} ${ny}" stroke="#fff" stroke-width="12" stroke-linecap="round"/><circle cx="${nx}" cy="${ny}" r="22" fill="#fff"/><circle cx="${nx}" cy="${ny}" r="9" fill="#FF7D43"/><circle cx="770" cy="250" r="18" fill="#fff"/>
<text x="770" y="262" font-size="54" fill="#FFC48A" text-anchor="middle" opacity=".0">0</text>
<text x="70" y="235" font-size="118" fill="#fff">Close</text><text x="70" y="345" font-size="118" fill="#fff">Call</text><text x="74" y="405" font-size="34" fill="#FFC48A" style="font-weight:600">Tap the instant it crosses.</text>`);
const b = await launch({ width: 1024, height: 500, dpr: 1 });
for (const k of Object.keys(V)) { writeFileSync(`${D}/${k}.html`, V[k]); await b.goto('file://' + D + '/' + k + '.html'); await b.sleep(700); const r = await b.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${D}/${k}.png`, Buffer.from(r.result.data, 'base64')); }
await b.close(); process.exit(0);
