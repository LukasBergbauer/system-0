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

- [x] Phase 7.6 (10.11.2026, `sw.js` `v115`, Migration `024_buch_notizen.sql` – **noch ausführen**): Plan unten umgesetzt.
      `seiten.js` (Kreis + Fenster „Seite [ ] von [ ]“ in einer Zeile, v116)
      v117: „Absatz“ heißt im UI „Zitat“ (Daten bleiben `art='absatz'`). Fenster = „Seite [ ]“ + eine Notizbox. Beim Buch Abschnitte
      „Zitate“ und „Zusammenfassungen“ mit Anzahl, nach Seite. Heute-Feld heißt „Zitat“., `notizen.js` (Knöpfe + Einträge), Heute `absatz.js` (Art `absatz`). Lokal geprüft (Mac + iPhone).

## Plan Phase 7.6 (10.11.2026)
- Raster: jedes Buch in eigener Glas-Box (Cover, Titel, Autor). Kreis unten rechts am Cover = Seite / Seiten;
  Antippen → kleines Fenster „Seite“ + „von“ (manuell). Neue Spalten `buecher.seite`, `buecher.seiten` (Migration 024).
- Neue Tabelle `buch_notizen` (buch_id, art `zusammenfassung`|`absatz`, seite, text). In der Leseansicht unter dem Buchkopf
  Knöpfe „Zusammenfassung“ und „Absatz“ → Fenster mit Seite + Text; Einträge nach Seite sortiert darunter (Absatz als Zitat),
  antippen = bearbeiten/löschen. Lange Zusammenfassung (Editor) bleibt darunter.
- Heute: Feld „Lieblingsstelle“ (Absatz des Tages, antippen = nächster) unter „Bereiche“, einzelne Absätze unter „Einzelne Felder“.

## Nächster Schritt (Plan)
- Nach Rückmeldung: evtl. Karte „Lese gerade“ auf Heute, Reihenfolge per Ziehen.
