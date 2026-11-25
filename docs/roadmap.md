# Roadmap

Reihenfolge bewusst klein gehalten: erst ein Kern, den Lukas täglich nutzt, dann wachsen.

**Regel (ab 09.11.2026):** Stand und Pläne knapp hier bzw. in der Modul-Doku vermerken **und** immer auch in den Chat. So wenig Zeilen wie möglich, so viel wie nötig.
**Regel (ab 09.11.2026):** Supabase-Migrationen/SQL immer zusätzlich vollständig als Codeblock in den Chat.

**Regel (ab 23.11.2026):** Jeder offene Schritt trägt eine Modell-Empfehlung `[Modell, Aufwand]`; Claude nennt sie auch im Prompt für die nächste Sitzung.

Erledigte Phasen 0–10 und Phase 11 Schritte 1–5: `docs/roadmap-archiv.md` (nur bei Bedarf lesen).

## Phase 11 – Prioritätspyramide (ab 22.11.2026)
Pyramide fertig (Modul + Heute-Feld), Doku `docs/module/pyramide.md`. Schritte 1–5 im Archiv.
Schritt 6 (Aufräumen je Bereich) geht in Phase 12 auf.

## Phase 12 – Neugestaltung „Klar“ (ab 24.11.2026, Claude nach eigenem Urteil)
Zielbild: `docs/design.md` → Richtung „Glas, kräftig“ (Schritt 13 ersetzt „Klar“). Ein Commit je Bereich, jeder im Browser geprüft (Mac + iPhone-Breite).
Regeln: Pyramide bleibt ohne Verbindung zu anderen Modulen. Keine Daten in Supabase löschen.
Schwächen (Analyse 24.11.): Farbband-Kopf auf jeder Seite frisst Platz; Glas-Kästen in Glas-Karten; alles rosa getönt;
Mac nutzt nur 640 px; Heute zeigt To-dos 3× und Kalender 2×; To-dos: Überfälliges ganz unten, leere Gruppen;
gestaffelte Einblend-Animation (~1 s); Unschärfe auf jeder Karte (iPhone-Last); Pyramide weiße Schrift auf Hellrosa;
tote Dateien (Musterseiten, pausierte Fotos ~0,9 MB im Offline-Cache, „Kommt bald“, Verlauf-Kachel).
- [x] 0. Aufräumen: `muster/`, `bausteine*`, `docs/vorlagen/`, `assets/bilder/`, Kopfbilder, Sprüche, „Kommt bald“, Verlauf-Kachel gelöscht.
- [x] 1. Grund-Design: Papier statt Farbwolken, weiße Karten ohne Unschärfe, Kopf ohne Farbband, Abschnitte ohne Kasten, Navigation aktiv = dunkle Pille, Einblenden 220 ms. Vorschau `tests/vorschau.html` lädt jetzt immer frisch.
- [x] 2. Heute: doppelte Felder raus, To-dos direkt abhakbar, neues Standard-Layout (einmalig umgestellt), Akzent-Knopf weg, Pyramide lesbar.
- [x] 3. To-dos: Überfällig ganz oben, leere Gruppen weg, Heute/Morgen-Boxen und Akzent-Köpfe entfernt.
- [x] 4. Kalender: Segment statt Chips, Google-Adresse als Textknopf unten, ruhige Monats-/Listenansicht.
- [x] 5. Routinen (eine Kartenreihe, Art als Label) + Gewohnheiten (weiße Karten).
- [x] 6. Training: Umschalter + „+ Training“ in einer Zeile. Alle Tabs (auch in Fenstern) sehen jetzt aus wie das Segment.
- [x] 7. Visionen (flache Zeilen), Affirmationen („weil weil“ behoben), Pyramide (lesbar, schon in 2).
- [x] 8. Quiz: nur Grund-Design nötig (Karten, Umschalter), Rot/Grün im Ergebnis bleibt.
- [x] 9. Bücher: Cover ohne Kartenrahmen.
- [x] 10. Insta: Umschalter + Claude/Hashtags in einer Zeile, Abschnitts-Köpfe einheitlich.
- [x] 11. Physio: Startebene ohne Pfad-Zeile, Lücken neben der Suche, iPhone ohne Überbreite.
- [x] 12. Einstellungen (Verlauf-Kachel weg, ruhige Kacheln) + Navigation („Mehr“ am iPhone nach Alltag · Körper & Kopf · System gruppiert, aktiv = dunkle Pille).
- [x] 13. Überarbeitung nach Feedback Lukas (25.11.2026): „Klar“ wirkt bedrückend, soll **motivierend** aussehen. Erledigt: Glas zurück,
      Akzent-Flächen (Kopf, Navigation, Hauptknopf), festes Tagesfeld auf Heute (Variante A + Tageslinie), alle Bereiche nachgezogen.
      a) Heute-Kacheln wirken „Windows-mäßig“ (flach, grau, kantig) → zurück zum Stil davor (Glas, weiche Tiefe, farbig getönte
         Schatten, Farbwolken), aber ohne die doppelten Felder.
      b) Mehr Kontrast mit der Akzentfarbe: kräftige Akzent-Flächen und -Zahlen statt nur feiner Linien.
      c) Heute: **ein großes festes Feld ganz oben** (nicht verschieb- oder entfernbar), das den Tag zusammenfasst
         (fällig/überfällig, Termine, Routinen, Gewohnheiten, Training …), ohne das Wort „Willkommen“. Erst 2–3 Varianten als Muster zeigen.
      d) Danach alle Bereiche im gleichen Sinn nachziehen (Kopf, Karten, Farben), ein Commit je Bereich, Mac + iPhone prüfen.
      Regeln bleiben: Pyramide ohne Verbindung zu anderen Modulen, keine Daten in Supabase löschen. Funktionale Verbesserungen aus 0–12 bleiben.
- [x] 14. Affirmationen in Visionen eingebettet (je Schritt direkt unter der Zeile + im Schritt-Fenster), Navigationspunkt „Affirmationen" entfernt (25.11.2026). Tabelle `affirmationen` unverändert, nichts in Supabase gelöscht. `sw.js` `v158`.

## Phase 13 – Feinschliff & Alltagstauglichkeit (ab 25.11.2026, automatische Kette)
Läuft über geplante Aufgaben (je Schritt eine Sitzung, ~12 Min Abstand, Stopp bei 90 % des 5-h-Limits). Regeln wie Phase 12.
- [x] 1. Kalender: Migration 019 prüfen (SQL als Codeblock in den Chat, Lukas führt aus), Code gegen Doku prüfen. [Sonnet, mittel]
      Stand 25.11.: Code passt zur Doku, nur Dateitabelle ergänzt. Lukas: 019 im SQL-Editor ausführen (falls noch nicht).
- [ ] 2. Heute erweitern: Routine-Status, Training des Tages, Quiz des Tages, Streaks im festen Tagesfeld. [Sonnet, mittel]
- [ ] 3. Leistung iPhone: Unschärfe/Farbwolken entschärfen, Offline-Cache (`sw.js`) aufräumen, Version hochzählen. [Sonnet, niedrig]
- [ ] 4. Roadmap kürzen: Phase 12 nach `roadmap-archiv.md`. [Sonnet, niedrig]
- [ ] 5. Abschluss-Prüfung: im Browser (Mac + iPhone-Breite) alle Module durchklicken, Animationen auf Ruckeln prüfen (Dauer, Einblenden, Übergänge), ALLE Funktionen testen (anlegen, abhaken, bearbeiten, löschen, Sync), Fehler beheben, Ergebnis in Chat + Doku. [Sonnet, mittel]
