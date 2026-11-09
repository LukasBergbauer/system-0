# System 0 – persönliches Lebenssystem von Lukas

Diese Datei liest Claude Code zu Beginn jeder Sitzung. Sie enthält nur die festen Regeln.
Details stehen in `docs/`. Lies immer nur die Doku, die für die aktuelle Aufgabe nötig ist.

## Was System 0 ist
Eine persönliche App nur für Lukas: Termine, To-dos, Routinen, Training, Physio,
Gewohnheiten, Lebensziele, Affirmationen, Wissen-Quiz, Bücher, Insta-Organizer.
Läuft auf Mac und iPhone als PWA (Web-App auf dem Homescreen), gleiche Daten, synchronisiert.

## Feste Regeln
1. **Alles kostenlos.** Hosting über GitHub Pages (oder Cloudflare Pages), Daten in Supabase Free.
   Keine kostenpflichtigen Dienste, Abos oder Bibliotheken.
2. **Nur ein Nutzer.** Login über Supabase Auth, Row Level Security auf jeder Tabelle (`user_id = auth.uid()`).
3. **Keine Patientendaten.** Kein Bezug zum Praxis-Terminkalender. Das Physio enthält nur allgemeines Fachwissen.
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
- Einfach machen. Kleine Schritte, Rückfragen nur, wenn wirklich etwas unklar ist.
- So tokensparend wie möglich schreiben. Keine unnötigen Zeilen, keine Erklärungen, was an Doku geändert wurde.
- Nach jeder abgeschlossenen Aufgabe „Stand“ (knapp) in Modul-Doku und `docs/roadmap.md` vermerken, damit Claude aktuell ist,
  **und** Pläne, Ergebnisse und Infos immer auch in den Chat. So wenig Zeilen wie möglich, so viel wie nötig.
- **Supabase:** Jede neue Migration bzw. jedes SQL immer zusätzlich vollständig als ```sql-Codeblock in den Chat
  (zum direkten Reinkopieren in den SQL-Editor), nicht nur den Dateinamen nennen.
- Dann **direkt** committen (kurze deutsche Nachricht), ohne zu fragen. `git push` macht Lukas selbst.
- Danach kurz sagen, was gemacht wurde (wenige Zeilen).
- **Übergabe:** Erst wenn eine Aufgabe komplett fertig ist, „Aufgabe fertig, bitte neue Sitzung starten.“ und einen
  kurzen Prompt zum Reinkopieren (CLAUDE.md, docs/roadmap.md, passende Fach-Doku, konkreter Auftrag).
  Den Plan für den nächsten Schritt in Roadmap bzw. Modul-Doku und in den Chat. Keine Werkzeug-Checkliste.

## Tokens sparen
- Immer die einfachste Lösung, die funktioniert (Ponytail). Keine Vorrats-Funktionen, keine unnötigen Abstraktionen.
- Agent Skills nur für Planen und Testen; Deployment-, CI-, Team- und Release-Abläufe nur auf Nachfrage.
- Nichts selbst installieren; Lukas den Befehl fürs Terminal nennen.
- Lange Ausgaben kürzen, Dateien nicht mehrfach lesen, keinen Code wiederholen.

## Wegweiser
- Aufbau & Ordner: `docs/architektur.md`
- Datenbank & Sync: `docs/datenmodell.md`
- Design: `docs/design.md`
- Reihenfolge & Fortschritt: `docs/roadmap.md`
- Einrichtung (einmalig): `docs/start.md`
- Module: `docs/module/*.md`
