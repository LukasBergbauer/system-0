# Design

## Richtung „Glas, kräftig“ (seit 25.11.2026, Feedback Lukas: „Klar“ wirkte bedrückend)
Ziel: motivierend. Glas-Look von vorher zurück, dazu mehr Kontrast mit der Akzentfarbe. Funktionale Verbesserungen aus „Klar“ bleiben.
- **Grund:** weiche Farbwolken aus Akzent und Unterton (`base.css`), Weiß/Graphit eigene Wolken (`akzent-neutral.css`).
- **Karten:** Glas (`--glas-verlauf`, Lichtrand, akzent-getönter Schatten, `backdrop-filter`); antippbare Karten heben sich beim Drüberfahren.
- **Akzent kräftig:** `--akzent-flaeche` (Verlauf hell → Akzent → tief) für Tagesfeld (Heute), Seitenkopf, aktiven Navigations-Eintrag,
  Hauptknopf (`.btn--primary`, „Neu“), gewählten Kalendertag, fertige Routine. Symbole, große Zahlen, Ringe, Balken in Akzent;
  Abschnitts-Zahl als Akzent-Pille (Überfällig in `--warn`). `--akzent-leise` = Spur von Balken.
- **Seitenkopf** (`ui/kopfbild.js`, `kopfbild.css`): flaches Akzent-Band (104 px, iPhone kompakt) mit Symbol-Plättchen, Titel, rechts Kennzahlen.
- **Heute:** festes Tagesfeld oben (`docs/module/heute.md`), darunter Glas-Felder.
- **Eine Ebene bleibt:** Abschnitts-Überschriften sind eine Zeile ohne Kasten; Listen-Gruppen (To-dos, Kalender) sind Glaskarten.
- **Bewegung:** Seiteninhalt blendet 360 ms ein, Heute-Felder leicht gestaffelt (≤ 120 ms).

## Frühere Richtungen (abgelöst)
- „Klar“ (24.11.2026): Papier, weiße Karten ohne Unschärfe, Akzent nur sparsam – wirkte zu flach/grau. Stand im Git-Verlauf (Commits 840686b–b63cdaf).
- „Glas-Dashboard“ (08.–23.11.2026): Vorlage Reel „Glassy Dashboard“, Farbband-Kopf mit Muster je Bereich, Hero „Woche“ auf Heute.

## Tokens (alles in `src/styles/tokens.css`)
| Token | Wert | Verwendung |
|---|---|---|
| `--accent` | #E8664F (wählbar) | Haken, aktiver Chip, Fortschritt, „+“, Haupt-Zahl. `@property` → Wechsel blendet über |
| `--bg` | Akzent 16 % + #FBF4EF | Grundton; `body::before` legt Farbwolken aus Akzent und Unterton darüber |
| `--glas-verlauf` (= `--karte`) | Weiß 62 → 34 % | Karten, Kacheln, Gruppen (mit Unschärfe) |
| `--akzent-flaeche` / `--akzent-leise` | Verlauf hell → Akzent → tief / Akzent 14 % | kräftige Flächen / Spur von Balken |
| `--glas-rand` / `--glas-kante` | Weiß 86 % / 0,5 px | Lichtrand um Karten |
| `--surface` / `--surface-2` | Weiß 42 % / 66 % | Zeilen in Karten / Knöpfe, Eingabefelder |
| `--glass` + `--blur` | Weiß 55 % + 22 px | Navigation, Fenster, Popover; Blur auch auf Karten |
| `--schatten` / `--schatten-hoch` | Innenlicht + weicher Schatten in Akzent-Tönung / beim Anheben | |
| `--text` / `--text-2` / `--text-3` | #2B1E19 / 64 % / 42 % | Text, Nebentext, ganz leise |
| `--dunkel` | #21170F | „jetzt“-Marke, Löschen-Punkt im Bearbeiten-Modus |
| `--radius` / `--radius-gross` / `--radius-klein` | 16 / 22 / 10 px | Felder / Karten / kleine Flächen; Pillen 999px |
| `--luft` / `--innen` | 18 / 20 px | Abstand zwischen Karten / Innenabstand |
| `--fs-label` … `--fs-display`, `--fs-seite` | 11 / 13 / 16 / 19 / 26 / 34, Seite 36 (iPhone 30) | Schriftgrößen |
| `--duration` | 200 ms | Bewegung; Seite blendet 360 ms ein (`app.css`) |
| `--warn` / `--gut` | #D9364F / #3E9B6E | überfällig / gut |
| `--tap` / `--knopf` / `--leiste` | 44 / 44 (Maus 40) / 48 px | Tippflächen, Knöpfe, Eingabeleisten |

`.hell` (Mindmap-Overlay): deckendes Warmweiß, gleiche Token-Namen.

## Eine Farbe + Unterton (10.11.2026)
Alles bleibt in **einer** Farbe (Lukas: einheitlich, edel, nicht überladen). Keine Farben je Bereich.
Bereiche erkennt man an Linien-Symbol (`ui/symbol.js`) und Form (Ring, Zahl, Liste).
**Unterton** (optional, Einstellung `unterton`, synchronisiert, `core/akzent.js`): zweite, leise Note derselben Farbe.
`--unterton` (ohne Wahl = `--accent`) färbt die leise Wolke oben im Hintergrund und das Logo. Bei Weiß/Graphit ist er die einzige Farbe (`--bereich` = Unterton: Ringe, Kurven, Kalender-Tag).
Vorgaben `UNTERTOENE`: Kein, Gold, Rosé, Kupfer, Salbei, Nebel, Flieder. Wahl im Akzent-Popover (Heute) und in Einstellungen.
`--bereich`/`--bereich-tief` = Detailfarbe auf Heute (Akzent bzw. Unterton), kein eigener Wert je Bereich mehr.

## Akzentfarbe
Neutrale Akzente „Weiß“ und „Graphit“ (Werte `weiss`/`schwarz`): `--accent` wird Graphit #2E3035 (Haken, Chips, Knöpfe),
`data-akzent` am `<html>` schaltet in `akzent-neutral.css` nur den Papierton um: Weiß = #F3F2EF, Graphit = #E4E3E0.
`src/core/akzent.js`: `akzentSetzen(farbe)` speichert als Einstellung `akzent` (synchronisiert) und lokal;
`theme-color` (Fensterleiste) folgt `--bg`. `akzentLaden()` beim Start (erst lokal = kein Farbsprung, dann die synchronisierte). 9 Vorgaben in `AKZENT_FARBEN` (Weiß, Graphit + 7 Farben)
plus freier Farbwähler (Kachel `src/app/akzent-kachel.js`, Stil `farbkreise.css`).

## UI-Bausteine (`src/ui/`)
Stile: `src/styles/components.css` (Karte, Symbol, Liste, Knopf, Eingabefeld, Tabs),
`checkbox.css`, `modal.css`, `kopfbild.css`, `kachel.css` (Kacheln + Chips), `schrift.css`
(Klassen `.marke` = „SYSTEM 0“-Zeile, `.label` = kleines Label in Großbuchstaben, `.strich` = kurzer Strich) –
eigene Dateien, damit keine über 200 Zeilen wächst.
Kartenfläche für `.card` und `.kachel` steht gemeinsam in `components.css`.
Jede Datei liefert eine Funktion, die ein fertiges Element zurückgibt. Ansehen: in der App bzw. `tests/vorschau.html`.

| Datei | Funktion | Kurz |
|---|---|---|
| `dom.js` | `el(tag, props, kinder)` | Hilfsfunktion zum Bauen von Elementen |
| `card.js` | `card({ title, children })` | Fläche mit Rahmen, optional Überschrift |
| `list.js` | `list(rows)`, `listRow({ title, sub, start, end, onClick })`, `listItem(inhalt)` | Zeilen mit Trennlinien; `listItem` für freien Inhalt, z. B. Checkbox mit Text (ganze Zeile antippbar) |
| `checkbox.js` | `checkbox({ label, checked, onChange })` | runder Haken, erledigt im Akzent gefüllt, mit Animation |
| `button.js` | `button({ text, variant, onClick })` | Pille; `variant: 'primary'` = Akzent-Fläche (Hauptaktion), `'ghost'` = ohne Hintergrund |
| `input.js` | `input({ label, placeholder, value, type, onInput })` | Eingabefeld mit Beschriftung |
| `modal.js` | `modal({ title, content, actions })` → `{ open, close }` | iPhone: von unten, Mac: mittig |
| `tabs.js` | `tabs({ items, active, onChange })` | Umschalter wie das Segment, aktiver Tab = weißer Daumen |
| `kopfbild.js` | `kopfbild({ titel, werte })` | Seitenkopf: Titel + Kennzahlen-Zeile; `kopf.werte(neue)` tauscht sie |
| `kachel.js` | `kacheln([…])`, `kachel({ symbol, titel, wert, text, gross, onClick, children })` | Kacheln im 2er-Raster; klein = Symbol oben, `gross` = ganze Breite mit Symbol links; Symbol im leisen Kreis (38 px), `titel` als Label, `wert` groß (26 px, 600), `text` klein; antippbar = Schatten wächst beim Drüberfahren; Zustände `kachel--laeuft` (Symbol dreht), `kachel--warn` |
| `chips.js` | `chips({ items, active, onChange, aktionen })` | waagrechte Kapsel-Leiste (wischbar); gewählt = Akzent gefüllt; `aktionen` = gestrichelte Chips, die nur etwas auslösen |
| `abschnitt.js` | `abschnitt({ titel, zahl, symbol, tag })` | Abschnitts-Überschrift als schlichte Zeile (Symbol, Label, Zahl rechts), kein Kasten (`schrift.css`) |
| `symbol.js` | `symbol(name)` | dünnes Linien-Symbol (24 px, Textfarbe), z. B. `heute`, `todos`, `einstellungen`, `mehr`, `abgleich`, `export`, `konto`, `physio`, `suche` |

Navigation (`src/app/nav.js`, Stil `nav.css`): iPhone = schwebende Kapsel unten (einzige Stelle mit Unschärfe neben Fenstern/Popovern), nur Symbole.
Mac = schwebende Seitenleiste links mit Logo = App-Icon (`assets/icons/icon.svg`, gravierte Stein-0) und „System 0“; immer schmal (72 px),
klappt beim Drüberfahren (bzw. Tastatur-Fokus) sofort auf 236 px auf und schiebt den Inhalt in allen Bereichen:
Rand springt sofort, sichtbar gleiten die Teile per FLIP (`app/gleiten.js`, Felder mit `[data-raster]` einzeln, 420 ms, sanfte Kurve wie die Leiste).
Zustand als Klasse `shell--leiste-offen` (nav.js `leisteKlappen`), kein `:hover/:has` (Safari). Kein Klapp-Knopf mehr.
Aktiver Eintrag: Akzent-Pille (`.nav__zeiger`, `--akzent-flaeche`, weißes Symbol), gleitet ruhig (nur senkrecht, Breite per CSS).
Seitenleiste: Marke „System 0 / Lukas“, Suchfeld (graue Pille), Abschnitte
ALLTAG / KÖRPER & KOPF / SYSTEM (10 px, gesperrt, `--text-3`), Zahl als Akzent-Pille rechts am Eintrag, unten Stein-Kachel „L“ (`assets/icons/avatar-l.svg`, Stil wie App-Icon) mit
Status-Punkt + „Lukas · synchronisiert“. Eingeklappt verschwinden Texte, Abschnitts-Namen und Zahlen.
Seitenkopf: siehe Richtung „Glas, kräftig“ oben (Kennzahlen aus `bereich.kennzahlen()` → `[{ zahl, text }]`, je Modul `kennzahlen.js`, frisch bei `daten`).
Karten-/Fenstertitel 650, `--fs-title`, eng;
Karten auf Heute mit kleinem Bereichs-Symbol im Titel.
Ein `bild` wird zurzeit nicht übergeben (`shell.js`), die Bereiche behalten ihre Bildlisten für später.
Listen-Gruppen in To-dos und Kalender (`.todo-gruppe`, `.termin-gruppe`) sind weiße Karten mit `abschnitt`-Zeile als Kopf.

## Apple-Feinschliff (22.11.2026)
Übernommen:
- `ui/segment.js` (`segment.css`): graue Spur, weißer Daumen, wischbar bei vielen Teilen; `.textknopf` = Akzent-Text ohne Rahmen.
- `.leiste` (`leiste.css`): Rundung 12 px, Optionen als kleine graue Kapseln in der Zeile (`.leiste__option`, gewählt = Akzent), „+“ als Akzent-Kreis.

## Regeln
- Eine Akzentfarbe (+ optional ein Unterton), sonst Glas-Weiß und warmes Fast-Schwarz. Keine weiteren bunten Farben (Ausnahme: Farbe je Gewohnheit).
- Systemschrift überall; große Zahlen und Titel mit Gewicht 600 und leicht engem Buchstabenabstand.
- Karte = `--karte` + Rand `var(--glas-kante) solid var(--glas-rand)` + `--schatten` + `backdrop-filter: blur(var(--blur)) saturate(160%)`. Keine Karte in der Karte. Trennlinien nur in Listen.
- Ecken fein statt „weich-groß“ (Lukas, 10.11.2026): nur die drei Radius-Tokens, innen kleiner als außen.
- Kleine Animationen nur über `transform`/`opacity` (flüssig auf dem iPhone): Seiteninhalt blendet einmal kurz ein,
  antippbare Kacheln heben sich beim Drüberfahren (`--feder`), alles Antippbare gibt beim Drücken kurz nach.
- Respektiert „Bewegung reduzieren“ des Geräts (`base.css`).
- iPhone: Tippflächen mindestens 44 px, Rand um Notch/Home-Leiste beachten; oben ein dunklerer Streifen, damit die weiße Statusleiste lesbar bleibt.
