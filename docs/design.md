# Design

## Richtung
„Glas-Dashboard“ (seit 08.11.2026, Vorlage: Reel „Glassy Dashboard“ von Lukas; Musterseite `muster/glas.html`).
Immer hell. Warmer Hintergrund aus weichen Farbwolken mit feinem Korn, darauf Milchglas-Karten mit weißem Rand,
großen Rundungen und weichem, farbig getöntem Schatten. Große Zahlen, Systemschrift, Pillen-Knöpfe.
Alles hängt an **einer** Akzentfarbe (Standard Koralle `#E8664F`), wählbar in Einstellungen → Akzentfarbe.
Hintergrund, Hero-Flächen, Haken, Fortschritt und Schatten werden per `color-mix` daraus gemischt.
„Stein & Licht“ (Kopfbilder, Serifenschrift, Elfenbein) ist pausiert; die Fotos liegen noch in `assets/bilder/`.

## Tokens (alles in `src/styles/tokens.css`)
| Token | Wert | Verwendung |
|---|---|---|
| `--accent` | #E8664F (wählbar) | Akzent: aktiv, Haken, gewählter Chip, Hero-Flächen, Logo. Als `@property` angemeldet → Wechsel blendet 700 ms über |
| `--akzent-hell` / `--akzent-tief` | aus `--accent` gemischt | Verläufe (Hero, Logo) |
| `--accent-ink` | #FFFFFF | Schrift/Haken auf Akzent |
| `--bg` | Akzent 16 % + #FBF4EF | Grundton hinter den Farbwolken (`body::before` in `base.css`) |
| `--text` / `--text-2` / `--text-3` | #2B1E19 / 64 % / 42 % | Text, Nebentext (≈4,5:1 auf Glas), ganz leise |
| `--dunkel` | #21170F | dunkle Pille: Hauptknopf, gewählter Tab |
| `--surface` / `--surface-2` | Weiß 42 % / 66 % | Glas-Flächen / Hover, Eingabefelder |
| `--glass` | Weiß 50 % | Leisten |
| `--glas-verlauf` | Weiß 58 % → 30 % | Hintergrund von Karte, Kachel, Leisten, Listen-Gruppen |
| `--glas-rand` / `--glas-kante` | Weiß 86 % / 0,5 px | feiner Lichtrand (Haarlinie) an Glas |
| `--line` | Text 9 % | Trennlinien in Listen |
| `--schatten` / `--schatten-hoch` | Innenlicht oben + zarter Innenrand, außen naher + weicher, ruhiger Schatten (Akzent nur leicht) | Glas in Ruhe / beim Anheben |
| `--blur` | 22px | Unschärfe hinter Glas (mit `saturate(160%)`) |
| `--radius` / `--radius-gross` / `--radius-klein` | 16 / 22 / 10 px | Felder & Popover / Karten & Leisten / Plättchen & Tage; Pillen 999px. Keine festen px-Radien in Modulen |
| `--warn` / `--gut` | #D9364F / #3E9B6E | überfällig / Trend nach oben |
| `--font` | System (SF Pro) | einzige Schrift |
| `--space-1` … `--space-7` | 4 / 8 / 12 / 16 / 24 / 32 / 48 px | Abstände |
| `--fs-label` … `--fs-display` | 11 / 13 / 16 / 19 / 26 / 34 px | Schriftgrößen (`--fs-display` = große Zahlen) |
| `--fs-seite` | 42 px (iPhone 32) | Seitentitel, Gewicht 650, Abstand −0,035em |
| `--sperrung` | 0.12em | kleine Labels in Großbuchstaben |
| `--duration` / `--duration-slow` | 200 / 700 ms | Animationen / Akzent-Wechsel |
| `--ease` / `--feder` | Abbremsen / leichtes Nachfedern | Bewegung |
| `--tap` | 44px | Tippflächen |
| `--knopf` | 44 px (Maus: 40 px) | eine Höhe für `.btn` und Heute-Pillen; mehrere Knöpfe nebeneinander (`.knopfreihe`, Fenster-Fuß; iPhone gleich breit) |
| `--sidebar` / `--sidebar-zu` | 236 / 72 px | Seitenleiste beim Drüberfahren / in Ruhe |

`.hell` (Mindmap-Overlay): deckendes Warmweiß statt Glas, gleiche Token-Namen.

## Eine Farbe + Unterton (10.11.2026)
Alles bleibt in **einer** Farbe (Lukas: einheitlich, edel, nicht überladen). Keine Farben je Bereich.
Bereiche erkennt man an Linien-Symbol (`ui/symbol.js`, auf weißem Glas-Plättchen) und Form (Ring, Zahl, Liste).
**Unterton** (optional, Einstellung `unterton`, synchronisiert, `core/akzent.js`): zweite, leise Note derselben Farbe.
`--unterton` (ohne Wahl = `--accent`) färbt das Ende der Verläufe (`--akzent-tief`: Hero, Logo, Serie-Kachel) und zwei
Hintergrund-Wolken. Bei Weiß/Graphit ist er die einzige Farbe (`--bereich` = Unterton: Ringe, Kurven, Kalender-Tag).
Vorgaben `UNTERTOENE`: Kein, Gold, Rosé, Kupfer, Salbei, Nebel, Flieder. Wahl im Akzent-Popover (Heute) und in Einstellungen.
`--bereich`/`--bereich-tief` = Detailfarbe auf Heute (Akzent bzw. Unterton), kein eigener Wert je Bereich mehr.

## Akzentfarbe
Neutrale Akzente „Weiß“ und „Graphit“ (Werte `weiss`/`schwarz`): `--accent` wird Graphit #2E3035 (Haken, Chips, Knöpfe),
`data-akzent` am `<html>` schaltet Flächen in `akzent-neutral.css` um. Weiß = helles Papier #F3F2EF, weiße Hero-Karte mit
dunkler Schrift, Hintergrund mit zartem Unterton. Graphit = warmes Steingrau #E2E1DE, Hero dunkel (#5C5E64 → #16171A),
kein reines Schwarz. Kontrast geprüft: Text 13–15:1, Nebentext ≈4,5:1, Weiß auf Hero-Graphit 13:1.
`src/core/akzent.js`: `akzentSetzen(farbe)` speichert als Einstellung `akzent` (synchronisiert) und lokal;
`akzentLaden()` beim Start (erst lokal = kein Farbsprung, dann die synchronisierte). 9 Vorgaben in `AKZENT_FARBEN` (Weiß, Graphit + 7 Farben)
plus freier Farbwähler (Kachel `src/app/akzent-kachel.js`, Stil `farbkreise.css`).

## UI-Bausteine (`src/ui/`)
Stile: `src/styles/components.css` (Karte, Symbol, Liste, Knopf, Eingabefeld, Tabs),
`checkbox.css`, `modal.css`, `kopfbild.css`, `kachel.css` (Kacheln + Chips), `schrift.css`
(Klassen `.marke` = „SYSTEM 0“-Zeile, `.label` = kleines Label in Großbuchstaben, `.strich` = kurzer Strich) –
eigene Dateien, damit keine über 200 Zeilen wächst.
Glas-Fläche für `.card` und `.kachel` steht gemeinsam in `components.css`.
Jede Datei liefert eine Funktion, die ein fertiges Element zurückgibt. Ansehen: `bausteine.html`.

| Datei | Funktion | Kurz |
|---|---|---|
| `dom.js` | `el(tag, props, kinder)` | Hilfsfunktion zum Bauen von Elementen |
| `card.js` | `card({ title, children })` | Fläche mit Rahmen, optional Überschrift |
| `list.js` | `list(rows)`, `listRow({ title, sub, start, end, onClick })`, `listItem(inhalt)` | Zeilen mit Trennlinien; `listItem` für freien Inhalt, z. B. Checkbox mit Text (ganze Zeile antippbar) |
| `checkbox.js` | `checkbox({ label, checked, onChange })` | runder Haken, erledigt im Akzent gefüllt, mit Animation |
| `button.js` | `button({ text, variant, onClick })` | Pille; `variant: 'primary'` = dunkle Pille (Hauptaktion), `'ghost'` = ohne Hintergrund |
| `input.js` | `input({ label, placeholder, value, type, onInput })` | Eingabefeld mit Beschriftung |
| `modal.js` | `modal({ title, content, actions })` → `{ open, close }` | iPhone: von unten, Mac: mittig |
| `tabs.js` | `tabs({ items, active, onChange })` | Pillen-Umschalter, aktiver Tab = dunkle Pille |
| `kopfbild.js` | `kopfbild({ titel, symbol, abschnitt, werte })` | Seitenkopf als Glas-Kopfleiste mit Kennzahlen; `kopf.werte(neue)` tauscht sie |
| `kachel.js` | `kacheln([…])`, `kachel({ symbol, titel, wert, text, gross, onClick, children })` | Glas-Kacheln im 2er-Raster; klein = Symbol oben, `gross` = ganze Breite mit Symbol links; Symbol im weißen Kreis (38 px), `titel` als Label, `wert` groß (26 px, 600), `text` klein; antippbar = hebt sich beim Drüberfahren; Zustände `kachel--laeuft` (Symbol dreht), `kachel--warn` |
| `chips.js` | `chips({ items, active, onChange, aktionen })` | waagrechte Kapsel-Leiste (wischbar); gewählt = Akzent gefüllt; `aktionen` = gestrichelte Chips, die nur etwas auslösen |
| `abschnitt.js` | `abschnitt({ titel, zahl, symbol, tag })` | Abschnitts-Überschrift als Glas-Kasten (Symbol, Label, Zahl rechts); in Karten ohne Schatten (`schrift.css`). Ersetzt lose `.label`-Überschriften (To-dos, Kalender, Gewohnheiten, Training, Insta) |
| `symbol.js` | `symbol(name)` | dünnes Linien-Symbol (24 px, Textfarbe), z. B. `heute`, `todos`, `einstellungen`, `mehr`, `abgleich`, `export`, `konto`, `physio`, `suche` |

Navigation (`src/app/nav.js`, Stil `nav.css`): iPhone = schwebende Glas-Kapsel unten, nur Symbole.
Mac = schwebende Glas-Seitenleiste links mit Logo „0“ (Akzent-Verlauf) und „System 0“; immer schmal (72 px),
klappt beim Drüberfahren (bzw. Tastatur-Fokus) sofort auf 236 px auf: über dem Inhalt, auf Heute schiebt sie ihn.
Zustand als Klasse `shell--leiste-offen` (nav.js `leisteKlappen`), kein `:hover/:has` (Safari). Kein Klapp-Knopf mehr.
Aktiver Eintrag: weiße Pille (`.nav__zeiger`), gleitet ruhig ohne Nachfedern (nur senkrecht, Breite per CSS).
Seitenleiste wie `docs/vorlagen/dashboard-glas.png`: Marke „System 0 / Lukas“, Suchfeld (Glas-Pille), Abschnitte
ALLTAG / KÖRPER & KOPF / SYSTEM (10 px, gesperrt, `--text-3`), Zahl als Akzent-Pille rechts am Eintrag, unten Kreis „L“ mit
Status-Punkt + „Lukas · synchronisiert“. Eingeklappt verschwinden Texte, Abschnitts-Namen und Zahlen.
Seitenkopf (`kopfbild`, Runde 2, Variante A): Glas-Kopfleiste mit Symbol-Plättchen (48 px), Abschnitt (ALLTAG …) über dem Titel
(`--fs-display`, 650), rechts Kennzahlen (`bereich.kennzahlen()` → `[{ zahl, text }]`, je Modul `kennzahlen.js`, frisch bei `daten`),
durch Haarlinien getrennt; iPhone: Kennzahlen unter dem Titel. **Charakter je Bereich** (`kopf-muster.css`, eine Farbe):
To-dos Notizblock-Linien + Haken-Spalte, Kalender Raster, Routinen Zeitstrahl, Training Streifen + kräftige Zahlen, Physio Höhenlinien,
Visionen Strahlen, Affirmationen mittig + Serife kursiv, Gewohnheiten Punkte, Quiz Punkt-Raster, Bücher Leinen + Buchrücken + Serife,
Insta Kachelraster, Einstellungen ohne Muster (Monospace). Muster: `muster/runde2.html`.
Karten-/Fenstertitel 650, `--fs-title`, eng;
Karten auf Heute mit kleinem Bereichs-Symbol im Titel.
Ein `bild` wird zurzeit nicht übergeben (`shell.js`), die Bereiche behalten ihre Bildlisten für später.
Listen-Gruppen in To-dos und Kalender (`.todo-gruppe`, `.termin-gruppe`) sind Glaskarten mit `abschnitt`-Kasten als Kopf.

## Kopfbilder und Sprüche (pausiert)
- Fotos von Lukas (Bild-KI), je Bereich drei Varianten: `assets/bilder/<bereich>-1…3.webp` (1536 × 1024, je ca. 80–125 KB).
  Der Bereich gibt sie beim Anmelden als Liste an (`bild: [...]`); `src/app/kopfbilder.js` wählt täglich eine andere
  (`heutigesBild`) und lädt die Fotos aller Bereiche schon beim Start vor (`kopfbilderVorladen`, mit `decode`).
  Kein Einblenden beim Seitenwechsel: das Bild steht sofort da (vorher sichtbarer „Klick“).
- Motiv: Stein im schrägen Lichtstrahl von rechts oben, fast schwarzer Hintergrund, nur Grau/Weiß,
  Objekt im rechten Drittel, links Platz für den Titel. Heute: Kugel · To-dos: Steinstapel · Einstellungen: Steinquader.
- Einbau ohne Bildkante: Das Foto ist Hintergrundbild eines `div` mit `background-color: var(--bg)` und
  `background-blend-mode: lighten` – der fast schwarze Bildgrund wird so genau zur Seitenfarbe. Dazu weiche Maske
  an allen Rändern (links ganz auf 0). `mix-blend-mode` auf einem `<img>` hat in Lukas' Browser nicht funktioniert
  (dunkles Rechteck mit Kante), deshalb nicht verwenden.
- Prompt für neue Bilder (nur das Objekt austauschen, Rest gleich lassen):
  „Minimalist dark still life photograph, [OBJEKT] on a rough dark stone ledge, placed in the right third of the frame,
  a soft diagonal beam of cool white light from the upper right, deep near-black background, left two thirds empty and dark,
  monochrome grey and white tones only, no gold, no orange, no text, subtle film grain, cinematic, high-end, 3:2 landscape“
- Sprüche: `src/core/sprueche.js`, 20 kurze deutsche Sätze (eigene, keine Zitate).
  `spruchDesTages(versatz)` wechselt um Mitternacht; jeder Bereich nimmt einen eigenen `versatz`.

## Regeln
- Eine Akzentfarbe (+ optional ein Unterton derselben Stimmung), sonst Weiß-Glas, warmes Fast-Schwarz und die Farbwolken. Keine weiteren bunten Farben.
- Systemschrift überall; große Zahlen und Titel mit Gewicht 600 und leicht engem Buchstabenabstand.
- Glas = `--glas-verlauf` + Rand `var(--glas-kante) solid var(--glas-rand)` + `--schatten` + Unschärfe. Trennlinien nur in Listen.
- Ecken fein statt „weich-groß“ (Lukas, 10.11.2026): nur die drei Radius-Tokens, innen kleiner als außen.
- Kleine Animationen nur über `transform`/`opacity` (flüssig auf dem iPhone): Seiteninhalt blendet gestaffelt ein,
  antippbare Kacheln heben sich beim Drüberfahren (`--feder`), alles Antippbare gibt beim Drücken kurz nach.
- Respektiert „Bewegung reduzieren“ des Geräts (`base.css`).
- iPhone: Tippflächen mindestens 44 px, Rand um Notch/Home-Leiste beachten; oben ein dunklerer Streifen, damit die weiße Statusleiste lesbar bleibt.
