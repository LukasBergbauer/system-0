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

Akzentfarben sind Platzhalter: Lukas kann sie später in einer einzigen Datei tauschen.

## Regeln
- Neon nur für Zustände und kleine Details (Haken, Fortschrittsring, aktiver Tab), nie für Flächen.
- Linien statt Schatten. Viel Luft. Wenige Schriftgrößen.
- Sanfte, kurze Animationen (150–250 ms). Respektiert „Bewegung reduzieren“ des Geräts.
- iPhone: Tippflächen mindestens 44 px, Rand um die Notch/Home-Leiste beachten.
