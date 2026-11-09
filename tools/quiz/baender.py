# Erzeugt aus baender.txt die Quizfragen (je Band: Verlauf, Funktion, Klinik – soweit eingetragen).
# Aufruf im Repo-Ordner: python3 tools/quiz/baender.py
# IDs hängen am Bandnamen (ban-<name>-v/f/k) und bleiben beim Neuerzeugen gleich.
import json, random, re
from pathlib import Path

HIER = Path(__file__).parent
ZIEL = HIER.parent.parent / 'src/module/wissen/fragen/baender.json'
AKK = {'das': 'das', 'die': 'die', 'der': 'den'}

baender = []
for zeile in (HIER / 'baender.txt').read_text().splitlines():
    if not zeile.strip() or zeile.startswith('#'): continue
    r, g, art, n, v, f, k, *m = [x.strip() for x in zeile.split('|')]
    baender.append(dict(r=r, g=g, art=art, n=n, v=v, f=f, k=k, m=(m or [''])[0]))

def slug(t):
    t = t.lower().replace('ä', 'ae').replace('ö', 'oe').replace('ü', 'ue').replace('ß', 'ss')
    return re.sub(r'[^a-z0-9]+', '', re.sub(r'\(.*?\)', '', t))

def passt(x, richtig, schon):
    lx, lr = x.lower(), richtig.lower()
    return x and lx not in lr and lr not in lx and all(lx not in y.lower() and y.lower() not in lx for y in schon)

def falsche(richtig, kandidaten, rnd):
    schon = []
    for liste in kandidaten:
        liste = list(dict.fromkeys(liste))
        rnd.shuffle(liste)
        for x in liste:
            if len(schon) < 3 and passt(x, richtig, schon): schon.append(x)
    if len(schon) < 3: raise SystemExit(f'Zu wenig falsche Antworten für: {richtig}')
    return schon

fragen = []
for b in baender:
    plural = b['n'].startswith('Ligg.')
    gleich = [x for x in baender if x is not b and x['g'] == b['g']]
    region = [x for x in baender if x is not b and x['r'] == b['r'] and x['g'] != b['g']]
    wer = f"{b['art']} {b['n']}"
    erkl = f"{b['n'][0].upper()}{b['n'][1:]} – Verlauf: {b['v']}. Aufgabe: {b['f']}." + (f" Klinik: {b['k']}." if b['k'] else '')
    if b['m']: erkl += f" Merke: {b['m']}"
    texte = {
        'v': (f"Wo {'verlaufen' if plural else 'verläuft'} {wer}?", 'v'),
        'f': (f"Welche Aufgabe {'haben' if plural else 'hat'} {wer}?", 'f'),
        'k': (f"Was ist klinisch typisch für {AKK[b['art']]} {b['n']}?", 'k'),
    }
    for k, (frage, feld) in texte.items():
        if not b[feld]: continue
        fid = f"ban-{slug(b['n'])}-{k}"
        rnd = random.Random(fid)
        kand = [[x[feld] for x in gleich if x[feld]], [x[feld] for x in region if x[feld]]]
        fragen.append({'id': fid, 'f': frage, 'a': [b[feld], *falsche(b[feld], kand, rnd)], 'e': erkl})

ZIEL.write_text('[\n' + ',\n'.join(json.dumps(q, ensure_ascii=False) for q in fragen) + '\n]\n')
print(f'{len(baender)} Bänder, {len(fragen)} Fragen → {ZIEL}')
