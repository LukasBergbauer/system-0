# Design

## Richtung
Dunkel, clean, Apple-like. Dünne Linien, klare Kontraste (Schwarz, Grau, Weiß),
sparsame Neon-Akzente. Alles im selben Stil, nicht bunt.

## Tokens (Startwerte, alles in `src/styles/tokens.css`)
| Token | Wert | Verwendung |
|---|---|---|
| `--bg` | #0A0A0B | Hintergrund |
| `--surface` | #141416 | Karten, Leisten |
| `--surface-2` | #1C1C1F | Hover, Eingabefelder |
| `--line` | rgba(255,255,255,0.08) | 1px-Linien und Rahmen |
| `--text` | #F5F5F7 | Haupttext |
| `--text-2` | #8E8E93 | Nebentext |
| `--accent` | #3DFFB0 | ein Neon-Akzent: aktiv, erledigt, Streaks |
| `--accent-2` | #7A5CFF | sparsam: Hervorhebungen, Quiz |
| `--warn` | #FF5C7A | überfällig, Rückfall |
| `--radius` | 14px | Karten |
| `--font` | -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif | Systemschrift, kostenlos |
| `--space-1` … `--space-7` | 4 / 8 / 12 / 16 / 24 / 32 / 48 px | Abstände, immer aus dieser Reihe |
| `--fs-small` | 13px | Nebentext, Beschriftungen |
| `--fs-normal` | 16px | Fließtext, Eingaben (verhindert Zoom auf dem iPhone) |
| `--fs-title` | 20px | Überschriften in Karten und Modals |
| `--fs-large` | 28px | Seitentitel |
| `--duration` | 200ms | Dauer aller Animationen |
| `--ease` | cubic-bezier(0.2, 0.8, 0.2, 1) | sanftes Abbremsen am Ende |
| `--tap` | 44px | Mindesthöhe/-breite für Tippflächen |

Akzentfarben sind Platzhalter: Lukas kann sie später in einer einzigen Datei tauschen.

## UI-Bausteine (`src/ui/`)
Stile: `src/styles/components.css` (Karte, Liste, Knopf, Eingabefeld, Tabs),
`checkbox.css` und `modal.css` (eigene Dateien, damit keine Datei über 200 Zeilen wächst).
Jede Datei liefert eine Funktion, die ein fertiges Element zurückgibt. Ansehen: `bausteine.html`.

| Datei | Funktion | Kurz |
|---|---|---|
| `dom.js` | `el(tag, props, kinder)` | Hilfsfunktion zum Bauen von Elementen |
| `card.js` | `card({ title, children })` | Fläche mit Rahmen, optional Überschrift |
| `list.js` | `list(rows)`, `listRow({ title, sub, start, end, onClick })`, `listItem(inhalt)` | Zeilen mit Trennlinien; `listItem` für freien Inhalt, z. B. Checkbox mit Text (ganze Zeile antippbar) |
| `checkbox.js` | `checkbox({ label, checked, onChange })` | runder Neon-Haken mit Animation |
| `button.js` | `button({ text, variant, onClick })` | `variant: 'ghost'` = ohne Hintergrund |
| `input.js` | `input({ label, placeholder, value, type, onInput })` | Eingabefeld mit Beschriftung |
| `modal.js` | `modal({ title, content, actions })` → `{ open, close }` | iPhone: von unten, Mac: mittig |
| `tabs.js` | `tabs({ items, active, onChange })` | Umschalter, aktiver Tab mit Neon-Linie |

## Regeln
- Neon nur für Zustände und kleine Details (Haken, Fortschrittsring, aktiver Tab), nie für Flächen.
- Linien statt Schatten. Viel Luft. Wenige Schriftgrößen.
- Sanfte, kurze Animationen (150–250 ms). Respektiert „Bewegung reduzieren“ des Geräts.
- iPhone: Tippflächen mindestens 44 px, Rand um die Notch/Home-Leiste beachten.
