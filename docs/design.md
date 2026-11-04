# Design

## Richtung
„Stein & Licht“ (Vorlage: `docs/vorlagen/design-stein-licht.webp`, nur das Design, nicht die Inhalte).
Dunkel, neutrales Graphit, grau-weißlich, premium und ruhig. Elegante Serifenschrift für Titel und Werte,
kursive Untertitel, kleine Labels in gesperrten Großbuchstaben, kurzer Strich unter dem Titel.
Akzent ist ein warmes Elfenbein. Jeder Bereich hat eine gedämpfte eigene Farbe, die nur als ganz leichter
Schimmer im Hintergrund auftaucht; erkennbar ist der Bereich vor allem am eigenen Bild oben.
Nicht japanisch, nicht orange/gold.

## Tokens (Startwerte, alles in `src/styles/tokens.css`)
| Token | Wert | Verwendung |
|---|---|---|
| `--bg` | #151515 | Hintergrund (neutrales Graphit) |
| `--surface` | rgba(255,255,255,0.05) | Glas-Karten (mit Unschärfe dahinter) |
| `--surface-2` | rgba(255,255,255,0.09) | Hover, Eingabefelder |
| `--glass` | rgba(28,28,28,0.74) | dichteres Glas: Tab-Leiste, Seitenleiste, Modal |
| `--line` | rgba(255,255,255,0.10) | 1px-Linien und Rahmen |
| `--text` | #F3F1EC | Haupttext (leicht warmes Weiß) |
| `--text-2` | #9B978F | Nebentext (warmes Grau) |
| `--accent` | #E9E3D7 | Elfenbein: Labels, Strich, Symbole, aktiv, erledigt (Haken gefüllt), Hauptknopf |
| `--accent-ink` | #151515 | Schrift/Haken auf Elfenbein |
| `--accent-2` | #7A5CFF | sparsam: Quiz (noch offen, ob es bleibt) |
| `--warn` | #FF5C7A | überfällig, Rückfall |
| `--farbe-standard` | #CFCBC4 | Bereich ohne eigene Farbe |
| `--farbe-heute` | #E3CDBA | Morgenlicht |
| `--farbe-todos` | #BCCBBE | Salbei |
| `--farbe-einstellungen` | #C6C1D8 | Flieder-Grau |
| `--farbe-physio` | #B5C6D6 | Nebelblau |
| `--schimmer` | 16% | Stärke des Lichtscheins oben (ganz leicht) |
| `--bereich` | (automatisch) | Farbe des aktiven Bereichs; `shell.js` setzt `var(--farbe-<id>)`, Wechsel blendet über |
| `--radius` | 14px | Karten |
| `--blur` | 24px | Unschärfe hinter Glas-Flächen |
| `--font` | -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif | Systemschrift, kostenlos |
| `--font-serif` | ui-serif, "New York", "Iowan Old Style", Georgia, serif | Titel, Werte, kursive Untertitel (Apple „New York“, schon auf den Geräten) |
| `--space-1` … `--space-7` | 4 / 8 / 12 / 16 / 24 / 32 / 48 px | Abstände, immer aus dieser Reihe |
| `--fs-small` | 13px | Nebentext, Beschriftungen |
| `--fs-normal` | 16px | Fließtext, Eingaben (verhindert Zoom auf dem iPhone) |
| `--fs-title` | 20px | Überschriften in Karten und Modals |
| `--fs-large` | 28px | Seitentitel |
| `--fs-display` | 48px | großer Seitentitel im Kopfbild |
| `--fs-label` | 11px | kleine Labels in Großbuchstaben |
| `--sperrung` | 0.18em | Buchstabenabstand für Labels und Markenzeile |
| `--duration` | 200ms | Dauer aller Animationen |
| `--duration-slow` | 600ms | Farbwechsel beim Bereichswechsel |
| `--ease` | cubic-bezier(0.2, 0.8, 0.2, 1) | sanftes Abbremsen am Ende |
| `--tap` | 44px | Mindesthöhe/-breite für Tippflächen |
| `--sidebar` | 240px | Breite der Seitenleiste auf dem Mac |

Alle Farben stehen in einer einzigen Datei (`tokens.css`) und lassen sich dort tauschen.
Neuer Bereich mit eigener Farbe: Token `--farbe-<id>` ergänzen (id wie beim Router).

## UI-Bausteine (`src/ui/`)
Stile: `src/styles/components.css` (Karte, Symbol, Liste, Knopf, Eingabefeld, Tabs),
`checkbox.css`, `modal.css`, `kopfbild.css`, `kachel.css` (Kacheln + Chips), `schrift.css`
(Klassen `.marke` = „SYSTEM 0“-Zeile, `.label` = kleines Label in Großbuchstaben, `.strich` = kurzer Strich) –
eigene Dateien, damit keine über 200 Zeilen wächst.
Jede Datei liefert eine Funktion, die ein fertiges Element zurückgibt. Ansehen: `bausteine.html`.

| Datei | Funktion | Kurz |
|---|---|---|
| `dom.js` | `el(tag, props, kinder)` | Hilfsfunktion zum Bauen von Elementen |
| `card.js` | `card({ title, children })` | Fläche mit Rahmen, optional Überschrift |
| `list.js` | `list(rows)`, `listRow({ title, sub, start, end, onClick })`, `listItem(inhalt)` | Zeilen mit Trennlinien; `listItem` für freien Inhalt, z. B. Checkbox mit Text (ganze Zeile antippbar) |
| `checkbox.js` | `checkbox({ label, checked, onChange })` | runder Haken, erledigt weiß gefüllt, mit Animation |
| `button.js` | `button({ text, variant, onClick })` | `variant: 'primary'` = weiß (Hauptaktion), `'ghost'` = ohne Hintergrund |
| `input.js` | `input({ label, placeholder, value, type, onInput })` | Eingabefeld mit Beschriftung |
| `modal.js` | `modal({ title, content, actions })` → `{ open, close }` | iPhone: von unten, Mac: mittig |
| `tabs.js` | `tabs({ items, active, onChange })` | Umschalter, aktiver Tab mit weißer Linie |
| `kopfbild.js` | `kopfbild({ titel, bild, spruch })` | Seitenkopf: Bild vollflächig dahinter (unten/links weich ausgeblendet), großer Serifentitel, Strich, kursiver Spruch |
| `kachel.js` | `kacheln([…])`, `kachel({ symbol, titel, wert, text, gross, onClick, children })` | Glas-Kacheln im 2er-Raster; klein = Symbol oben, `gross` = ganze Breite mit Symbol links; Symbol im abgerundeten Quadrat, `titel` als Label, `wert` in Serifenschrift |
| `chips.js` | `chips({ items, active, onChange, aktionen })` | waagrechte Kapsel-Leiste (wischbar, Serifenschrift); gewählt = Elfenbein gefüllt; `aktionen` = gestrichelte Chips, die nur etwas auslösen |
| `symbol.js` | `symbol(name)` | dünnes Linien-Symbol (24 px, Textfarbe), z. B. `heute`, `todos`, `einstellungen`, `mehr`, `abgleich`, `export`, `konto` |

Navigation (Tab-Leiste, Seitenleiste): Stile in `src/styles/nav.css`, beide aus Glas. Aktiver Eintrag:
Symbol und Text in Elfenbein; Tab-Leiste mit kurzem Strich darunter, Seitenleiste mit Linie links.
Markenzeile „SYSTEM 0“: auf dem iPhone oben über jeder Seite (`shell.js`), auf dem Mac oben in der Seitenleiste.
Lichtschein oben: `.shell::before` in `src/styles/app.css`.

## Kopfbilder und Sprüche
- Bilder in `assets/bilder/<bereich>.svg`, selbst gezeichnet mit `werkzeuge/kopfbilder.py`
  (Aufruf im Repo-Ordner: `python3 werkzeuge/kopfbilder.py assets/bilder`). Japanisch inspiriert, zart,
  ohne Hintergrund, in der Bereichsfarbe; Format 360 × 240, Motiv rechts der Mitte.
- Heute: Kirschblüten vor der Morgensonne · To-dos: Bambus vor einem Ensō (Pinselkreis) ·
  Einstellungen: Glyzinie im Mondlicht · Physio (kommt mit dem Modul): Ai-Blau, Bewegung/Training
- Sprüche: `src/core/sprueche.js`, 20 japanische Sprichwörter mit deutscher Übersetzung.
  `spruchDesTages(versatz)` wechselt um Mitternacht; jeder Bereich nimmt einen eigenen `versatz`,
  damit nicht überall derselbe Spruch steht.

## Regeln
- Elfenbein ist der Akzent für Zustände und kleine Details (Haken, Fortschritt, aktiver Tab, Labels, Strich). Bereichsfarben nur als leichter Schimmer, nie als Fläche.
- Serifenschrift für Titel und große Werte, Systemschrift für Text, Listen und Eingaben.
- Linien statt Schatten. Viel Luft. Wenige Schriftgrößen.
- Sanfte, kurze Animationen (150–250 ms). Respektiert „Bewegung reduzieren“ des Geräts.
- iPhone: Tippflächen mindestens 44 px, Rand um die Notch/Home-Leiste beachten.
