#!/usr/bin/env python3
"""Uygulama ikonunu üretir (V0.9.14, kullanıcı seçimi "Cam kadran"): python3 tools/make-icon.py
Ne yapar: ikonun SVG'sini başsız Chrome ile (tools/cdp.mjs) 1024 px katmanlara çevirir ve Android kaynaklarını yazar:
  mipmap-*/ic_launcher_foreground.png ve ic_launcher_background.png (uyarlanabilir ikon, 108 dp), ic_launcher.png ve ic_launcher_round.png (Android 7 ve öncesi),
  android/app/src/main/ic_launcher-playstore.png (Play Store 512 px), drawable*/splash.png (açılış ekranı, aynı degrade + kadran).
Tema renkli (tek renkli) ikon elle yazılmış vektördür: res/drawable/ic_launcher_monochrome.xml (burada üretilmez).
Gerekenler: Node 22, Google Chrome, Pillow, numpy. İkonu değiştirmek için aşağıdaki FG ve BG SVG parçalarını düzenle ve betiği yeniden çalıştır; ardından ./tools/release.sh. """
import glob, os, subprocess, sys, tempfile
from PIL import Image, ImageDraw
import numpy as np

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
RES = os.path.join(ROOT, 'android/app/src/main/res/')
DEFS = '''<defs>
<radialGradient id="g_bg" cx="50%" cy="30%" r="85%"><stop offset="0" stop-color="#B7A8FF"/><stop offset=".5" stop-color="#6D58E0"/><stop offset="1" stop-color="#2A1B80"/></radialGradient>
<linearGradient id="g_bez" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#D8CFFF"/><stop offset="1" stop-color="#9C8CF0"/></linearGradient>
<radialGradient id="g_glass" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#5A44C8"/><stop offset="1" stop-color="#2A1B80"/></radialGradient>
<linearGradient id="g_liq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC48A"/><stop offset="1" stop-color="#FF6B3A"/></linearGradient>
<radialGradient id="g_sh"><stop offset="0" stop-color="#000000" stop-opacity=".35"/><stop offset="1" stop-color="#000000" stop-opacity="0"/></radialGradient>
<clipPath id="g_clip"><circle cx="54" cy="52" r="22.5"/></clipPath></defs>'''
BG = '<rect width="108" height="108" fill="url(#g_bg)"/>'
FG = '''<ellipse cx="54" cy="86" rx="26" ry="5.5" fill="url(#g_sh)"/><circle cx="54" cy="52" r="31" fill="url(#g_bez)"/><circle cx="54" cy="52" r="26.5" fill="#6D58E0"/><circle cx="54" cy="52" r="22.5" fill="url(#g_glass)"/><g clip-path="url(#g_clip)"><path d="M28 54C36 47 43 61 54 54S71 47 80 54V80H28Z" fill="url(#g_liq)"/><path d="M28 54C36 47 43 61 54 54S71 47 80 54" fill="none" stroke="#FFE9C8" stroke-width="1.6" stroke-opacity=".85"/><circle cx="45" cy="64" r="1.8" fill="#FFFFFF" fill-opacity=".6"/><circle cx="62" cy="68" r="2.4" fill="#FFFFFF" fill-opacity=".5"/><circle cx="57" cy="60" r="1.2" fill="#FFFFFF" fill-opacity=".6"/></g><path d="M54 52L66.7 37.9" stroke="#FFFFFF" stroke-width="3.8" stroke-linecap="round"/><circle cx="66.7" cy="37.9" r="4.6" fill="#FFFFFF"/><circle cx="66.7" cy="37.9" r="1.8" fill="#FF7D43"/><circle cx="54" cy="52" r="4.2" fill="#FFFFFF"/><path d="M33.5 40C36 31 44 27 52 26.5C43 30 37.5 35 35.5 43Z" fill="#FFFFFF" fill-opacity=".55"/><circle cx="62" cy="31" r="1.8" fill="#FFFFFF" fill-opacity=".7"/>'''
PAGES = {'fg': ('0 0 108 108', FG), 'bg': ('0 0 108 108', BG), 'full': ('9 9 90 90', BG + FG), 'dial': ('18 18 72 72', FG)}
RENDER = '''import { launch } from '%s/tools/cdp.mjs';
import { writeFileSync } from 'node:fs';
const D = process.argv[2];
const b = await launch({ width: 1024, height: 1024, dpr: 1 });
await b.send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
for (const n of %s) { await b.goto('file://' + D + '/' + n + '.html'); await b.sleep(300); const r = await b.send('Page.captureScreenshot', { format: 'png', fromSurface: true }); writeFileSync(D + '/' + n + '.png', Buffer.from(r.result.data, 'base64')); }
await b.close(); process.exit(0);
'''

def main():
    tmp = tempfile.mkdtemp(prefix='kp-icon-')
    for n, (vb, inner) in PAGES.items():
        open(f'{tmp}/{n}.html', 'w', encoding='utf-8').write(f'<!doctype html><body style="margin:0;background:transparent"><svg width="1024" height="1024" viewBox="{vb}" xmlns="http://www.w3.org/2000/svg">{DEFS}{inner}</svg></body>')
    names = '[' + ','.join("'%s'" % n for n in PAGES) + ']'
    open(f'{tmp}/render.mjs', 'w', encoding='utf-8').write(RENDER % (os.path.abspath(ROOT), names))
    subprocess.run(['node', f'{tmp}/render.mjs', tmp], check=True)
    fg, bg, full, dial = [Image.open(f'{tmp}/{n}.png') for n in ('fg', 'bg', 'full', 'dial')]
    fg, dial = fg.convert('RGBA'), dial.convert('RGBA'); bg, full = bg.convert('RGB'), full.convert('RGB')
    dens = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}
    rs = lambda im, s: im.resize((s, s), Image.LANCZOS)
    def masked(im, s, kind):
        big = rs(im, s * 4).convert('RGBA'); m = Image.new('L', (s * 4, s * 4), 0); dr = ImageDraw.Draw(m)
        if kind == 'round': dr.ellipse((0, 0, s * 4 - 1, s * 4 - 1), fill=255)
        else: dr.rounded_rectangle((0, 0, s * 4 - 1, s * 4 - 1), radius=int(s * 4 * 0.22), fill=255)
        big.putalpha(m); return big.resize((s, s), Image.LANCZOS)
    for d, k in dens.items():
        rs(fg, int(108 * k)).save(f'{RES}mipmap-{d}/ic_launcher_foreground.png')
        rs(bg, int(108 * k)).save(f'{RES}mipmap-{d}/ic_launcher_background.png')
        masked(full, int(48 * k), 'sq').save(f'{RES}mipmap-{d}/ic_launcher.png')
        masked(full, int(48 * k), 'round').save(f'{RES}mipmap-{d}/ic_launcher_round.png')
    rs(full, 512).save(os.path.join(ROOT, 'android/app/src/main/ic_launcher-playstore.png'))
    def grad(w, h):
        yy, xx = np.mgrid[0:h, 0:w].astype('float32'); cx, cy, r = w * 0.5, h * 0.30, max(w, h) * 0.85
        t = np.clip(np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / r, 0, 1)
        c0, c1, c2 = (np.array(c, 'float32') for c in ((0xB7, 0xA8, 0xFF), (0x6D, 0x58, 0xE0), (0x2A, 0x1B, 0x80)))
        a = np.clip(t / 0.5, 0, 1)[..., None]; b2 = np.clip((t - 0.5) / 0.5, 0, 1)[..., None]
        return Image.fromarray(np.where(t[..., None] < 0.5, c0 * (1 - a) + c1 * a, c1 * (1 - b2) + c2 * b2).astype('uint8'), 'RGB')
    for p in [RES + 'drawable/splash.png'] + glob.glob(RES + 'drawable-port-*/splash.png') + glob.glob(RES + 'drawable-land-*/splash.png'):
        w, h = Image.open(p).size; base = grad(w, h).convert('RGBA'); s = int(min(w, h) * 0.40)
        base.alpha_composite(rs(dial, s), ((w - s) // 2, (h - s) // 2 - int(h * 0.02))); base.convert('RGB').save(p)
    print('ikon üretildi:', len(dens) * 4, 'png + Play 512 + açılış ekranları')

if __name__ == '__main__':
    sys.exit(main())
