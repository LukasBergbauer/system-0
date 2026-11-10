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
    text: `Lies CLAUDE.md, docs/module/physio.md und src/module/physio/arten.js (Bereiche = Spalte art, Feld-Schlüssel = felder).
Ich schicke dir eine Lerndatei: ___
Thema / Bereich: ___ (z. B. krankheitsbild, uebung, muskel, technik, trainingsform, region)
Verknüpfen mit vorhandenen Punkten: ___ (Titel, oder „selbst wählen“)

1. Prüfe den Inhalt fachlich (Physiotherapie). Nenne jeden Fehler kurz (Stelle, falsch, richtig) und korrigiere ihn. Nichts erfinden; Unklares nachfragen.
2. Teile den Inhalt in Physio-Punkte (ein Punkt = ein Begriff, z. B. ein Krankheitsbild, eine Übung).
3. Schreib jeden Punkt im System-0-Stil (reiner Text, kein Markdown – wird nicht formatiert):
   - titel: Fachbegriff, kurz (z. B. „Impingement-Syndrom Schulter“)
   - kurz: Kernaussage in einem Satz, höchstens 15 Wörter
   - felder: alle Felder des Bereichs aus arten.js füllen; je Feld 1–4 Zeilen, jede Zeile beginnt mit „• “, konkret (Zahlen, Dosierung, Tests mit Namen)
   - text (Notizen), Blöcke mit Leerzeile getrennt, jeder Block beginnt mit seinem Label:
     MERKE: 1–3 Merksätze, einfach und bildhaft
     SO STELLST DU ES DIR VOR: ein Alltagsbild oder Vergleich
     PRAXIS: ein kurzes Beispiel aus der Behandlung
     QUIZ: 2–3 Zeilen „Frage? → Antwort“
   - Kurze Sätze, einfache Wörter, Fachbegriffe beim ersten Mal in Klammern erklärt, „→“ für Folgen.
4. Schreib eine SQL-Datei supabase/physio-import/<thema>.sql und gib sie zusätzlich vollständig als sql-Codeblock in den Chat (ich füge sie im Supabase-SQL-Editor ein, die App holt die Punkte dann per Sync):
   - Texte in Dollar-Quotes $t$…$t$ (keine Probleme mit Apostrophen); in felder (JSON) Zeilenumbrüche als \\n.
   - Je Punkt:
     insert into public.physio_eintraege (id, user_id, art, titel, kurz, text, felder)
     select gen_random_uuid(), (select id from auth.users limit 1), $t$<art>$t$, $t$<titel>$t$, $t$<kurz>$t$, $t$<text>$t$, $t\${"<schluessel>":"<wert>"}$t$::jsonb
     where not exists (select 1 from public.physio_eintraege where titel = $t$<titel>$t$ and not deleted);
   - Je Verknüpfung (auch zu vorhandenen Punkten, notiz = 2–4 Wörter oder leer):
     insert into public.physio_links (id, user_id, a_id, b_id, notiz)
     select gen_random_uuid(), a.user_id, a.id, b.id, $t$<notiz>$t$ from public.physio_eintraege a, public.physio_eintraege b
     where a.titel = $t$<titel a>$t$ and b.titel = $t$<titel b>$t$ and not a.deleted and not b.deleted;
5. Am Ende im Chat: Liste der Korrekturen, neue Punkte, Verknüpfungen. Committen, git push mache ich.`,
  },
];
