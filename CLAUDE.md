# System 0 – persönliches Lebenssystem von Lukas

Diese Datei liest Claude Code zu Beginn jeder Sitzung. Sie enthält nur die festen Regeln.
Details stehen in `docs/`. Lies immer nur die Doku, die für die aktuelle Aufgabe nötig ist.

## Was System 0 ist
Eine persönliche App nur für Lukas: Termine, To-dos, Routinen, Training, PhysioZentrum,
Gewohnheiten, Lebensziele, Affirmationen, Wissen-Quiz, Bücher, Insta-Organizer.
Läuft auf Mac und iPhone als PWA (Web-App auf dem Homescreen), gleiche Daten, synchronisiert.

## Feste Regeln
1. **Alles kostenlos.** Hosting über GitHub Pages (oder Cloudflare Pages), Daten in Supabase Free.
   Keine kostenpflichtigen Dienste, Abos oder Bibliotheken.
2. **Nur ein Nutzer.** Login über Supabase Auth, Row Level Security auf jeder Tabelle (`user_id = auth.uid()`).
3. **Keine Patientendaten.** Kein Bezug zum Praxis-Terminkalender. Das PhysioZentrum enthält nur allgemeines Fachwissen.
4. **Keine Secrets im Code.** Der Supabase-anon-Key ist erlaubt (durch RLS geschützt), alles andere nicht.
5. **Technik:** Vanilla HTML, CSS und JavaScript mit ES-Modulen. Kein Framework, kein Build-Schritt.
   Externe Bibliotheken nur, wenn wirklich nötig, über eine CDN-URL mit fester Version.
6. **Viele kleine Dateien.** Eine Datei = eine Aufgabe. Richtwert: unter 200 Zeilen pro Datei.
7. **Module sind getrennt.** Jedes Modul hat einen Ordner `src/module/<name>/` und eine Doku `docs/module/<name>.md`.
   Module sprechen nur über `src/core/` miteinander, nie direkt in die Dateien eines anderen Moduls.
8. **Local-first.** Jede Änderung wird zuerst lokal (IndexedDB) gespeichert, dann synchronisiert. Offline muss alles lesbar sein.
9. **Design** strikt nach `docs/design.md`. Farben und Abstände nur über die Variablen in `src/styles/tokens.css`.
10. **UI-Sprache:** Deutsch.

## Arbeitsweise mit Lukas
- Kleine Schritte. Vor größeren Änderungen kurz den Plan nennen und auf Okay warten.
- Lukas will verstehen, was passiert: kurz und verständlich erklären, keine Fachwort-Lawinen.
- Rückfragen stellen, wenn etwas unklar ist, statt zu raten.
- Nach jeder abgeschlossenen Aufgabe: den Abschnitt „Stand“ in der Modul-Doku und `docs/roadmap.md` aktualisieren,
  dann einen Git-Commit mit kurzer deutscher Nachricht.

## Wegweiser
- Aufbau & Ordner: `docs/architektur.md`
- Datenbank & Sync: `docs/datenmodell.md`
- Design: `docs/design.md`
- Reihenfolge & Fortschritt: `docs/roadmap.md`
- Einrichtung (einmalig): `docs/start.md`
- Module: `docs/module/*.md`
