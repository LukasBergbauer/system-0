# Modul: Lebensziele
**Phase 3.**

## Funktionen
- Ordner für mehrere Lebensziele und Visionen
- Ziele lassen sich anpassen; Änderungen fließen in die Affirmationen ein
- Grundlage für `affirmationen`

## Stand
**Erste Fassung (09.11.2026).** Migration `011_ziele.sql`; `sw.js` `v53`. Start leer (keine vorbefüllten Bereiche).
- Daten (`data.js`): `ziel_bereiche` (name, vision, reihenfolge), `lebensziele` (bereich_id, titel, warum, zieldatum,
  status aktiv/pausiert/erreicht, reihenfolge), `ziel_schritte` (ziel_id, text, erledigt_am, reihenfolge). Löschen kaskadiert in JS.
- Liste (`view.js`, `karte.js`): Glaskarte je Bereich mit Vision als Zitat, Ziele mit Balken (erledigte Schritte), pausierte unten,
  erreichte eingeklappt. „+ Ziel“, „+ Bereich“. Bereich-Modal (`bereich.js`): Name, Vision, Löschen.
- Ziel-Modal (`ziel.js`): Titel, Warum, Zieldatum, Status, Schritte (abhaken, ×, neu per Enter); speichert sofort,
  leeres neues Ziel wird beim Schließen gelöscht. Schritte in Reihenfolge des Anlegens (kein Umsortieren).
- Heute (`heute/ziele-leiste.js`): Karte „Nächster Schritt“, je aktivem Ziel erster offener Schritt, max. 3, früheste Zieldaten zuerst.
- Suche (⌘K): Gruppe „Ziele“ (Ziele + Bereiche) → `#/ziele/<id>`.
- Lokal geprüft (Mac + iPhone-Breite, Testdaten gelöscht). 011 ausgeführt, von Lukas auf Geräten geprüft.

**Umbenannt (09.11.2026, nur Texte, Daten/ids gleich):** Seite „Visionen“; Bereichs-Feld „Vision“ → „Wie soll es sein?“;
Ziel → „Schritt“ (Zieldatum → „Bis wann“); Schritte darin → „Teilschritte“. Idee: Vision in kleine Schritte aufteilen. `sw.js` `v55`.

## Nächster Schritt (Plan)
- Affirmationen (`module/affirmationen.md`), nutzen „Warum“ und Vision.

## Wünsche für später
