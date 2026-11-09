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
- [x] Design-Runde (Teil e, 04.11.2026): neu angeordnet. Kopf mit Steinstapel-Foto (kompakt, ohne Spruch),
      Bereichs-Chips statt Umschalter „Nach Priorität / Nach Bereichen“ (`nach-bereichen.js` entfernt),
      Gruppen nach Zeit ohne Kästen (Label-Überschrift mit Anzahl, Zeilen mit feinen Linien),
      Priorität als Punkt (hoch = Elfenbein mit Schimmer, mittel = grau, niedrig = keiner).
      Neues To-do landet im gerade gefilterten Bereich (sonst wäre es nach Enter unsichtbar).
      Lokal mit Testdaten geprüft (iPhone-Größe, Mac-Breite), Testdaten danach gelöscht

### Dateien (`src/module/todos/`)
| Datei | Aufgabe |
|---|---|
| `index.js` | meldet das Modul beim Router an |
| `data.js` | Lesen/Schreiben über `core/store.js` (To-dos und Bereiche) |
| `sortierung.js` | Sortierung (Priorität → Datum → älteste zuerst), Datums-Texte („Heute“, „Morgen“ …), überfällig |
| `view.js` | Ansicht: Bereichs-Chips, Schnelleingabe, Gruppen nach Zeit, „Erledigt“; zeichnet bei Ereignis `daten` neu |
| `zeile.js` | eine Zeile: Checkbox (abhaken) + antippbarer Text (öffnet Bearbeiten) + Prioritäts-Punkt rechts |
| `gruppen.js` | offene To-dos nach Zeit gruppieren: Überfällig · Heute · Diese Woche (nächste 7 Tage) · Später · Ohne Datum |
| `filter.js` | Bereichs-Chips „Alle · Bereiche · Ohne Bereich“ + Aktions-Chip „Bereiche bearbeiten“; Filter gemerkt |
| `schnelleingabe.js` | Feld oben, Enter legt an (im gerade gefilterten Bereich), Fokus bleibt; Schnell-Knöpfe darunter |
| `wischen.js` | Wischen (Finger) auf Zeilen: abhaken/löschen, „Rückgängig“-Pille |
| `bearbeiten.js` | Modal: Titel, Notiz, Priorität (Tabs), Fälligkeit, Bereich, Löschen |
| `erledigt.js` | eingeklappter Abschnitt „Erledigt“ |
| `bereiche-verwalten.js` | Modal: Bereiche anlegen, umbenennen (beim Verlassen des Felds), löschen |

Stile: `src/styles/todos.css`. Gewählter Bereichs-Filter steht nur im Gerät (`localStorage`, Schlüssel `system0-todos-filter`).

Wünsche für später (Funktionen sind nicht festgeschrieben, Lukas ergänzt hier, sobald ihm etwas einfällt):
- [x] Schnell-Knöpfe unter der Schnelleingabe (Heute/Morgen, Priorität, Bereich antippen = nächster) – `schnelleingabe.js`
- [x] Wischen (nur Finger): rechts = abhaken/öffnen, links = löschen mit „Rückgängig“-Pille 4 s – `wischen.js`
  (09.11.2026, `sw.js` `v83`)

Merke:
- Abhaken wartet 350 ms, damit die Haken-Animation zu sehen ist, dann wandert die Zeile.
- Bereich löschen setzt `bereich_id` aller seiner To-dos (auch erledigter) auf leer.
- Erledigte älter als 30 Tage sind ausgeblendet, Knopf „Ältere zeigen (n)“ im aufgeklappten Erledigt-Abschnitt (nichts wird gelöscht).
