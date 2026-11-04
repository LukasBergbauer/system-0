# Modul: To-dos
**Phase 1.**

## Funktionen
- Anlegen, bearbeiten, abhaken, löschen
- Priorität (hoch/mittel/niedrig) und Fälligkeitsdatum
- Standardansicht: sortiert nach Priorität und Datum
- Umschalten auf Ansicht nach Bereichen (z. B. Praxis, Training, Privat, Insta); Bereiche frei anlegbar
- Schnelleingabe auf dem iPhone

## Plan (mit Lukas abgestimmt)
Eine Sitzung, Teile a → b, nach jedem Teil kurz prüfen.

### Daten
- Migration `supabase/migrations/002_todos.sql` nach dem Muster in `datenmodell.md`
  (gemeinsame Spalten, Index, Trigger `sync_felder`, RLS, grant). Lukas führt sie im Supabase-SQL-Editor aus,
  danach beide Tabellen in `src/core/tabellen.js` eintragen.
- `todo_bereiche`: `name`, `reihenfolge`. Heißt nicht `bereiche`, damit es nicht mit den App-Bereichen
  der Navigation (Router) verwechselt wird. In der Oberfläche heißen sie trotzdem „Bereiche“.
- `todos`: `titel`, `notiz`, `prio` (1 hoch, 2 mittel, 3 niedrig; Standard 2), `faellig_am` (Datum, optional),
  `bereich_id` (optional), `erledigt_am` (Zeitstempel oder leer).
- Lesen/Schreiben nur über `src/core/store.js` in `src/module/todos/data.js`.

### a) Grundfunktionen
- Modul `src/module/todos/` (`index.js` meldet `{ id: 'todos', titel: 'To-dos', symbol: 'todos' }` an,
  in `src/app/bereiche.js` importieren; Symbol `todos` in `src/ui/symbol.js` ergänzen).
  Dadurch steht „To-dos“ automatisch an Platz 2 der Tab-Leiste.
- Schnelleingabe: Eingabefeld oben in der Liste. Titel tippen, Enter → angelegt (Prio mittel, ohne Datum).
  Feld bleibt danach im Fokus für das nächste To-do.
- Liste: offene To-dos sortiert nach Priorität, dann Fälligkeit (ohne Datum zuletzt). Zeile mit Checkbox,
  Titel, darunter Datum/Bereich; überfälliges Datum in `--warn`.
- Abhaken setzt `erledigt_am`. Erledigte rutschen in einen eingeklappten Abschnitt „Erledigt“ unten
  (aufklappbar, Haken dort wieder entfernen = wieder offen).
- Antippen der Zeile (nicht der Checkbox) öffnet ein Modal: Titel, Notiz, Priorität, Fälligkeit, Bereich, Löschen (weich).
- Ansicht aktualisiert sich bei Ereignis `daten` mit `table: 'todos'` (mit `{ signal }` abonnieren),
  damit Änderungen vom anderen Gerät sofort erscheinen.

### b) Bereiche
- Bereiche frei anlegen, umbenennen, löschen (To-dos des gelöschten Bereichs werden „ohne Bereich“).
- Umschalter (Baustein `tabs`) oben: „Nach Priorität“ (Standard) / „Nach Bereichen“ (je Bereich eine Karte,
  darin sortiert nach Priorität und Datum; „Ohne Bereich“ zuletzt). Gewählte Ansicht merken (lokal reicht).

## Stand
Noch nicht begonnen. Plan steht oben.
