# Modul: Routinen
**Phase 1** (Grundfunktion), **Phase 5** (Sperre).

## Funktionen
- Morgen- und Abendroutine, weitere frei anlegbar
- Schritt-für-Schritt-Durchlauf: ein Schritt nach dem anderen abhaken
- Verlauf: welche Tage vollständig erledigt

## Später: Sperre
Ist bei einer Routine „Sperre“ aktiv, bleibt die übrige App gesperrt, bis alle Schritte nacheinander abgehakt sind.
Hinweis: Das funktioniert nur innerhalb von System 0. iOS erlaubt einer Web-App nicht, andere Apps zu sperren.
Für das ganze iPhone wäre die iOS-Funktion „Bildschirmzeit“ zuständig.

## Plan (mit Lukas abgestimmt, 09.11.2026)
- Migration `006_routinen.sql`: `routinen` (name, art morgen/abend/frei, sperre, reihenfolge),
  `routine_schritte` (routine_id, text, reihenfolge), `routine_logs` (routine_id, tag, geschafft, fertig_am).
  Ohne Fremdschlüssel (Geräte laden in beliebiger Reihenfolge hoch). Gilt täglich, keine Wochentage
- Ansicht: Karte je Routine (Morgen, Abend, dann freie) mit Stand heute, letzten 7 Tagen als Punkte, Serie;
  „Starten“/„Weiter“. Leer: Knopf „Morgen- und Abendroutine anlegen“. „Neue Routine“ unten
- Bearbeiten im Modal: Name, Art, Schritte als Textfeld (eine Zeile = ein Schritt), Löschen
- Durchlauf als Vollbild: ein Schritt groß, Fortschritt oben, „Erledigt“ → nächster, „Zurück“; Stand wird nach
  jedem Schritt gespeichert (Weiter später möglich), am Ende „Geschafft“. Kein Timer
- Heute: Leiste mit allen Routinen und Fortschritt, Antippen → `#/routinen/<id>` startet den Durchlauf

## Stand
- [x] Grundfunktion gebaut (09.11.2026). Migration `006_routinen.sql` (Tabellen in `core/tabellen.js`).
      Dateien `src/module/routinen/`: `data.js` (Laden, Stand je Tag, Serie, letzte 7 Tage), `view.js`, `karte.js`,
      `bearbeiten.js`, `durchlauf.js` (`<dialog>` als Vollbild); Stil `src/styles/routinen.css`; Symbol `routinen`.
      Heute: `heute/routinen-leiste.js` (ganze Breite unter den Kacheln, Füllung = Anteil geschafft).
      Einmal fertig bleibt der Tag fertig, auch bei „Nochmal“. `sw.js` `v45`.
      Lokal geprüft (Ansicht ohne Login eingehängt, Mac + iPhone-Größe): Anlegen, Schritte, Durchlauf, Weiter, Geschafft
- [ ] Lukas: `006_routinen.sql` in Supabase ausführen, dann mit Login auf Mac und iPhone prüfen (Abgleich)

## Wünsche für später
