#!/usr/bin/env python3
# Erzeugt die Kopfbilder (SVG) für System 0 im Stil „Stein & Licht“ (nur Werkzeug, nicht Teil der App).
# Aufruf im Repo-Ordner: python3 werkzeuge/kopfbilder.py assets/bilder
# Jede Szene: dunkler Grund, Steinkante, ein Objekt aus Stein, schräger Lichtstrahl von rechts oben, Körnung.
# Neues Bild: Funktion für das Objekt ergänzen und unten in SZENEN eintragen.
import os, sys

W, H = 600, 400
BG = '#151515'  # = --bg aus tokens.css, damit das Bild nahtlos in die Seite übergeht
LICHT = '#EDE6DA'  # warmes Grau-Weiß, kein Gold

DEFS = f'''
<filter id="stein" x="-5%" y="-5%" width="110%" height="110%">
  <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="4" seed="4" result="rau"/>
  <feDiffuseLighting in="rau" surfaceScale="1.3" diffuseConstant="1.2" lighting-color="#fff" result="licht">
    <feDistantLight azimuth="315" elevation="60"/>
  </feDiffuseLighting>
  <!-- reine Multiplikation (k1): Farbe × Licht, Rand bleibt ohne hellen Saum -->
  <feComposite in="SourceGraphic" in2="licht" operator="arithmetic" k1="1" k2="0" k3="0" k4="0"/>
</filter>
<filter id="weich" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="22"/></filter>
<filter id="schatten" x="-30%" y="-100%" width="160%" height="300%"><feGaussianBlur stdDeviation="9"/></filter>
<filter id="korn">
  <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="9"/>
  <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.045 0"/>
</filter>
<radialGradient id="kugel" cx="0.62" cy="0.36" r="0.75" fx="0.7" fy="0.28">
  <stop offset="0" stop-color="#C4BFB7"/>
  <stop offset="0.3" stop-color="#7E7A73"/>
  <stop offset="0.7" stop-color="#34322F"/>
  <stop offset="1" stop-color="#121211"/>
</radialGradient>
<linearGradient id="strahl" x1="1" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="{LICHT}" stop-opacity="0.55"/>
  <stop offset="0.55" stop-color="{LICHT}" stop-opacity="0.22"/>
  <stop offset="1" stop-color="{LICHT}" stop-opacity="0"/>
</linearGradient>
<linearGradient id="kante-oben" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="#2A2927"/>
  <stop offset="0.7" stop-color="#55524D"/>
  <stop offset="1" stop-color="#3B3936"/>
</linearGradient>
<linearGradient id="kante-vorn" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#3A3836"/>
  <stop offset="1" stop-color="#1A1918"/>
</linearGradient>
<radialGradient id="pfuetze" cx="0.5" cy="0.5" r="0.5">
  <stop offset="0" stop-color="{LICHT}" stop-opacity="0.35"/>
  <stop offset="1" stop-color="{LICHT}" stop-opacity="0"/>
</radialGradient>
<linearGradient id="block-oben" x1="0" y1="1" x2="1" y2="0">
  <stop offset="0" stop-color="#6E6A64"/><stop offset="1" stop-color="#ABA69E"/>
</linearGradient>
<linearGradient id="block-vorn" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#2B2A28"/><stop offset="1" stop-color="#46433F"/>
</linearGradient>
<linearGradient id="block-seite" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#7A766F"/><stop offset="1" stop-color="#4A4743"/>
</linearGradient>
'''


def kante_y(x):
    # Oberkante der Steinplatte: leicht schräg (perspektivisch)
    return 330 - x * 10 / W


def grund():
    s = f'<rect width="{W}" height="{H}" fill="{BG}"/>\n'
    # Lichtstrahl schräg von rechts oben nach links unten
    s += ('<polygon points="660,-60 660,90 230,350 110,330" fill="url(#strahl)" filter="url(#weich)"/>\n')
    # Steinplatte: Oberseite (hell, im Licht) und Vorderseite (dunkel, rau)
    s += (f'<polygon points="0,{kante_y(0)+6} {W},{kante_y(W)} {W},{kante_y(W)+16} 0,{kante_y(0)+24}" '
          'fill="url(#kante-oben)" filter="url(#stein)"/>\n')
    s += (f'<polygon points="0,{kante_y(0)+21} {W},{kante_y(W)+13} {W},{H} 0,{H}" '
          'fill="url(#kante-vorn)" filter="url(#stein)"/>\n')
    return s


def licht_auf_kante(x, breite):
    y = kante_y(x) + 10
    return f'<ellipse cx="{x}" cy="{y}" rx="{breite}" ry="10" fill="url(#pfuetze)"/>\n'


def schatten(x, breite):
    y = kante_y(x) + 8
    return (f'<ellipse cx="{x - 18}" cy="{y}" rx="{breite}" ry="9" fill="#000" fill-opacity="0.75" '
            'filter="url(#schatten)"/>\n')


def kugel():
    cx, r = 482, 88
    cy = kante_y(cx) + 8 - r
    s = licht_auf_kante(cx + 40, 190) + schatten(cx, r * 1.05)
    s += f'<circle cx="{cx}" cy="{cy:.1f}" r="{r}" fill="url(#kugel)" filter="url(#stein)"/>\n'
    return s


def steinstapel():
    # flache Kiesel übereinander, von unten nach oben kleiner
    steine = [(482, 34, 78, 26), (494, 0, 62, 22), (478, -38, 47, 18), (490, -68, 31, 13)]
    basis = kante_y(482) + 8
    s = licht_auf_kante(515, 180) + schatten(482, 86)
    y = basis
    for cx, _, rx, ry in steine:
        cy = y - ry
        s += f'<ellipse cx="{cx}" cy="{cy:.1f}" rx="{rx}" ry="{ry}" fill="url(#kugel)" filter="url(#stein)"/>\n'
        y = cy - ry + 4  # liegt leicht im darunterliegenden Stein
    return s


def block():
    # Steinquader: Vorderseite, Oberseite, rechte Seite (im Licht)
    x0, x1, tiefe, hoehe = 404, 524, 44, 104
    unten = kante_y(464) + 10
    oben = unten - hoehe
    s = licht_auf_kante(515, 180) + schatten(470, 92)
    s += (f'<polygon points="{x0},{oben} {x1},{oben} {x1},{unten} {x0},{unten}" '
          'fill="url(#block-vorn)" filter="url(#stein)"/>\n')
    s += (f'<polygon points="{x0},{oben} {x0 + tiefe},{oben - 26} {x1 + tiefe},{oben - 26} {x1},{oben}" '
          'fill="url(#block-oben)" filter="url(#stein)"/>\n')
    s += (f'<polygon points="{x1},{oben} {x1 + tiefe},{oben - 26} {x1 + tiefe},{unten - 26} {x1},{unten}" '
          'fill="url(#block-seite)" filter="url(#stein)"/>\n')
    return s


def szene(objekt):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">\n'
            f'<defs>{DEFS}</defs>\n' + grund() + objekt() +
            # zweiter, schwacher Strahl über dem Objekt, damit es im Licht steht
            '<polygon points="660,-60 660,40 300,260 250,240" fill="url(#strahl)" filter="url(#weich)" opacity="0.5"/>\n'
            f'<rect width="{W}" height="{H}" filter="url(#korn)"/>\n</svg>\n')


SZENEN = [('heute', kugel), ('todos', steinstapel), ('einstellungen', block)]

ziel = sys.argv[1] if len(sys.argv) > 1 else 'assets/bilder'
os.makedirs(ziel, exist_ok=True)
for name, objekt in SZENEN:
    pfad = os.path.join(ziel, f'{name}.svg')
    with open(pfad, 'w') as f:
        f.write(szene(objekt))
    print(name, os.path.getsize(pfad), 'Bytes')
