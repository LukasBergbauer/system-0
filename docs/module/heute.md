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

## Plan: Heute als Glas-Dashboard (abgestimmt mit Lukas, 08.11.2026)
Layout **genau wie** `muster/glas.html` (Bild von Lukas: `docs/vorlagen/dashboard-glas.png`), aber mit echten Daten.
Liest nur über `core/` bzw. `getAll()` die Tabellen `todos`, `termine`, `todo_bereiche`, `physio_eintraege`, `physio_links`
(+ Google-Termine aus dem lokalen Zwischenspeicher). Speichert selbst nichts. Neu zeichnen bei Ereignis `daten`.
1. **Kopf:** „Guten Morgen/Tag/Abend, Lukas“, darunter Datum · „N Dinge brauchen dich“ (überfällig + heute fällig + Termine heute).
   Rechts Knöpfe „Akzent“ (Farbwahl-Popover, nutzt `core/akzent.js`) und „Neu“ (dunkle Pille, Menü: To-do, Termin, Physio-Punkt).
   Kein Spruch mehr auf Heute (der Gruß ersetzt den Titel).
2. **Hero (Akzent-Karte, Woche):** Ring = erledigt ÷ (erledigt + offen) der To-dos mit Fälligkeit in dieser Woche.
   Zahlen: erledigt diese Woche · heute fällig · überfällig. Satz passt sich an (gut / überfällige Dinge).
   Knöpfe: „Woche ansehen“ (→ Kalender, Woche) und „+ To-do“ (Schnelleingabe).
3. **Kalender-Karte:** großes Tagesdatum, Wochenleiste Mo–So (Tag antippen = Termine dieses Tages), bis zu 3 Termine,
   der nächste mit „Als Nächstes“.
4. **4 Kacheln (Platzhalter-Variante):** Offene To-dos (davon heute) · Termine diese Woche · Erledigt-Serie in Tagen
   (Akzent-Kachel; wird später zur Gewohnheits-Serie) · Training (Platzhalter „kommt bald“). Mini-Kurven = letzte 7 Tage.
5. **Schnellaktionen:** Neues To-do · Termin · Training starten (kommt bald) · Mindmap öffnen.
6. **Verlauf:** „Erledigt“ je Tag (Woche/Monat-Umschalter), gestrichelt = fällig je Tag.
7. **Donut:** „To-dos nach Bereich“ (offene To-dos je `todo_bereiche`, max. 4 + „Sonst“).
8. **Seitenleiste wie Bild:** Abschnitte ALLTAG / KÖRPER & KOPF / SYSTEM, Suchfeld oben, Zahl offener To-dos am Eintrag,
   unten „Lukas · synchronisiert“ (Sync-Status). Training und Ziele schon sichtbar → Seite „Kommt bald“
   (Bereiche registrieren mit `bald: true`, ersetzen sich später durch die echten Module).
9. **Suche (Feld + ⌘K):** über To-dos, Termine, Physio-Punkte; Ergebnisliste im Modal, Tippen öffnet den Bereich.
   Braucht einen kleinen Weg über `core/` (z. B. Ereignis oder Router-Parameter), damit Module nicht direkt verknüpft werden.
Animationen wie Musterseite: Zahlen zählen hoch, Ring/Donut füllen sich, Kurven zeichnen sich, Kacheln heben sich.
Reihenfolge zum Bauen (je ein Commit): a) Daten-Rechnungen + Kopf/Hero/Kacheln, b) Kalender-Karte, Verlauf, Donut,
c) Seitenleiste mit Abschnitten + Platzhalter-Bereiche, d) Neu-Menü + Akzent-Knopf, e) Suche.
