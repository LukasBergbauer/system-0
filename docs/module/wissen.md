# Modul: Wissen-Quiz
**Phase 4.**

## Funktionen
- **Daily:** einmal täglich dasselbe Quiz, wie bei Wordle, mit Ergebnis und Serie
- **Endlos:** jederzeit weitere Runden
- Fragen kommen aus einer eigenen Fragen-Datenbank (deutsch), die schrittweise erweitert wird – kostenlos, ohne externe Dienste

## Offene Fragen
- Welche Themen? (Allgemeinbildung, Geschichte, Geografie, Naturwissenschaft, Anatomie …)

## Plan (Entwurf, noch abzustimmen)
- Fragen als JSON-Dateien im Repo (`src/module/wissen/fragen/<thema>.json`): Frage, 4 Antworten, kurze Erklärung.
  Offline, kostenlos, Claude erweitert sie. Start ca. 25 je Thema.
- Migration `014_wissen.sql`: `quiz_ergebnisse` (tag, modus daily/endlos, richtig, gesamt, antworten jsonb).
- Daily: 5 Fragen, aus dem Datum fest gemischt, einmal pro Tag; danach Raster (grün/rot), Serie, Erklärungen.
- Endlos: Runden à 10, Themenfilter; falsch beantwortete kommen öfter.
- Statistik: Trefferquote je Thema. Heute: Karte „Daily-Quiz“ (offen bzw. Ergebnis + Serie). Suche: nicht nötig.

## Stand
Noch nicht begonnen.
