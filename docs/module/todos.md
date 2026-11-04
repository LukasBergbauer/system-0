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
- [x] Migration `supabase/migrations/002_todos.sql` geschrieben; `todo_bereiche` und `todos` in `src/core/tabellen.js`.
      `bereich_id` absichtlich ohne Fremdschlüssel (To-do darf vor seinem Bereich beim Server ankommen)
- [x] Migration von Lukas im Supabase-SQL-Editor ausgeführt
- [x] a) Grundfunktionen, lokal geprüft (Mac + iPhone-Größe)
- [x] b) Bereiche + Umschalter, lokal geprüft
- [x] Von Lukas auf echtem iPhone (gepushte Fassung) und Mac geprüft, inkl. Abgleich zwischen beiden

### Dateien (`src/module/todos/`)
| Datei | Aufgabe |
|---|---|
| `index.js` | meldet das Modul beim Router an |
| `data.js` | Lesen/Schreiben über `core/store.js` (To-dos und Bereiche) |
| `sortierung.js` | Sortierung (Priorität → Datum → älteste zuerst), Datums-Texte („Heute“, „Morgen“ …), überfällig |
| `view.js` | Ansicht: Umschalter, Schnelleingabe, Liste, „Erledigt“; zeichnet bei Ereignis `daten` neu |
| `zeile.js` | eine Zeile: Checkbox (abhaken) + antippbarer Text (öffnet Bearbeiten) |
| `schnelleingabe.js` | Feld oben, Enter legt an, Fokus bleibt |
| `bearbeiten.js` | Modal: Titel, Notiz, Priorität (Tabs), Fälligkeit, Bereich, Löschen |
| `erledigt.js` | eingeklappter Abschnitt „Erledigt“ |
| `nach-bereichen.js` | Ansicht „Nach Bereichen“ (Karte je Bereich, „Ohne Bereich“ zuletzt) |
| `bereiche-verwalten.js` | Modal: Bereiche anlegen, umbenennen (beim Verlassen des Felds), löschen |

Stile: `src/styles/todos.css`. Gewählte Ansicht steht nur im Gerät (`localStorage`, Schlüssel `system0-todos-ansicht`).

Wünsche für später (Funktionen sind nicht festgeschrieben, Lukas ergänzt hier, sobald ihm etwas einfällt):
- Schnell-Knöpfe direkt unter der Schnelleingabe (Datum Heute/Morgen, Priorität, Bereich),
  damit das Bearbeiten-Fenster seltener nötig ist (Idee aus der Design-Runde, 04.11.2026)
- Wischen zum Abhaken/Löschen (Idee aus der Design-Runde)

Merke:
- Abhaken wartet 350 ms, damit die Haken-Animation zu sehen ist, dann wandert die Zeile.
- Bereich löschen setzt `bereich_id` aller seiner To-dos (auch erledigter) auf leer.
- Erledigte werden nie automatisch aufgeräumt (später überlegen, z. B. nach 30 Tagen ausblenden).
