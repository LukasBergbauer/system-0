# Modul: Heute
**Phase 1.** Startseite der App.

## Funktionen
- Termine von heute (eigene + Google-Kalender)
- To-dos von heute und überfällige, nach Priorität
- Später ergänzbar: Routine-Status, Affirmation des Tages, Training des Tages, Quiz des Tages, Streaks

## Hinweise
Liest nur Daten der anderen Module über `core/`, speichert selbst nichts.

## Stand
Als Glas-Dashboard gebaut (Plan unten, Schritte a–e alle fertig, 09.11.2026).
- [x] a) Daten-Rechnungen + Kopf, Hero mit Ring, 4 Kacheln (08.11.2026). Dateien in `src/module/heute/`:
      `rechnen.js` (alle Zahlen), `bewegung.js` (Zahl zählt hoch, Ring, Mini-Kurve), `kopf.js`, `hero.js`, `kacheln.js`,
      `view.js` (lädt über `core/store.js` + Google-Zwischenspeicher `getMeta('kalender:google')`, zeichnet bei `daten` neu,
      dann ohne Bewegung). Stil `src/styles/heute.css`. Router-Option `dashboard: true` → `shell.js` lässt den Standard-Kopf
      weg und gibt die breite Fläche `.app--breit`. Symbole `flamme`, `training` in `ui/symbol.js`. `sw.js` `v40`.
      Entscheidungen: „erledigt diese Woche“ = To-dos mit Erledigt-Datum Mo–So (egal wann fällig); Ring = nur To-dos mit
      Fälligkeit Mo–So (ohne solche: „–“ und Satz „Deine Woche ist frei“). Kurven: Offene To-dos + Serie = letzte 7 Tage,
      Termine = Mo–So dieser Woche (passt zur Zahl). Trend: Offene To-dos/Termine im Vergleich zu vor 7 Tagen bzw. Vorwoche;
      Serie zeigt „Rekord“, wenn sie die längste bisher ist. „Woche ansehen“ → `#/kalender/woche` (Kalender liest den Zusatz
      noch nicht, öffnet seine gemerkte Ansicht), „+ To-do“ → To-dos (Schnelleingabe dort oben) – richtig mit d).
      Lokal geprüft (Mac + iPhone-Größe).
- [x] b) Kalender-Karte, Verlauf, Donut (08.11.2026). `kalender-karte.js` (Tag antippen zeigt dessen Termine, max. 3 +
      „+ N weitere“, ganztägige zuerst; „Als Nächstes“ = nächster nicht-ganztägiger Termin heute, der noch nicht vorbei ist),
      `verlauf.js` (erledigt je Tag als Fläche, fällig je Tag gestrichelt; Woche = letzte 7 Tage, Monat = letzte 30 Tage;
      Umschalter = `ui/tabs.js`), `donut.js` (offene To-dos je Bereich, „Ohne Bereich“ zählt als eigener Teil, ab 6 Teilen
      werden die kleinsten zu „Sonst“; Antippen → To-dos). Stil `src/styles/heute-karten.css`. Beim Neuzeichnen (`daten`)
      blendet nichts erneut ein (`.heute--ruhig`). `sw.js` `v41`. Lokal geprüft (Mac + iPhone-Größe, Termine mit Testdaten).
      Offen: Schnellaktionen (Plan Punkt 5) sind keinem Schritt zugeordnet → mit d) zusammen bauen.
- [x] c) Seitenleiste mit Abschnitten + Platzhalter-Bereiche (09.11.2026). Abschnitte ALLTAG / KÖRPER & KOPF / SYSTEM
      (Zuordnung per id in `src/app/nav-plan.js`, Unbekanntes → ALLTAG, `ende` → SYSTEM), Suchfeld oben (nur Optik, Suche in e),
      Zahl offener To-dos am Eintrag (`shell.js` zählt über `core/store.js`, neu bei `daten`), unten „Lukas“ + Abgleich-Status
      (Ereignis `sync`, Punkt am Kreis grün/Akzent/Warnfarbe). `src/app/bald.js` meldet Training und Ziele mit `bald: true`
      an (Seite „Kommt bald“); ein echtes Modul mit gleicher id ersetzt sie. „Bald“-Bereiche nicht in der iPhone-Tab-Leiste.
      Symbol `ziele`. `sw.js` `v42`. Lokal geprüft (Mac auf/eingeklappt, iPhone-Größe).
- [x] d) Akzent-Knopf, Neu-Menü, Schnellaktionen (09.11.2026). `kopf-knoepfe.js`: „Akzent“ (Glas-Pille mit Farbpunkt,
      Popover mit den 7 Farben + eigener Farbe über `core/akzent.js`) und „Neu“ (dunkle Pille, Menü To-do · Termin ·
      Physio-Punkt). Beide als HTML-Popover (Tipp daneben/Esc schließt). `schnell.js`: Neues To-do · Termin (Heute N Termine)
      · Training starten (kommt bald, ausgegraut) · Mindmap öffnen. Weg über `core/`: Router-Zusatz `#/<bereich>/<zusatz>`,
      der Bereich liest ihn beim Öffnen mit `zusatzNehmen()` (entfernt ihn aus der Adresse). Bekannt: `todos/neu`
      (Fokus in die Schnelleingabe), `kalender/neu` (Termin-Fenster), `kalender/woche` (Wochenansicht, jetzt auch für
      „Woche ansehen“), `physio/neu` und `physio/mindmap` (öffnen die Mindmap; neuer Punkt dort über „+ Neuer Punkt“).
      Hero „+ To-do“ → `todos/neu`. Heute zeichnet bei Änderungen an `einstellungen` nicht neu (sonst schlösse sich
      die Farbwahl). Symbol `plus`. `sw.js` `v43`.
- [x] e) Suche (09.11.2026). `src/app/suche.js`: Suchfeld oben in der Seitenleiste (mit Hinweis „⌘K“) und ⌘K/Strg+K
      öffnen ein Modal; sucht in To-dos (Titel, Notiz; offene zuerst), Terminen (eigene + Google-Zwischenspeicher;
      zeitlich nächste zuerst) und Physio-Punkten (Titel, Kurz, Text). Alle Wörter müssen vorkommen, max. 6 je Gruppe,
      Enter = erster Treffer. Liest nur über `core/`. Treffer öffnet über den Router-Zusatz `#/<bereich>/<id>`:
      `todos/<id>` → Bearbeiten-Fenster, `kalender/<id>` → Termin-Fenster (Google-Termin: Wochenansicht seiner Woche),
      `physio/<id>` → Mindmap gleich mit der Fokus-Karte (`oeffneMindmap({ mitteId })`). Router: Zusatz wird dekodiert
      und wirkt auch, wenn der Bereich schon offen ist. `sw.js` `v44`. Lokal geprüft (Mac, alle drei Bereiche).
      Offen/klein: auf dem iPhone gibt es keinen Einstieg (keine Seitenleiste, keine Tastatur).
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

## Wünsche für später
- Kacheln auf Heute per Drag & Drop umordnen. Die Anordnung gilt nur für das jeweilige Gerät (in `localStorage`, nicht in Supabase).
  Die Werte auf den Kacheln werden weiter abgeglichen
