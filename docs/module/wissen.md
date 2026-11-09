# Modul: Wissen-Quiz
**Phase 4.**

## Funktionen
- **Daily:** einmal täglich dasselbe Quiz, wie bei Wordle, mit Ergebnis und Serie
- **Endlos:** jederzeit weitere Runden
- Fragen kommen aus einer eigenen Fragen-Datenbank (deutsch), die schrittweise erweitert wird – kostenlos, ohne externe Dienste

## Plan (mit Lukas abgestimmt, 09.11.2026)
- Ziel: auf Dauer ca. 10.000 Fragen. Jede Frage hat eine feste ID (z. B. `ana-0001`), damit „schon gesehen“ zählbar ist.
- Grundstock im Repo: `src/module/wissen/fragen/<thema>.json` (Frage, 4 Antworten, kurze Erklärung), je Thema eine Datei,
  vom Service Worker gecacht (offline). Claude erzeugt und erweitert sie. 10.000 Fragen ≈ 3 MB, geht ohne Umbau.
- Import: Feld „Fragen importieren“ (JSON aus einem Claude-Chat einfügen, Format wird geprüft) → Tabelle `quiz_fragen`.
  Fertiger Prompt zum Kopieren in der Doku.
- Migration `014_wissen.sql`: `quiz_fragen` (thema, frage, antworten jsonb, richtig, erklaerung),
  `quiz_ergebnisse` (tag, modus daily/endlos, richtig, gesamt, antworten jsonb mit Frage-IDs).
- Daily: jeden Tag 5 andere Fragen, nur noch nie gesehene, aus dem Datum fest ausgewählt (Mac und iPhone gleich);
  sind alle gesehen, die am längsten nicht gesehenen. Danach Raster (grün/rot), Serie, Erklärungen.
- Endlos: Runden à 10, Themenfilter; bevorzugt neue, falsch beantwortete kommen öfter.
- Statistik: Trefferquote je Thema, Anzahl gesehen / gesamt. Heute: Karte „Daily-Quiz“ (offen bzw. Ergebnis + Serie).

## Stand
- [x] Gebaut (09.11.2026). Migration `014_wissen.sql`; `sw.js` `v59`. Router-id `quiz` (Tab „Quiz“), Ordner `src/module/wissen/`:
      `data.js` (Laden, Daily/Endlos-Auswahl, Serie, Statistik, Import), `runde.js` (Vollbild-Runde), `view.js`, `import.js`;
      Stil `wissen.css`; Symbol `quiz`; Heute: `heute/quiz-karte.js` (offen → `#/quiz/daily` startet direkt).
      Grundstock 150 Fragen: `fragen/{allgemein,geschichte,geografie,natur,anatomie,physio}.json`, je 25,
      Format `{ id, f, a: [richtig, 3× falsch], e }`, IDs `<kürzel>-0001` fortlaufend.
      Runde 2 (09.11.2026): Fragen verständlicher; Anatomie/Physio schwieriger mit „Was/Warum“-Erklärung, neu als `ana-/phy-0026–0050`
      (alte 0001–0025 entfernt, nie wiederverwenden). Import-Prompt entsprechend. `sw.js` `v60`.
- [x] Thema „Muskeln“ (09.11.2026): je Muskel 4 Einzelfragen (Ursprung, Ansatz, Funktion, Innervation), Erklärung = ganzes Profil + „Merke“.
      Quelle `tools/quiz/muskeln.txt` (eine Zeile pro Muskel), erzeugt mit `python3 tools/quiz/muskeln.py` → `fragen/muskeln.json`
      (IDs `mus-<name>-u/a/f/i`, stabil). Falsche Antworten: Ursprung/Ansatz aus derselben Gruppe, Funktion aus anderen Gruppen,
      Nerven aus derselben Region; Teil-Treffer werden ausgeschlossen. Stand: 124 Muskeln (Arm, Bein, Rumpf, Atmung, Beckenboden, Hals, Nacken, Kaumuskeln) = 496 Fragen.
      Daily nimmt jetzt je Thema höchstens eine Frage (Themen fest gemischt). `sw.js` `v61`. Neue Datei/Thema → `THEMEN` in `data.js` und `sw.js`.
      Daily nur vollständig gespeichert; Endlos auch abgebrochen (ab 1 Antwort). Import: Prompt-Knopf im Modal, doppelte Fragen werden übersprungen.
      Lokal geprüft (Mac + iPhone-Breite, Testrunde ohne Speichern). Offen: Lukas führt `014` aus, prüft auf Geräten.

## Nächster Schritt (Plan)
- Muskeln Teil 2 erledigt (09.11.2026, `sw.js` `v63`). Optional später: Mimik, Zungenbein-, Augenmuskeln.
- Bänder: eigene Tabelle `tools/quiz/baender.txt` (Verlauf von–bis, Funktion/hemmt, typische Verletzung, Test) mit gleichem Generator-Muster.
- Fragen ausbauen (Ziel ca. 10.000): je Sitzung z. B. 50–100 je Thema anhängen, IDs fortlaufend.
