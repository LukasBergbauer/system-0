# Erzeugt aus muskeln.txt die Quizfragen (je Muskel: Ursprung, Ansatz, Funktion, Innervation einzeln).
# Aufruf im Repo-Ordner: python3 tools/quiz/muskeln.py
# IDs hängen am Muskelnamen (mus-<name>-u/a/f/i) und bleiben beim Neuerzeugen gleich. Falsche Antworten fest per Zufall mit Startwert.
import json, random, re
from pathlib import Path

HIER = Path(__file__).parent
ZIEL = HIER.parent.parent / 'src/module/wissen/fragen/muskeln.json'
NERVEN = {
    'arm': ['N. axillaris', 'N. radialis', 'N. medianus', 'N. ulnaris', 'N. musculocutaneus', 'N. suprascapularis', 'N. thoracodorsalis',
            'N. thoracicus longus', 'N. dorsalis scapulae', 'Nn. pectorales medialis et lateralis', 'N. subscapularis', 'N. accessorius'],
    'bein': ['N. femoralis', 'N. obturatorius', 'N. tibialis', 'N. fibularis communis', 'N. fibularis profundus', 'N. fibularis superficialis',
             'N. gluteus superior', 'N. gluteus inferior', 'N. plantaris medialis', 'N. plantaris lateralis'],
    'rumpf': ['Nn. intercostales', 'N. iliohypogastricus', 'N. ilioinguinalis', 'N. phrenicus', 'Rr. dorsales der Spinalnerven',
              'N. pudendus', 'N. subcostalis', 'N. genitofemoralis', 'N. obturatorius', 'N. thoracodorsalis'],
    'kopfhals': ['N. accessorius', 'N. facialis', 'N. phrenicus', 'N. suboccipitalis', 'Rr. dorsales der Spinalnerven',
                 'Rr. ventrales der Zervikalnerven', 'N. mandibularis (V3)', 'N. hypoglossus', 'N. dorsalis scapulae'],
}
# Nerven, die zusammenhängen (Ast/Stamm): als falsche Antwort ausgeschlossen, sonst wären sie halb richtig.
VERWANDT = [('Rr. dorsales', 'suboccipitalis'), ('Rr. ventrales', 'Plexus cervicalis'), ('fibularis communis', 'fibularis')]

muskeln = []
for zeile in (HIER / 'muskeln.txt').read_text().splitlines():
    if not zeile.strip() or zeile.startswith('#'): continue
    r, g, n, u, a, f, i, s, *m = [x.strip() for x in zeile.split('|')]
    muskeln.append(dict(r=r, g=g, n=n, u=u, a=a, f=f, i=i, s=s, m=(m or [''])[0]))

def slug(t):
    t = t.lower().replace('ä', 'ae').replace('ö', 'oe').replace('ü', 'ue').replace('ß', 'ss')
    return re.sub(r'[^a-z0-9]+', '', t)

def passt(x, richtig, schon):
    lx, lr = x.lower(), richtig.lower()
    return x and lx not in lr and lr not in lx and all(x.lower() not in y.lower() and y.lower() not in x.lower() for y in schon)

def falsche(richtig, kandidaten, rnd):
    schon = []
    for liste in kandidaten:
        liste = list(dict.fromkeys(liste))
        rnd.shuffle(liste)
        for x in liste:
            if len(schon) < 3 and passt(x, richtig, schon): schon.append(x)
    if len(schon) < 3: raise SystemExit(f'Zu wenig falsche Antworten für: {richtig}')
    return schon

def nerven(m, rnd):
    i = m['i']
    pool = [x for x in NERVEN[m['r']] if x not in i and not any((a in x and b in i) or (b in x and a in i) for a, b in VERWANDT)]
    return falsche(m['i'], [pool], rnd)

fragen = []
for m in muskeln:
    plural = m['n'].startswith('Mm.')
    der, den = ('die', 'die') if plural else ('der', 'den') if m['n'].startswith('M.') else ('das', 'das')
    gleich = [x for x in muskeln if x is not m and x['g'] == m['g']]
    region = [x for x in muskeln if x is not m and x['r'] == m['r'] and x['g'] != m['g']]
    erkl = f"{m['n']} – Ursprung: {m['u']}. Ansatz: {m['a']}. Funktion: {m['f']}. Innervation: {m['i']} ({m['s']})."
    if m['m']: erkl += f" Merke: {m['m']}"
    texte = {
        'u': (f"Wo {'entspringen' if plural else 'entspringt'} {der} {{}}?", m['u'], [[x['u'] for x in gleich], [x['u'] for x in region]]),
        'a': (f"Wo {'setzen' if plural else 'setzt'} {der} {{}} an?", m['a'], [[x['a'] for x in gleich], [x['a'] for x in region]]),
        'f': (f"Welche Funktion {'haben' if plural else 'hat'} {der} {{}}?", m['f'], [[x['f'] for x in region]]),
        'i': (f"Welcher Nerv versorgt {den} {{}}?", m['i'], None),
    }
    for k, (frage, richtig, kand) in texte.items():
        fid = f"mus-{slug(m['n'].split(' ', 1)[1] if m['n'].startswith('M') and '. ' in m['n'] else m['n'])}-{k}"  # ohne „M.“/„Mm.“
        rnd = random.Random(fid)
        falsch = nerven(m, rnd) if kand is None else falsche(richtig, kand, rnd)
        fragen.append({'id': fid, 'f': frage.format(m['n']), 'a': [richtig, *falsch], 'e': erkl})

ZIEL.write_text('[\n' + ',\n'.join(json.dumps(q, ensure_ascii=False) for q in fragen) + '\n]\n')
print(f'{len(muskeln)} Muskeln, {len(fragen)} Fragen → {ZIEL}')
