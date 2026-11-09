# Modul: Affirmationen
**Phase 3.**

## Funktionen
- Jede Affirmation gehört zu einem Lebensziel
- Täglich eine zufällige Affirmation passend zu den aktuellen Zielen, auf der Heute-Seite

## Stand
**Erste Fassung (09.11.2026).** Migration `012_affirmationen.sql`; `sw.js` `v54`.
- Daten (`data.js`): `affirmationen` (lebensziel_id, text, aktiv, reihenfolge). Liest `lebensziele`/`ziel_bereiche` nur roh.
- Seite (`view.js`): Karte je Ziel (Bereich, Titel, Warum; erreichte nur mit Affirmationen), Zeilen antippen → bearbeiten, „+ Affirmation“.
- Modal (`bearbeiten.js`): Warum und Vision als Hilfe, Text, „Vorschlag aus dem Warum“ (Vorlage ohne KI), „Auf Heute zeigen“, Löschen.
- Heute (`heute/affirmation.js`): „Affirmation des Tages“, aktive Affirmationen aktiver Ziele, je Tag fest; Antippen → nächste.
- Suche (⌘K): Gruppe „Affirmationen“ → `#/affirmationen/<id>`. Symbol `affirmation` (Funkeln).
- Lokal geprüft (Mac + iPhone-Breite, Heute-Karte mit Testdaten im Speicher). 
- [x] Migration 012 ausgeführt, auf Geräten geprüft (09.11.2026)

## Nächster Schritt (Plan)
- Lukas prüft auf Geräten; danach Gewohnheiten (`module/gewohnheiten.md`).
