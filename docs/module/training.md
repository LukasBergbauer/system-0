# Modul: Trainings-Notebook
**Phase 2.** Hohe Priorität.

## Funktionen
- Trainingspläne (Woche für Woche) und freies Eintragen, was gemacht wurde
- Erfassen: Übungen, Sätze, Wiederholungen, Gewichte, Zeiten, Distanzen, Hyrox-Stationen, Gefühl, Belastung
- Übungen direkt aus Physio übernehmen (Verweis, keine Kopie, damit Änderungen überall gelten) und mit eigener Notiz versehen
- Verlauf und Fortschritt pro Übung

## Stand
- Zählregel (09.11.2026): Eine Einheit zählt (Woche, Serie, Heute) nur mit Sätzen oder Dauer/Gefühl/Belastung/Notiz – `zaehlt()` in `rechnen.js`, gleiche Regel in `heute/training.js`.
**Erste Fassung gebaut (09.11.2026)**, Plan a)–d) mit Lukas abgestimmt. Migration `008_training.sql`; `sw.js` `v47`.
- Daten (`daten.js`): `training_uebungen` (eigene Übung oder Verweis `physio_id`; Name/Kurz kommen dann live aus dem
  Physio), `einheiten`, `saetze` (hängen direkt an Einheit + Übung, keine Zwischentabelle). Physio nur über `core/store.js` gelesen.
- a) `view.js` + `liste.js`: Kacheln (diese Woche, Wochen in Folge), „+ Einheit eintragen“, Tabs Einheiten | Übungen.
  Unterseiten mit eigenem Verlaufseintrag (Zurück/Wischen führt zur Liste). `#/training/neu` legt gleich eine Einheit an.
- b) `einheit.js` + `saetze.js`: Datum, Dauer, Titel, Art, Gefühl, Belastung (RPE), Notiz; je Übung „Letztes Mal“,
  Satz-Zeilen mit Feldern je Messung (Kopfzeile mit Einheiten), „+ Satz“ übernimmt die Werte vom letzten Satz.
  Autospeichern je Feld; leere Einheit wird beim Verlassen gelöscht. Zeit als „m:ss“ oder Sekunden.
- c) `wahl.js`: Suche über eigene, Physio-Übungen und Hyrox-Vorlagen (werden erst beim Wählen angelegt), „+ … als neue Übung“.
- d) `uebung.js` + `rechnen.js`: Name bzw. „In Physio öffnen“, Messung umschalten, eigene Notiz, Bestwert,
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

**v2 nach Rückmeldung (09.11.2026).** Migration `010_training_rir.sql` (saetze.rir 1–4); `sw.js` `v49`.
- Liste: ganz oben Wochen-Leiste als Akzent-Karte wie der Heute-Hero („x von Ziel Einheiten“, weißer Balken, füllt sich animiert) (Ziel = Einheiten im aktiven Plan, sonst 3; Lukas will sie
  evtl. später überarbeiten), darunter „Heute“ mit großem „Start“, „+ Freies Training“. Alle Start-Knöpfe heißen „Start“.
- Einheit: Kopf nur Titel + Datum, „▶ Durchlauf starten“, Sätze mit RIR-Spalte (nur bei Wdh), Karte „Wie war's?“
  (Gefühl, Dauer, Notiz). Art und RPE nicht mehr in der Oberfläche (Spalten bleiben).
- `durchlauf.js`: Vollbild (Klassen aus routinen.css), ein Satz je Schritt, −/+ (Wdh 1, kg 2,5, m 50, Zeit 5 s), RIR-Chips,
  „Satz fertig“ übernimmt Werte in den nächsten offenen Satz derselben Übung; Ende: Gefühl, Notiz, Dauer automatisch.
  Weiter beim ersten Satz ohne RIR (Übungen ohne Wdh starten deshalb immer vorn). Start aus Plan öffnet ihn direkt.
- „Zuletzt <Datum>: …“ (`zuletztText` in rechnen.js) in Durchlauf, Einheit, Plan-Einheit und Übungsliste.
- Plan: „▶ Start“ je Plan-Einheit, nur am eigenen Wochentag aktiv. Plan-Einheit: „Jetzt starten“ und Art weg.
- Geprüft in iPhone-Breite (keine Überschneidung, kein Quer-Scrollen), nichts gespeichert. 010 ausgeführt, auf Geräten geprüft.

**Suche (09.11.2026).** `src/app/suche.js` durchsucht `training_uebungen` (Name, bei Physio-Verweis Physio-Titel; Notiz)
und `trainingsplaene` (Name, Titel der Plan-Einheiten). Zusatz `uebung:<id>` / `plaene:<id>` öffnet in view.js Übung bzw. Plan
(eigener Verlaufseintrag, Zurück → Liste). Lokal geprüft.

## Nächster Schritt (Plan)
- Erste Fassung fertig (v2 + Suche von Lukas geprüft). Weiteres nur nach Rückmeldung.

## Wünsche für später
