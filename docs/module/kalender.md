# Modul: Kalender (persönlich)
**Phase 1.** Nicht zu verwechseln mit dem Praxis-Terminkalender (separates Projekt).

## Funktionen
- Eigene Termine: Tag, Woche, Monat
- Google-Kalender anzeigen (zunächst nur lesen), über Google-Login im Browser, kostenlos
- Google-Termine werden nicht in Supabase gespeichert, nur angezeigt

## Offene Fragen
- Sollen später auch Termine aus System 0 in Google eingetragen werden?

## Stand
Noch nicht begonnen. Kommt als Nächstes (nach dem PhysioZentrum, 05.11.2026).

## Plan für den Einstieg (nächste Sitzung)
Vorgehen wie beim PhysioZentrum:
1. Erst nur reden, nichts bauen. Mit Lukas klären (je Punkt 1–2 Varianten vorschlagen):
   - Welche Ansichten zuerst (Tag, Woche, Monat, Liste „Nächste Termine“)? Was ist die Startansicht?
   - Welche Felder braucht ein Termin (Titel, Start, Ende, ganztägig, Ort, Notiz, Erinnerung, Wiederholung)?
   - Wie sieht „schnell hinzufügen“ aus (Schnelleingabe wie bei den To-dos, z. B. „Mo 18 Uhr Training“)?
   - Google-Kalender: nur anzeigen (lesen) im ersten Schritt? Login über Google im Browser (kostenlos), Termine
     nicht in Supabase speichern. Klären, ob das in der Homescreen-App auf dem iPhone zuverlässig geht
     (sonst Alternative, z. B. geheime iCal-Adresse) – vorher kurz recherchieren
   - Zusammenspiel mit To-dos (fällige To-dos im Kalender zeigen?) und der späteren Heute-Übersicht
2. Daraus Datenmodell (Migration `005_kalender.sql`, Muster in `datenmodell.md`) und Plan in Teilen (a, b, …)
   hier eintragen, Okay abwarten, dann bauen.
3. Aussehen im Stil „Stein & Licht“ (`design.md`): Kopf mit eigenem Foto (Lukas erzeugt 3 Varianten mit dem Prompt aus
   `design.md`, Objekt passend zum Kalender), eigene Bereichsfarbe `--farbe-kalender` (neu in `tokens.css`),
   Symbol `kalender` in `src/ui/symbol.js`. Der Kalender steht in der Tab-Leiste an dritter Stelle (`nav-plan.js`).
4. Bausteine wiederverwenden: Kacheln, Chips, Gruppen-Liste wie bei den To-dos, Modal; Abgleich und Dateien über `src/core/`.
