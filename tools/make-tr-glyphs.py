#!/usr/bin/env python3
"""Fredoka'ya Türkçe harfler ekler: ğ Ğ ş Ş İ.

Neden: Google Fonts'taki Fredoka bu beş harfi içermiyor. Başlıklarda ("Mağaza", "İçeri gir", "Şeftali"...) bu harfler sıradaki yazı tipinden
(Nunito) geldiği için başka bir yazı gibi sırıtıyordu. Bu betik Fredoka'nın kendi parçalarından (s, S, g, G, I, çengel, nokta) beş harfi üretir;
kırılan harfler 500, 600 ve 700 kalınlığında src/fonts/fredoka-tr-<kalınlık>.woff2 olarak yazılır, fonts.css içinde unicode-range ile yalnızca bu harflere bağlanır.

Kullanım: python3 tools/make-tr-glyphs.py   (fontTools ve brotli gerekir: pip install fonttools brotli)
src/fonts/fredoka-latin.woff2 (tools/fetch-fonts.mjs indirir) girdidir. Çıktı depoya girer; betik yalnızca harfler değişirse yeniden çalıştırılır."""
import math, os, sys
from fontTools.ttLib import TTFont
from fontTools.ttLib.tables._g_l_y_f import Glyph, GlyphComponent
from fontTools.varLib import instancer
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools import subset

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, '..', 'src', 'fonts')
SRC = os.path.join(FONTS, 'fredoka-latin.woff2')
UNICODES = [0x11E, 0x11F, 0x15E, 0x15F, 0x130]


def breve_glyph(weight, glyph_set):
    """Fredoka'da breve yok: yuvarlak uçlu, kalınlığı Fredoka'nın işaretleriyle uyumlu bir "gülümseme" yayı çizilir (en alt nokta y=0)."""
    T = {500: 74, 600: 84, 700: 94}[weight]          # çizgi kalınlığı
    W, S = 340, 70                                   # dış genişlik, yayın çukur derinliği
    c = (W - T) / 2.0                                # orta çizginin yarı kirişi
    R = (c * c + S * S) / (2.0 * S)                  # orta çizginin yarıçapı
    a = math.asin(c / R)
    cx, yc = W / 2.0, R + T / 2.0                    # çemberin merkezi; en alt dış nokta y=0
    n, m = 30, 14
    sin, cos = math.sin, math.cos

    def on(r, phi):
        return (cx + r * sin(phi), yc - r * cos(phi))

    pts = []
    for i in range(n + 1):                           # dış (alt) yay: soldan sağa
        pts.append(on(R + T / 2, -a + 2 * a * i / n))
    ex, ey = on(R, a)
    for i in range(1, m):                            # sağ uç yuvarlağı
        th = math.pi * i / m
        pts.append((ex + (T / 2) * (cos(th) * sin(a) + sin(th) * cos(a)), ey + (T / 2) * (-cos(th) * cos(a) + sin(th) * sin(a))))
    for i in range(n, -1, -1):                       # iç (üst) yay: sağdan sola
        pts.append(on(R - T / 2, -a + 2 * a * i / n))
    lx, ly = on(R, -a)
    for i in range(1, m):                            # sol uç yuvarlağı
        th = math.pi * i / m
        pts.append((lx + (T / 2) * (-cos(th) * (-sin(a)) + sin(th) * (-cos(a))), ly + (T / 2) * (-cos(th) * (-cos(a)) + sin(th) * sin(a))))
    pts = [(int(round(x)), int(round(y))) for x, y in reversed(pts)]   # saat yönü (TrueType dış çizgi)
    pen = TTGlyphPen(glyph_set)
    pen.moveTo(pts[0])
    for p in pts[1:]:
        pen.lineTo(p)
    pen.closePath()
    return pen.glyph(), W


def comp(name, x, y, flags):
    c = GlyphComponent()
    c.glyphName, c.x, c.y, c.flags = name, int(round(x)), int(round(y)), flags
    return c


def build(weight):
    base = TTFont(SRC)
    f = instancer.instantiateVariableFont(base, {'wght': weight}, inplace=False)
    glyf, hmtx = f['glyf'], f['hmtx']
    order = list(f.getGlyphOrder())
    cm = f.getBestCmap()
    flags = glyf['ccedilla'].components[1].flags           # Fredoka'nın kendi çengel bileşeniyle aynı bayraklar
    flags0 = glyf['ccedilla'].components[0].flags

    def bounds(n):
        g = glyf[n]
        g.recalcBounds(glyf)
        return g.xMin, g.xMax

    def add(name, g, adv):
        glyf.glyphs[name] = g
        order.append(name)
        g.recalcBounds(glyf)
        hmtx.metrics[name] = (adv, g.xMin)

    # breve (yardımcı, eşlenmez)
    gs = f.getGlyphSet()
    bg, bw = breve_glyph(weight, gs)
    add('breve', bg, bw)

    def composite(name, parts, adv):
        g = Glyph()
        g.numberOfContours = -1
        g.components = [comp(n, x, y, flags0 if i == 0 else flags) for i, (n, x, y) in enumerate(parts)]
        add(name, g, adv)

    # ş: s + çengel ('ç'deki çengel konumuna göre s'nin ortasına), Ş: S + çengel ('Ç'deki gibi)
    s0, s1 = bounds('s'); c0, c1 = bounds('c')
    composite('scedilla', [('s', 0, 0), ('uni0327', 133 + ((s0 + s1) / 2 - (c0 + c1) / 2), 0)], hmtx['s'][0])
    S0, S1 = bounds('S'); C0, C1 = bounds('C')
    composite('Scedilla', [('S', 0, 0), ('uni0327', 217 + ((S0 + S1) / 2 - (C0 + C1) / 2), 12)], hmtx['S'][0])
    # ğ, Ğ: yayın ortası harfin genişliğinin ortasında; büyük harflerde işaretler 200 birim yukarıda (Fredoka'nın Ö, Â kuralı)
    gadv, Gadv = hmtx['g'][0], hmtx['G'][0]
    composite('gbreve', [('g', 0, 0), ('breve', gadv / 2.0 - bw / 2.0, 538)], gadv)
    composite('Gbreve', [('G', 0, 0), ('breve', Gadv / 2.0 - bw / 2.0, 738)], Gadv)
    # İ: I + nokta (noktalı i'nin noktası kadar yukarıda, büyük harf işareti yüksekliğinde)
    i0, i1 = bounds('I'); p0, p1 = bounds('period')
    composite('Idotaccent', [('I', 0, 0), ('period', (i0 + i1) / 2 - (p0 + p1) / 2, 758)], hmtx['I'][0])

    f.setGlyphOrder(order)
    for st in f['cmap'].tables:
        if st.isUnicode() and st.format in (4, 12):
            st.cmap.update({0x11F: 'gbreve', 0x11E: 'Gbreve', 0x15F: 'scedilla', 0x15E: 'Scedilla', 0x130: 'Idotaccent'})
    f['maxp'].numGlyphs = len(order)
    opt = subset.Options()
    opt.layout_features = []
    opt.hinting = False
    opt.notdef_outline = False
    opt.name_IDs = [1]
    opt.glyph_names = False
    opt.flavor = 'woff2'
    sub = subset.Subsetter(opt)
    sub.populate(unicodes=UNICODES)
    sub.subset(f)
    f.flavor = 'woff2'
    out = os.path.join(FONTS, 'fredoka-tr-%d.woff2' % weight)
    f.save(out)
    return out, os.path.getsize(out)


if __name__ == '__main__':
    for w in (500, 600, 700):
        o, n = build(w)
        print(os.path.basename(o), n, 'bayt')
    css = ''.join("@font-face{font-family:'Fredoka';font-style:normal;font-weight:%d;font-display:swap;src:url(fredoka-tr-%d.woff2) format('woff2');unicode-range:U+011E-011F, U+015E-015F, U+0130}\n" % (w, w) for w in (500, 600, 700))
    print('\nfonts.css sonuna şunlar eklenir (tools/fetch-fonts.mjs bunu kendiliğinden yapar):\n' + css)
