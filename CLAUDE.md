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
- **Übergabe an neue Sitzung:** Erst wenn eine Aufgabe komplett abgeschlossen ist (gebaut, geprüft,
  Doku aktualisiert, committet), Lukas klar sagen: „Aufgabe fertig, bitte neue Sitzung starten.“
  Dazu einen fertigen Prompt zum Reinkopieren für den nächsten Schritt liefern. Er nennt die nötigen
  Dateien (immer CLAUDE.md und docs/roadmap.md, dazu nur die passende Fach-Doku) und den konkreten Auftrag.
  Vorher den abgestimmten Plan für den nächsten Schritt in die Roadmap bzw. Modul-Doku schreiben,
  damit die neue Sitzung ohne den alten Chat weitermachen kann. Nie mitten in einer Aufgabe wechseln.
- **Werkzeug-Checkliste bei jeder Übergabe:** Direkt vor dem Prompt eine kurze Liste „Vor der nächsten Sitzung“
  geben. Sie sagt genau, **was** Lukas **wo** (normales Terminal / Claude Code / Ponytail-Leiste / Finder),
  **wann** (jetzt / vor dem Start / nach dem Start) und **wie** (exakter Befehl zum Kopieren) installieren,
  aktivieren, schreiben oder ausführen soll, um möglichst viele Tokens zu sparen. Zum Beispiel:
  - ob `/graphify .` nötig ist (ja nach einem fertigen Modul oder neuen Ordnern, sonst nein)
  - welcher Ponytail-Modus passt (Standard: full)
  - ob etwas im Terminal installiert werden muss (Befehl angeben)
  - ob die neue Sitzung im Ordner System 0 gestartet werden muss (`cd …` und `claude`)
  Ist nichts davon nötig, schreiben: „Nichts zu tun, einfach neue Sitzung starten.“

## Tokens sparen
Jede Sitzung kostet Tokens. Ziel: so wenig lesen, ausgeben und wiederholen wie möglich.

**Graphify (Projekt-Landkarte)**
- Gibt es `graphify-out/`, zuerst `graphify-out/GRAPH_REPORT.md` bzw. `graph.json` nutzen, um die richtige Stelle
  zu finden. Danach nur die wirklich nötigen Dateien lesen, nie ganze Ordner durchsuchen.
- Graphify nicht selbst neu bauen. Ist der Graph veraltet (neues Modul, neue Ordner, große Umbauten),
  das in der Werkzeug-Checkliste sagen.
- `graphify-out/` steht in `.gitignore` (kann jederzeit neu erzeugt werden). Fehlt der Eintrag, ergänzen.

**Ponytail (möglichst wenig Code)**
- Immer die einfachste Lösung, die funktioniert. Keine Vorrats-Funktionen, keine unnötigen Abstraktionen.
- Passt zu Regel 6: lieber eine kleine Datei weniger als eine zu viel.

**Agent Skills (Arbeitsabläufe)**
- Nutzen: Planen vor neuen Modulen und Testen nach Änderungen (damit andere Module nicht kaputtgehen).
- Nicht nutzen, außer Lukas fragt danach: Deployment-, CI-, Team- und Release-Abläufe.

**Allgemein**
- Nichts selbst installieren (Pakete, Programme, Tools). Lukas den Befehl fürs normale Terminal nennen.
  Das kostet ihn keine Tokens.
- Lange Ausgaben kürzen (z. B. `| tail -20`), Logs und Paketlisten nicht komplett lesen.
- Dateien nicht mehrfach lesen, wenn sich nichts geändert hat.
- Antworten kurz halten, keinen Code wiederholen, der schon in Dateien steht.
- Wird eine Sitzung lang, Lukas vorschlagen, `/compact` einzugeben, oder die Aufgabe sauber abschließen und übergeben.

## Wegweiser
- Aufbau & Ordner: `docs/architektur.md`
- Datenbank & Sync: `docs/datenmodell.md`
- Design: `docs/design.md`
- Reihenfolge & Fortschritt: `docs/roadmap.md`
- Einrichtung (einmalig): `docs/start.md`
- Module: `docs/module/*.md`
- Projekt-Landkarte (falls vorhanden): `graphify-out/GRAPH_REPORT.md`
