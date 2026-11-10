// Vorlagen für die Kachel „Prompts“, solange Lukas noch nichts gespeichert hat.
export const PROMPT_VORLAGEN = [
  {
    titel: 'Neue Sitzung',
    text: `Lies CLAUDE.md, docs/roadmap.md und docs/module/___.md.

Auftrag: ___`,
  },
  {
    titel: 'Lernzettel',
    text: `Ich schicke dir eine Lerndatei: ___

1. Prüfe den Inhalt fachlich auf Fehler. Nenne jeden Fehler kurz (Stelle, was falsch ist, was richtig ist) und korrigiere ihn.
2. Mach daraus einen anschaulichen, gut verständlichen Lernzettel auf Deutsch: kurze Sätze, einfache Wörter, Fachbegriffe kurz erklärt, nichts erfinden.

Aufteilung: ___ (z. B. nach Themen, Kapiteln oder Frage/Antwort)
Aufbau je Abschnitt: ___ (z. B. Kernaussage, Merksätze, Beispiele, Quizfragen)
Ziel: ___ (z. B. Datei docs/lernen/<thema>.md oder Fragen fürs Wissen-Quiz in der App)

Wenn etwas in der Datei unklar ist, frag nach, statt zu raten. Am Ende: Liste der Korrekturen und wo der Lernzettel liegt.`,
  },
  {
    titel: 'Lernzettel → Physio',
    text: `Lies CLAUDE.md und src/module/physio/datenbank.js.
Hier ist meine Lerndatei: ___

1. Prüfe den Inhalt fachlich (Physiotherapie). Nenne jeden Fehler kurz (Stelle, falsch, richtig) und korrigiere ihn. Nichts erfinden; Unklares nachfragen.
2. Mach daraus einen anschaulichen Lernzettel im System-0-Stil und speichere ihn als lernzettel/physio/<thema-klein-mit-bindestrichen>.md.
3. Trag ihn oben in lernzettel/physio/index.json ein: {"datei":"<name>.md","titel":"…","kurz":"Kernaussage in einem Satz","thema":"z. B. Schulter","datum":"JJJJ-MM-TT"}.
4. Committen (kurze deutsche Nachricht), git push mache ich. Im Chat nur: Korrekturen + Titel des Lernzettels.

System-0-Stil (nur dieses Markdown: #, ##, ###, -, 1., >, **fett**, *kursiv*, ---; keine Tabellen, Bilder oder Links):
# Titel
> **Kernaussage:** ein Satz, worum es geht.

## Das Wichtigste
- 3–5 Stichpunkte, je eine Zeile

## Verstehen
Kurze Absätze (2–3 Sätze). Fachbegriffe beim ersten Mal **fett** mit Erklärung in Klammern. „→“ für Ursache → Folge.

## So stellst du es dir vor
Ein Bild oder Vergleich aus dem Alltag.

## Praxis
1. Befund/Tests mit Namen  2. Behandlung  3. Dosierung konkret (Zahlen)

## Merksätze
> kurz, einprägsam (2–3 Zitat-Zeilen)

## Typische Fehler
- was man leicht verwechselt

---
## Quiz
1. **Frage?** – Antwort (5 Fragen)

Kurze Sätze, einfache Wörter, Deutsch. Lang ist ok, aber jede Zeile muss etwas bringen.`,
  },
];
