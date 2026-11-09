# Modul: Wissen-Quiz
**Phase 4.**

## Funktionen
- **Daily:** einmal täglich dasselbe Quiz, wie bei Wordle, mit Ergebnis und Serie
- **Endlos:** jederzeit weitere Runden
- Fragen kommen aus einer eigenen Fragen-Datenbank (deutsch), die schrittweise erweitert wird – kostenlos, ohne externe Dienste

## Offene Fragen
- Welche Themen? (Allgemeinbildung, Geschichte, Geografie, Naturwissenschaft, Anatomie …)

## Plan (Entwurf, noch abzustimmen)
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
Noch nicht begonnen.
