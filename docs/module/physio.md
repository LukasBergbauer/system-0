# Modul: PhysioZentrum
**Phase 2** (Datenbank), **Phase 5** (Mindmap, Notion).

## Inhalte
Übungen, Krankheitsbilder, Muskeln, Körperregionen, Techniken, Vorgehen. Nur allgemeines Fachwissen, keine Patientendaten.

## Funktionen
- Suche nach Muskel, Krankheitsbild, Körperregion, Technik
- Alles untereinander verlinkbar (z. B. Krankheitsbild → betroffene Muskeln → passende Übungen)
- Medien: Text, Bilder, eigene Fotos, Video-Links
- Übungen lassen sich ins Trainings-Notebook übernehmen

## Später
- **Mindmap:** Startpunkt Körperregion, dann Schritt für Schritt tiefer bis zum Ziel (z. B. zur passenden Übung)
- **Notion:** Abgleich braucht einen kleinen Server-Teil (Supabase Edge Function, gratis), weil der Notion-Schlüssel
  nicht im Browser-Code stehen darf. Vorher klären, ob Notion Quelle oder nur Kopie sein soll.

## Stand
Noch nicht begonnen. Vorgezogen: kommt direkt nach der Design-Runde (Lukas' Wunsch, 04.11.2026):
Inhalte sollen schnell hinzugefügt und bearbeitet werden können.

## Plan für den Einstieg (nächste Sitzung)
1. Erst nur reden: Was zuerst (Übungen, Krankheitsbilder, Muskeln, Körperregionen, Techniken)? Welche Felder je Eintrag?
   Wie sieht „schnell hinzufügen“ aus? Wie werden Einträge verlinkt? Bilder schon im ersten Schritt oder später?
2. Datenmodell + Plan in Teilen (a, b, …) hier eintragen, Okay abwarten, dann bauen.
3. Design nach `docs/design.md` („Stein & Licht“): Kopf mit eigenem Foto (3 Varianten von Lukas, Prompt in `design.md`),
   `--farbe-physio`, Bausteine `kachel`, `chips`, Gruppen-Liste wie bei den To-dos.
4. Symbol `physio` in `src/ui/symbol.js` ergänzen; Bereich mit `bild: [...]` anmelden.
