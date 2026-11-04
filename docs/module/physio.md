# Modul: PhysioZentrum
Vorgezogen nach Phase 1 (Datenbank + Mindmap), **Phase 5** (Lernpfade, Notion).

## Inhalte
Übungen, Krankheitsbilder, Muskeln, Körperregionen, Techniken, Vorgehen. Nur allgemeines Fachwissen, keine Patientendaten.

## Funktionen
- Suche nach Muskel, Krankheitsbild, Körperregion, Technik
- Alles untereinander verlinkbar (z. B. Krankheitsbild → betroffene Muskeln → passende Übungen)
- Medien: Text, Bilder, eigene Fotos, Video-Links
- Übungen lassen sich ins Trainings-Notebook übernehmen

## Später
- **Lernpfade:** in der Mindmap Schritt für Schritt von der Körperregion bis zur passenden Übung
- **Notion:** Abgleich braucht einen kleinen Server-Teil (Supabase Edge Function, gratis), weil der Notion-Schlüssel
  nicht im Browser-Code stehen darf. Vorher klären, ob Notion Quelle oder nur Kopie sein soll.

## Stand
Gespräch vom 04.11.2026 abgeschlossen, Datenmodell und Plan stehen (unten). **Wartet auf Lukas' Okay**, dann Teil a.

## Entscheidungen (Gespräch 04.11.2026)
- Zuerst: Übungen, Krankheitsbilder, Muskeln + Regionen. Techniken gibt es als Art schon, Inhalte später.
- **Mindmap ist von Anfang an die Hauptansicht** (Lukas' Vision): Knopf drücken → Animation in ein
  helles, weißes Overlay mit schwebender Mindmap, die alles miteinander verbindet. Hinzufügen und
  Verknüpfen passiert direkt dort. Keine eigene Listenansicht im ersten Schritt.
- **Fokus-Karte:** ein Punkt in der Mitte, seine Verknüpfungen schweben drumherum. Antippen eines Nachbarn →
  er gleitet in die Mitte, seine Nachbarn schweben ein. Jeder Punkt ist so seine eigene Mindmap.
  Mac: Hovern zeigt die Kurzbeschreibung.
- **Start: Suche zuerst.** Das Overlay öffnet mit Suchfeld; der gewählte Eintrag wird die Mitte.
- **Eintrag = Basis + Felder je Art:** alle haben Titel, Kurzbeschreibung (Vorschau in der Mindmap), Text, Video-Link;
  dazu optionale Felder je Art (Übung: Ausgangsstellung, Durchführung, Dosierung, Häufige Fehler ·
  Krankheitsbild: Ursache, Symptome, Tests, Behandlung · Muskel: Ursprung, Ansatz, Funktion, Innervation ·
  Technik: Ziel, Durchführung, Kontraindikationen · Region: nur Basis).
- **Verknüpfen per Knopf:** „+ Verknüpfen“ → suchen → wählen. Gilt in beide Richtungen.
- Bilder/eigene Fotos: später (eigener Teil); im ersten Schritt nur Video-Link als Feld.
- Mindmap selbst gebaut (HTML-Punkte + SVG-Linien + CSS-Bewegung), keine Bibliothek.

## Datenmodell (`supabase/migrations/003_physio.sql`)
| Tabelle | Spalten (dazu die gemeinsamen aus `datenmodell.md`) |
|---|---|
| `physio_eintraege` | `art` (uebung, krankheitsbild, muskel, region, technik), `titel`, `kurz`, `text`, `felder` (JSON, optionale Felder je Art), `video` |
| `physio_links` | `a_id`, `b_id` (Verknüpfung in beide Richtungen, ohne Fremdschlüssel wie bei den To-dos) |
Eine Tabelle für alle Arten statt fünf: Suche, Hinzufügen und Verknüpfen funktionieren überall gleich,
neue Arten brauchen keine neue Tabelle. Medien kommen später als eigene Tabelle.

## Plan (Teile a → f, eine oder mehrere Sitzungen, nach jedem Teil kurz prüfen)
- a) **Grundgerüst + Daten:** Lukas führt `003_physio.sql` aus; Tabellen in `src/core/tabellen.js`;
  Modul `src/module/physio/` mit `daten.js` (Arten + Felder je Art, Suche, Nachbarn, verknüpfen/lösen,
  doppelte Verknüpfung verhindern); Bereich `physio` anmelden (Symbol in `symbol.js`, Fotos `physio-1…3.webp`,
  `--farbe-physio`). Seite: Kopfbild, großer Knopf „Mindmap öffnen“, kleine Kacheln mit Anzahl je Art.
  Kein Bild da → Bereich ohne Foto, bis Lukas die 3 Fotos liefert
- b) **Overlay + Suche:** Knopf → Overlay öffnet sich mit Animation (aus dem Knopf heraus aufblenden), hell/weiß,
  Schließen per ✕/Esc/Zurück. Oben Suchfeld (Titel, Kurzbeschreibung, Felder), Treffer mit Art-Label.
  Leer → „Ersten Punkt anlegen“ (Art-Chips + Titel, Enter)
- c) **Fokus-Karte:** gewählter Eintrag in der Mitte, Nachbarn im Kreis, Linien als SVG, Art an Form/Label erkennbar.
  Antippen eines Nachbarn → gleitet in die Mitte, alte Nachbarn blenden aus, neue schweben ein.
  Verlauf (zurück zum vorigen Punkt), Mac: Hover zeigt Kurzbeschreibung. Viele Nachbarn (> 8): zweiter Ring
- d) **In der Mindmap hinzufügen und verknüpfen:** „+“ an der Mitte → neuer Punkt (Art-Chips + Titel, Enter),
  sofort verknüpft und erscheint schwebend. „Verknüpfen“ → Suche nach vorhandenem Punkt. Verknüpfung lösen
  (lange drücken bzw. Rechtsklick auf Nachbarn)
- e) **Punkt öffnen:** Antippen der Mitte öffnet die Karte des Eintrags (Basis + Felder je Art), bearbeiten,
  löschen (mit Rückfrage), Video-Link öffnen
- f) **Feinschliff:** Bewegungen ruhig, „Bewegung reduzieren“ beachten, iPhone (Wischen, Tippflächen 44 px)
  und Mac prüfen; neue Dateien in `APP_FILES` von `sw.js`, `VERSION` hochzählen
- Später: eigene Fotos/Bilder, Übungen ins Trainings-Notebook übernehmen, Notion

## Offen / bitte prüfen
- Das Overlay ist hell (Elfenbein-Weiß mit dunkler Schrift), während die App sonst dunkel ist. So gewünscht;
  falls es zu grell wirkt, später einen Ton dunkler.
- Foto-Objekt für den Kopf (Prompt in `design.md`), Vorschlag: „a smooth stone sphere connected to smaller pebbles
  by thin threads of light“ oder einfacher „a stone anatomical vertebra“.

