# Modul: Heute
**Phase 1.** Startseite der App.

## Funktionen
- Termine von heute (eigene + Google-Kalender)
- To-dos von heute und überfällige, nach Priorität
- Später ergänzbar: Routine-Status, Affirmation des Tages, Training des Tages, Quiz des Tages, Streaks

## Hinweise
Liest nur Daten der anderen Module über `core/`, speichert selbst nichts.

## Stand
Platzhalter: `src/module/heute/` meldet „Heute“ beim Router an und zeigt „Kommt bald“. Das eigentliche Modul folgt in Phase 1.
- [x] Design-Runde (Teil d): Kopf mit Stein-Kugel (`bild: 'assets/bilder/heute.svg'`), Datum über dem Titel
      (`ueber`, z. B. „MITTWOCH, 4. NOVEMBER“) und Spruch des Tages. Den Kopf baut `src/app/shell.js` für jeden Bereich.
