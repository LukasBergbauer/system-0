# Modul: Gewohnheiten
**Phase 3.**

## Aufbauen
- Messart pro Gewohnheit: Abhaken, Anzahl oder Zeit
- Streaks (Serien) und Verlauf

## Abbauen
- Zähler „Tage ohne“
- Rückfall eintragen, mit Auslöser (Situation, Uhrzeit, Gefühl)
- Übersicht der häufigsten Auslöser

## Plan (mit Lukas abgestimmt, 09.11.2026)
- Täglich; Messart abhaken / Anzahl / Zeit (Minuten) mit Tagesziel
- Rückfall so knapp wie möglich: Auslöser antippen (Stress, Langeweile, Müde, Gesellschaft, Gewohnheit, Belohnung,
  mehrere möglich), Mini-„+“ für kurze Notiz, keine Uhrzeit
- Auslöser-Übersicht aufklappbar auf der Karte (Anzahl je Auslöser)
- Heute: Leiste wie Routinen, Aufbauen direkt hochzählen, Abbauen zeigt „Tage ohne“

## Stand
- [x] Gebaut (09.11.2026). Migration `013_gewohnheiten.sql`: `gewohnheiten` (art auf/ab, messart, ziel, seit),
      `gewohnheit_logs` (tag, wert; höchster Wert je Tag zählt), `rueckfaelle` (tag, ausloeser jsonb, notiz).
      Dateien `src/module/gewohnheiten/`: `data.js`, `view.js`, `karte-auf.js`, `karte-ab.js`, `bearbeiten.js`, `rueckfall.js`;
      Stil `gewohnheiten.css` (nutzt Karten aus `routinen.css`); Symbol `gewohnheiten`; Heute: `heute/gewohnheiten-leiste.js`
      (schreibt beim Antippen über `core/store.js`). Ein Tipp = +1 bzw. +5 Min. „Ohne seit“ im Bearbeiten (Abbauen). `sw.js` `v58`.
      Lokal mit Testdaten im Speicher geprüft (Mac + iPhone-Breite). 
- [x] Migration 013 ausgeführt, auf Geräten geprüft (09.11.2026)
- [x] Jahres-Raster wie „FocusHero“ (22.11.2026, v125): `karte.js` (eine Karte für Auf/Ab: Symbol, Name, Summe, Pille „Heute“
      bzw. „Rückfall“, Serie mit Flamme), `raster.js` (Wochen-Spalten Jan–Dez, Stufen 0–4, heute mit Rand, iPhone wischbar ab heute).
      Farbe je Gewohnheit (Wunsch Lukas) nach Reihenfolge aus `--gew-1…6` (tokens.css). Heute: Abhaken an/aus, Anzahl/Zeit +1 Schritt,
      lang drücken/Rechtsklick = Schritt zurück. Abbauen: Tage ohne Rückfall seit Beginn gefüllt. Keine Migration.
- [x] Nichts steht über (v129): Namen brechen um, Pillen rutschen bei Platzmangel unter den Namen, wischbares Raster mit weichen Rändern.
