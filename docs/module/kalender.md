# Modul: Kalender (persönlich)
**Phase 1.** Nicht zu verwechseln mit dem Praxis-Terminkalender (separates Projekt).

## Funktionen (mit Lukas abgestimmt, 08.11.2026)
- **Ansichten:** Start = Liste „Nächste Termine“, gruppiert wie bei den To-dos (Heute · Morgen · Diese Woche · Später).
  Umschalter (Chips) zur **Woche**. Monat kommt später.
- **Felder:** Titel, Start, Ende, ganztägig, Ort, Notiz. Keine Erinnerungen, keine Wiederholung (vorerst).
- **Schnelleingabe mit Erkennung:** Feld oben, z. B. „Mo 18 Uhr Training“ → Montag 18:00–19:00 „Training“.
  Vorschau-Zeile darunter zeigt, was erkannt wurde, Enter legt an. Nichts erkannt → heute, ganztägig.
- **Google-Kalender:** nur lesen, über die geheime iCal-Adresse von Google. Abruf über eine Supabase-Funktion
  (Google erlaubt Browsern keinen direkten Abruf, geprüft: kein CORS-Kopf). Google-Termine gedämpft angezeigt,
  nicht in Supabase gespeichert; letzter Abruf nur lokal (IndexedDB `meta`), damit offline lesbar.
- **To-dos:** vorerst getrennt. Zusammenführen macht später die Heute-Übersicht.

## Datenmodell
Migration `supabase/migrations/005_kalender.sql`: Tabelle `termine`
(titel, start, ende, ganztaegig, ort, notiz + gemeinsame Spalten).
Ganztägig: start = 0:00 Uhr des ersten Tags, ende = 0:00 Uhr des Folgetags nach dem letzten Tag (wie iCal).
Google-Adresse: in `einstellungen` (Schlüssel `google_ical`), durch RLS geschützt.

## Schnelleingabe – erkannte Wörter
| Eingabe | Bedeutung |
|---|---|
| `heute`, `morgen`, `übermorgen` | Tag |
| `Mo` … `So`, `Montag` … `Sonntag` | nächster solcher Tag (heute, wenn heute dieser Tag ist und die Zeit noch kommt) |
| `12.11.` / `12.11.2027` | Datum (ohne Jahr: nächstes Vorkommen) |
| `18 Uhr`, `18:30`, `18.30 Uhr` | Beginn, Dauer 1 Stunde |
| `18-20 Uhr`, `18:00-19:30` | Beginn und Ende |
| nur Uhrzeit, kein Tag | heute (morgen, wenn die Zeit schon vorbei ist) |
| nur Tag, keine Uhrzeit | ganztägig |
Der Rest ist der Titel.

## Plan in Teilen (nach jedem Teil kurz prüfen)
- **a) Grundgerüst + Liste:** Migration ausführen (Lukas), `termine` in `src/core/tabellen.js`, Ordner `src/module/kalender/`,
  Bereich im Router (Tab-Leiste an 3. Stelle, `nav-plan.js` kennt `kalender` schon), Symbol `kalender` in `src/ui/symbol.js`,
  Token `--farbe-kalender` (Vorschlag #CBC6BC, warmer Sandstein) in `tokens.css`. Liste „Nächste Termine“ in Gruppen,
  Antippen → Modal zum Bearbeiten/Löschen, Knopf „+ Termin“ → leeres Modal. Vergangene Termine ausgeblendet.
- **b) Schnelleingabe:** `erkennen.js` (Text → `{ titel, start, ende, ganztaegig }`, reine Funktion, mit Beispielen geprüft)
  und `schnelleingabe.js` (Feld + Vorschau-Zeile).
- **c) Woche:** Chips „Liste · Woche“, Woche als 7 Tages-Zeilen (Mo–So) mit Terminen, wischen bzw. Pfeile für vor/zurück.
  Auswahl wird gemerkt (`einstellungen`).
- **d) Google:** Supabase-Funktion `google-kalender` (im Supabase-Dashboard unter „Edge Functions“ anlegen, kein Terminal nötig):
  liest mit Lukas' Login die Adresse aus `einstellungen`, lässt nur `calendar.google.com` zu, gibt die .ics weiter.
  In der App: Feld für die Adresse in den Einstellungen, `ical.js` (einfacher Leser für VEVENT: Titel, Start, Ende, Ort),
  Abruf beim Öffnen des Kalenders (höchstens alle 15 Min.), lokal zwischenspeichern, gedämpft anzeigen (nicht bearbeitbar).
  Grenze: Wiederkehrende Google-Termine (RRULE) zuerst nur einfache Regeln (täglich/wöchentlich) – genauer, falls nötig.
- **e) Kopfbild + Abschluss:** 3 Fotos von Lukas einbauen (`assets/bilder/kalender-1…3.webp`), neue Dateien in `APP_FILES`
  von `sw.js`, `VERSION` hochzählen, Doku-Stand, Commit. Danach prüft Lukas die gepushte Fassung auf dem iPhone.

Bild-Objekt (Vorschlag): **steinerne Sonnenuhr**. Prompt aus `design.md`, `[OBJEKT]` = „a small weathered stone sundial“.

## Offene Fragen
- Sollen später auch Termine aus System 0 in Google eingetragen werden?
- Später: Monatsansicht, Wiederholungen, To-dos im Kalender (über Heute-Übersicht).

## Dateien (`src/module/kalender/`)
| Datei | Aufgabe |
|---|---|
| `index.js` | meldet den Bereich beim Router an |
| `daten.js` | Lesen/Schreiben der Tabelle `termine` über `core/store.js` |
| `zeit.js` | Datum/Uhrzeit umrechnen, Gruppen der Liste, Texte („Heute“, „Do., 13. Nov.“) |
| `view.js` | Knopf „+ Termin“, Liste „Nächste Termine“ in Gruppen; zeichnet bei Ereignis `daten` neu |
| `bearbeiten.js` | Modal: neu/bearbeiten/löschen, ganztägig blendet Uhrzeiten aus |
| `erkennen.js` | Schnelleingabe verstehen: Text → Titel, Start, Ende, ganztägig (reine Funktion) |
| `woche.js` | Wochenansicht Mo–So mit Pfeilen ‹ ›, Zeitraum antippen = diese Woche |
| `google.js` | Google-Abruf über die Supabase-Funktion, Zwischenspeicher im Gerät (IndexedDB `meta`, `kalender:google`), höchstens alle 15 Min. |
| `google-adresse.js` | Modal (Chip „Google“): geheime iCal-Adresse eintragen/entfernen, Stand des letzten Abrufs |
| `ical.js` | .ics lesen: Titel, Beginn, Ende, Ort, ausgelassene/verschobene/abgesagte Termine |
| `wiederholung.js` | Wiederholungen (RRULE) ausrechnen: täglich/wöchentlich (auch Mo+Do)/monatlich/jährlich, Anzahl, Enddatum |
| `schnelleingabe.js` | Feld oben + Vorschau-Zeile („Fr., 13. Nov. · 19:00–22:00 · Kino“), Enter legt an |
Stile: `src/styles/kalender.css`.

## Stand
- [x] a) Grundgerüst + Liste gebaut und lokal geprüft (08.11.2026): anlegen, ganztägig über mehrere Tage,
      bearbeiten, löschen; Mac und iPhone-Größe. `sw.js` auf `v34`. Kopfbild fehlt noch (Teil e).
- [ ] Lukas: Migration `005_kalender.sql` ausführen, dann Abgleich Mac ↔ iPhone prüfen (gepushte Fassung)
- [x] b) Schnelleingabe gebaut und lokal geprüft (08.11.2026): 19 Beispielsätze richtig erkannt
      (Wochentag, heute/morgen/übermorgen, Datum mit/ohne Jahr, Uhrzeit, Spanne, über Mitternacht).
      „ganztägig“ in der Liste klein und kursiv, damit die Titel bündig bleiben. `sw.js` auf `v35`.
- [x] c) Woche gebaut und lokal geprüft (08.11.2026): Chips „Liste · Woche“, Pfeile, mehrtägige Termine an jedem Tag,
      heutiger Tag in Elfenbein. Gewählte Ansicht wird pro Gerät gemerkt (localStorage, wie der Filter der To-dos)
      statt in `einstellungen`. Wischen weggelassen (Pfeile reichen). `sw.js` auf `v36`.
- [x] d) Google gebaut und lokal geprüft (08.11.2026): Leser mit Testseite `tests/kalender-ical.html` (10 Fälle) und
      einer echten Google-Datei (Feiertage, 462 Termine, 8 ms); Anzeige gedämpft, nicht antippbar. `sw.js` auf `v38`.
      Supabase-Funktion: `supabase/functions/google-kalender/index.ts`; die App schickt die Adresse mit, die Funktion
      lässt nur `https://calendar.google.com/calendar/ical/…` zu und nur mit Login (JWT-Prüfung an lassen).
      Termine von 90 Tagen zurück bis 1 Jahr voraus. Grenzen (bewusst): Zeitzone von Google-Terminen wird als
      Gerätezeit genommen; seltene Wiederholungen („2. Dienstag im Monat“) zeigen nur den ersten Termin.
- [ ] Lukas: Funktion im Supabase-Dashboard anlegen, Adresse über den Chip „Google“ eintragen, auf Mac und iPhone prüfen
- [ ] e) Kopfbild + Abschluss
- [x] Review von b umgesetzt: Ansicht zeichnet sich jede Minute und beim Zurückkehren in die App neu
      (Mitternacht, vorbei gegangene Termine); ungültige Daten wie „31.11.“ werden nicht mehr erkannt;
      kleine Aufräumarbeiten. `sw.js` auf `v37`.
- Test der Erkennung: `tests/kalender-erkennen.html` (20 Sätze, fester Zeitpunkt). Nach Änderungen an `erkennen.js`
  öffnen: http://localhost:8000/tests/kalender-erkennen.html → muss „✓ Alle 20 richtig“ zeigen.
