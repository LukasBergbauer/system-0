# Design

## Richtung
Dunkel (Graphit), clean, premium (Vorbilder: Apple Fitness, Revolut). Glas-Flächen, dünne Linien,
Weiß als Akzent. Jeder Bereich hat eine eigene, dezente Farbe (japanisch inspiriert), die nur als
leichter Schimmer auftaucht: Lichtschein oben, Kopfbild, kleine Details. So sieht man immer, wo man ist.

## Tokens (Startwerte, alles in `src/styles/tokens.css`)
| Token | Wert | Verwendung |
|---|---|---|
| `--bg` | #16161A | Hintergrund (Graphit) |
| `--surface` | rgba(255,255,255,0.05) | Glas-Karten (mit Unschärfe dahinter) |
| `--surface-2` | rgba(255,255,255,0.09) | Hover, Eingabefelder |
| `--glass` | rgba(30,30,35,0.72) | dichteres Glas: Tab-Leiste, Seitenleiste, Modal |
| `--line` | rgba(255,255,255,0.10) | 1px-Linien und Rahmen |
| `--text` | #F5F5F7 | Haupttext |
| `--text-2` | #98989F | Nebentext |
| `--accent` | #FFFFFF | Akzent: aktiv, erledigt (Haken weiß gefüllt), Hauptknopf |
| `--accent-ink` | #16161A | Schrift/Haken auf weißem Grund |
| `--accent-2` | #7A5CFF | sparsam: Quiz (noch offen, ob es bleibt) |
| `--warn` | #FF5C7A | überfällig, Rückfall |
| `--farbe-standard` | #C9C9CE | Bereich ohne eigene Farbe |
| `--farbe-heute` | #F2A7BB | Sakura |
| `--farbe-todos` | #9CC5A1 | Matcha |
| `--farbe-einstellungen` | #A99BD6 | Glyzinie |
| `--farbe-physio` | #7FB2E0 | Ai-Blau |
| `--schimmer` | 32% | Stärke des Lichtscheins oben |
| `--bereich` | (automatisch) | Farbe des aktiven Bereichs; `shell.js` setzt `var(--farbe-<id>)`, Wechsel blendet über |
| `--radius` | 14px | Karten |
| `--blur` | 24px | Unschärfe hinter Glas-Flächen |
| `--font` | -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif | Systemschrift, kostenlos |
| `--font-jp` | "Hiragino Mincho ProN", "Yu Mincho", serif | japanische Sprüche (Mincho = Pinsel-Serifenschrift, auf Apple-Geräten vorhanden) |
| `--space-1` … `--space-7` | 4 / 8 / 12 / 16 / 24 / 32 / 48 px | Abstände, immer aus dieser Reihe |
| `--fs-small` | 13px | Nebentext, Beschriftungen |
| `--fs-normal` | 16px | Fließtext, Eingaben (verhindert Zoom auf dem iPhone) |
| `--fs-title` | 20px | Überschriften in Karten und Modals |
| `--fs-large` | 28px | Seitentitel |
| `--duration` | 200ms | Dauer aller Animationen |
| `--duration-slow` | 600ms | Farbwechsel beim Bereichswechsel |
| `--ease` | cubic-bezier(0.2, 0.8, 0.2, 1) | sanftes Abbremsen am Ende |
| `--tap` | 44px | Mindesthöhe/-breite für Tippflächen |
| `--sidebar` | 240px | Breite der Seitenleiste auf dem Mac |

Alle Farben stehen in einer einzigen Datei (`tokens.css`) und lassen sich dort tauschen.
Neuer Bereich mit eigener Farbe: Token `--farbe-<id>` ergänzen (id wie beim Router).

## UI-Bausteine (`src/ui/`)
Stile: `src/styles/components.css` (Karte, Symbol, Liste, Knopf, Eingabefeld, Tabs),
`checkbox.css`, `modal.css`, `kopfbild.css`, `kachel.css` (Kacheln + Chips) – eigene Dateien, damit keine über 200 Zeilen wächst.
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
| `kopfbild.js` | `kopfbild({ titel, bild, spruch: { jp, de } })` | Seitenkopf: zarte Illustration rechts oben (weich auslaufend), Titel, Spruch (japanisch in Bereichsfarbe + deutsch) |
| `kachel.js` | `kacheln([…])`, `kachel({ symbol, titel, wert, text, gross, onClick, children })` | Glas-Kacheln im 2er-Raster; `gross` = ganze Breite; Symbol im runden Feld in Bereichsfarbe |
| `chips.js` | `chips({ items, active, onChange, aktionen })` | waagrechte Kapsel-Leiste (wischbar); gewählt = weiß; `aktionen` = gestrichelte Chips, die nur etwas auslösen |
| `symbol.js` | `symbol(name)` | dünnes Linien-Symbol (24 px, Textfarbe), z. B. `heute`, `todos`, `einstellungen`, `mehr` |

Navigation (Tab-Leiste, Seitenleiste): Stile in `src/styles/nav.css`, beide aus Glas. Aktiver Eintrag:
Symbol und Text weiß; in der Seitenleiste zusätzlich eine Linie links in der Bereichsfarbe.
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
- Weiß ist der Akzent für Zustände (Haken, Fortschritt, aktiver Tab). Bereichsfarben nur als Schimmer, nie als volle Fläche.
- Linien statt Schatten. Viel Luft. Wenige Schriftgrößen.
- Sanfte, kurze Animationen (150–250 ms). Respektiert „Bewegung reduzieren“ des Geräts.
- iPhone: Tippflächen mindestens 44 px, Rand um die Notch/Home-Leiste beachten.
