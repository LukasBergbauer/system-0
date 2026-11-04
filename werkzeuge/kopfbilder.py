#!/usr/bin/env python3
# Erzeugt die Kopfbilder (SVG) für System 0 (nur Werkzeug, nicht Teil der App).
# Aufruf im Repo-Ordner: python3 werkzeuge/kopfbilder.py assets/bilder
# Neues Bild: Funktion ergänzen und unten in die Liste eintragen. Farben = Bereichsfarben aus tokens.css.
import math, random, sys, os

ziel = sys.argv[1]
W, H = 360, 240

def kopf(defs):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
            f'viewBox="0 0 {W} {H}" fill="none">\n<defs>{defs}</defs>\n')

def r(x):
    return f'{x:.1f}'.rstrip('0').rstrip('.')

# ---------- Heute: Kirschblüten bei Sonnenaufgang ----------
def heute():
    random.seed(7)
    defs = (
        '<radialGradient id="sonne" cx="0.5" cy="0.5" r="0.5">'
        '<stop offset="0" stop-color="#FFD9C7" stop-opacity="0.95"/>'
        '<stop offset="0.6" stop-color="#F2A7BB" stop-opacity="0.55"/>'
        '<stop offset="1" stop-color="#F2A7BB" stop-opacity="0"/></radialGradient>'
        # Blütenblatt mit Kerbe, zeigt nach oben
        '<path id="blatt" d="M0 0C-5-3-7-10-3.2-14.5L0-12.2 3.2-14.5C7-10 5-3 0 0Z"/>'
        '<g id="bluete">'
        + ''.join(f'<use href="#blatt" xlink:href="#blatt" transform="rotate({i*72})"/>' for i in range(5))
        + '<circle r="2.6" fill="#B85C78"/></g>'
        '<g id="knospe"><ellipse rx="3.4" ry="5" fill="#F2A7BB"/></g>'
    )
    s = kopf(defs)
    s += '<circle cx="232" cy="104" r="92" fill="url(#sonne)"/>\n'
    # Nebel-Linien
    for y, x1, x2, op in [(150, 120, 300, .35), (162, 160, 340, .25), (174, 100, 250, .2)]:
        s += f'<path d="M{x1} {y}H{x2}" stroke="#F2A7BB" stroke-opacity="{op}" stroke-width="2" stroke-linecap="round"/>\n'
    # Ast von rechts oben nach links
    s += ('<path d="M372 18C330 30 300 44 270 70C246 90 222 100 190 104C168 107 150 116 136 132" '
          'stroke="#5E474D" stroke-width="5" stroke-linecap="round"/>\n'
          '<path d="M270 70C262 52 250 40 232 34M222 98C214 112 210 126 212 140M190 104C178 92 166 88 150 88" '
          'stroke="#5E474D" stroke-width="2.6" stroke-linecap="round"/>\n')
    bluete = [(300, 46, 1.25, 10), (248, 84, 1.1, 40), (232, 34, 1.0, 5), (212, 140, .95, 22), (150, 88, 1.05, 60),
              (196, 96, .8, 15), (276, 60, .85, 50), (336, 30, .9, 30), (136, 132, 1.0, 12), (170, 112, .7, 70)]
    for x, y, sk, rot in bluete:
        s += (f'<use href="#bluete" xlink:href="#bluete" fill="#F7BFCD" '
              f'transform="translate({x} {y}) rotate({rot}) scale({sk})"/>\n')
    for x, y, rot in [(258, 50, -30), (222, 120, 20), (162, 98, -60)]:
        s += f'<use href="#knospe" xlink:href="#knospe" transform="translate({x} {y}) rotate({rot})"/>\n'
    # fallende Blätter
    for x, y, rot, op in [(110, 160, 30, .8), (80, 120, -20, .6), (160, 190, 70, .7), (60, 196, 10, .45), (124, 210, -50, .5)]:
        s += f'<use href="#blatt" xlink:href="#blatt" fill="#F2A7BB" fill-opacity="{op}" transform="translate({x} {y}) rotate({rot}) scale(.8)"/>\n'
    return s + '</svg>\n'

# ---------- To-dos: Bambus vor einem Ensō (Pinselkreis) ----------
def todos():
    random.seed(3)
    defs = (
        '<linearGradient id="halm" x1="0" x2="1">'
        '<stop offset="0" stop-color="#7FAE87"/><stop offset="1" stop-color="#B9D8BC"/></linearGradient>'
        '<path id="blatt" d="M0 0C10-3 28-3 46 2C28 6 10 5 0 0Z"/>'
    )
    s = kopf(defs)
    # Ensō: offener Pinselkreis, aus mehreren Strichen mit wechselnder Dicke
    cx, cy, rr = 236, 108, 78
    for i, (w, op) in enumerate([(9, .22), (5, .35), (2, .5)]):
        a0, a1 = math.radians(-60 + i * 6), math.radians(250 - i * 10)
        x0, y0 = cx + rr * math.cos(a0), cy + rr * math.sin(a0)
        x1, y1 = cx + rr * math.cos(a1), cy + rr * math.sin(a1)
        s += (f'<path d="M{r(x0)} {r(y0)}A{rr} {rr} 0 1 1 {r(x1)} {r(y1)}" stroke="#9CC5A1" '
              f'stroke-opacity="{op}" stroke-width="{w}" stroke-linecap="round"/>\n')
    # Halme mit Knoten
    for x, top, breite, neig in [(214, -10, 9, 6), (252, 20, 7, -4), (288, -20, 10, 10), (186, 60, 5, -2)]:
        y = H + 10
        segs = 0
        while y > top:
            ny = max(top, y - random.uniform(44, 60))
            dx = neig * (H - ny) / H
            pdx = neig * (H - y) / H
            s += (f'<path d="M{r(x+pdx)} {r(y)}L{r(x+dx)} {r(ny+3)}" stroke="url(#halm)" '
                  f'stroke-width="{breite}" stroke-linecap="round"/>\n')
            s += (f'<path d="M{r(x+dx-breite*.7)} {r(ny)}H{r(x+dx+breite*.7)}" stroke="#5F8A68" '
                  f'stroke-width="2" stroke-linecap="round"/>\n')
            y = ny
            segs += 1
    # Blätterbüschel
    for bx, by, winkel in [(214, 70, [-160, -140, -175]), (288, 40, [-20, -5, 15, -35]),
                           (252, 120, [200, 180, 220]), (288, 150, [10, 30, -10]), (186, 130, [190, 170])]:
        for w in winkel:
            sk = random.uniform(.8, 1.15)
            s += (f'<use href="#blatt" xlink:href="#blatt" fill="#9CC5A1" fill-opacity="{r(random.uniform(.55, .9))}" '
                  f'transform="translate({bx} {by}) rotate({w}) scale({r(sk)})"/>\n')
    return s + '</svg>\n'

# ---------- Einstellungen: Glyzinie mit Mondsichel ----------
def einstellungen():
    random.seed(11)
    defs = (
        '<radialGradient id="mond" cx="0.5" cy="0.5" r="0.5">'
        '<stop offset="0" stop-color="#E6E0FF" stop-opacity="0.5"/>'
        '<stop offset="1" stop-color="#A99BD6" stop-opacity="0"/></radialGradient>'
        '<ellipse id="tropfen" rx="4.2" ry="3.2"/>'
    )
    s = kopf(defs)
    s += '<circle cx="250" cy="96" r="86" fill="url(#mond)"/>\n'
    # Ast oben
    s += ('<path d="M120 10C170 22 220 14 260 20C300 26 330 16 372 8" stroke="#5B5068" stroke-width="4" '
          'stroke-linecap="round"/>\n')
    farben = ['#C9BDF0', '#A99BD6', '#8E7EC4', '#D9D0F7']
    for sx, laenge in [(172, 110), (214, 150), (256, 175), (298, 130), (338, 100)]:
        sy = 18 + random.uniform(-3, 3)
        s += f'<path d="M{sx} {sy}V{r(sy + laenge * .9)}" stroke="#5B5068" stroke-opacity=".5" stroke-width="1.2"/>\n'
        n = int(laenge / 10)
        for i in range(n):
            t = i / n
            y = sy + 6 + t * laenge
            breite = 13 * (1 - t) + 3
            for seite in ((-1, 1) if t < .5 else ((-1) ** i,)):
                x = sx + seite * random.uniform(1, breite * .8)
                f = farben[min(3, int(t * 3 + random.random()))]
                sk = 1.15 - t * .55
                s += (f'<use href="#tropfen" xlink:href="#tropfen" fill="{f}" fill-opacity="{r(.95 - t * .35)}" '
                      f'transform="translate({r(x)} {r(y)}) rotate({r(random.uniform(-40, 40))}) scale({r(sk)})"/>\n')
    # Blätter am Ast
    for x, y, rot in [(136, 20, 30), (200, 22, 150), (238, 24, 20), (300, 24, 160), (334, 20, 40)]:
        s += (f'<path d="M0 0C6-5 18-6 26 0C18 6 6 5 0 0Z" fill="#8FAF8A" fill-opacity=".7" '
              f'transform="translate({x} {y}) rotate({rot})"/>\n')
    return s + '</svg>\n'

os.makedirs(ziel, exist_ok=True)
for name, fn in [('heute', heute), ('todos', todos), ('einstellungen', einstellungen)]:
    with open(os.path.join(ziel, f'{name}.svg'), 'w') as f:
        f.write(fn())
    print(name, os.path.getsize(os.path.join(ziel, f'{name}.svg')), 'Bytes')
