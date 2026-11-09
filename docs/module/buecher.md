# Modul: Bücher
**Phase 4.**

## Funktionen
- Bücherliste mit Status (will lesen / lese gerade / gelesen), Cover
- Zusammenfassungen schreibt Lukas selbst: schöner, ruhiger Editor mit Überschriften, Zitaten, Listen
- Ästhetische, übersichtliche Leseansicht

## Stand
- [x] Erste Fassung (09.11.2026). Migration `015_buecher.sql` (Tabelle `buecher`, Bucket `buch-cover`); `sw.js` `v67`. Router-id `buecher`, Ordner `src/module/buecher/`:
      `data.js` (Laden/Speichern, Cover-Datei `buch-cover/<user>/<id>-<zeit>.jpg`), `cover.js` (verkleinern 600 px, Open-Library-Suche ohne Key),
      `cover-wahl.js`, `markdown.js` (jetzt `src/ui/markdown.js`; #, >, -, 1., ---, **fett**, *kursiv*, ohne innerHTML), `editor.js` (Textfeld + Leiste, Listen fortsetzen, wächst mit),
      `bearbeiten.js`, `buch.js` (Vollbild: Leseansicht ↔ Bearbeiten), `view.js` (Umschalter Lese gerade/Will lesen/Gelesen, Cover-Raster). Stil `buecher.css`, Symbol `buecher`.
      Status wechseln trägt Begonnen/Beendet ein. Leeres neues Buch wird beim Schließen gelöscht. Suche (⌘K): Gruppe „Bücher“ → `#/buecher/<id>`.
      Lokal geprüft (Mac + iPhone-Breite). `015` ausgeführt, von Lukas auf Geräten geprüft.

## Nächster Schritt (Plan)
- Nach Rückmeldung: evtl. Karte „Lese gerade“ auf Heute, Reihenfolge per Ziehen.
