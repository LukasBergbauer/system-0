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
];
