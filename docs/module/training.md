# Modul: Trainings-Notebook
**Phase 2.** Hohe Priorität.

## Funktionen
- Trainingspläne (Woche für Woche) und freies Eintragen, was gemacht wurde
- Erfassen: Übungen, Sätze, Wiederholungen, Gewichte, Zeiten, Distanzen, Hyrox-Stationen, Gefühl, Belastung
- Übungen direkt aus dem PhysioZentrum übernehmen (Verweis, keine Kopie, damit Änderungen überall gelten) und mit eigener Notiz versehen
- Verlauf und Fortschritt pro Übung

## Stand
**Erste Fassung gebaut (09.11.2026)**, Plan a)–d) mit Lukas abgestimmt. Migration `008_training.sql`; `sw.js` `v47`.
- Daten (`daten.js`): `training_uebungen` (eigene Übung oder Verweis `physio_id`; Name/Kurz kommen dann live aus dem
  PhysioZentrum), `einheiten`, `saetze` (hängen direkt an Einheit + Übung, keine Zwischentabelle). Physio nur über `core/store.js` gelesen.
- a) `view.js` + `liste.js`: Kacheln (diese Woche, Wochen in Folge), „+ Einheit eintragen“, Tabs Einheiten | Übungen.
  Unterseiten mit eigenem Verlaufseintrag (Zurück/Wischen führt zur Liste). `#/training/neu` legt gleich eine Einheit an.
- b) `einheit.js` + `saetze.js`: Datum, Dauer, Titel, Art, Gefühl, Belastung (RPE), Notiz; je Übung „Letztes Mal“,
  Satz-Zeilen mit Feldern je Messung (Kopfzeile mit Einheiten), „+ Satz“ übernimmt die Werte vom letzten Satz.
  Autospeichern je Feld; leere Einheit wird beim Verlassen gelöscht. Zeit als „m:ss“ oder Sekunden.
- c) `wahl.js`: Suche über eigene, Physio-Übungen und Hyrox-Vorlagen (werden erst beim Wählen angelegt), „+ … als neue Übung“.
- d) `uebung.js` + `rechnen.js`: Name bzw. „Im PhysioZentrum öffnen“, Messung umschalten, eigene Notiz, Bestwert,
  Verlauf-Linie (Bestwert je Einheit), Liste der Einheiten. Bestwert: Gewicht > Wdh > Distanz > Zeit (weniger = besser).
- `ui/chips.js`: `active: null` = nichts gewählt.
- Lokal geprüft (Mac + iPhone-Größe, Testdaten danach gelöscht). Offen: Lukas führt `008_training.sql` aus, prüft auf echten Geräten.

**Wochenpläne (09.11.2026)**, mit Lukas abgestimmt. Migration `009_training_plaene.sql`; `sw.js` `v48`.
- Daten (`plan-daten.js`): `trainingsplaene` (name, aktiv – nur einer), `plan_einheiten` (plan_id, wochentag 1–7, titel, art,
  `uebungen` jsonb `[{ uebung_id, saetze, wdh, gewicht, zeit, distanz }]`). `einheiten.plan_einheit_id` = gestartet aus Plan.
  Plan wiederholt sich jede Woche.
- `plaene.js`: Tab „Pläne“ und Karte „Heute laut Plan“ (Starten/Öffnen) über den Tabs. `plan.js`: Name, Aktiv, Mo–So.
  `plan-einheit.js`: Titel, Wochentag, Art, Übungen mit Ziel (Sätze + Messung), „Jetzt starten“; leere wird beim Verlassen gelöscht.
- Start (`starte`): heute schon gestartet → öffnen, sonst Einheit mit vorbefüllten Sätzen (Zielwerte). Adresse `#/training/plan:<id>`.
- Heute (`heute/training.js`, liest nur Tabellen): Kachel „Training“ (Einheiten diese Woche, Text zum Plan), Leiste
  „Training heute laut Plan“ (nur mit Plan-Einheiten heute), Schnellaktion startet die nächste offene Plan-Einheit bzw. `training/neu`.
- Lokal geprüft (Mac + iPhone-Größe, Testdaten gelöscht). Offen: Lukas führt `009_training_plaene.sql` aus, prüft auf Geräten.

## Nächster Schritt (Plan)
- Lukas prüft auf echten Geräten; danach Training in der Suche (⌘K) oder nächstes Modul laut Roadmap

## Wünsche für später
- Training in der Suche (⌘K)
