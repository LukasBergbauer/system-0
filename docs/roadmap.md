# Roadmap

Reihenfolge bewusst klein gehalten: erst ein Kern, den Lukas täglich nutzt, dann wachsen.

**Regel (ab 09.11.2026):** Stand und Pläne knapp hier bzw. in der Modul-Doku vermerken **und** immer auch in den Chat. So wenig Zeilen wie möglich, so viel wie nötig.
**Regel (ab 09.11.2026):** Supabase-Migrationen/SQL immer zusätzlich vollständig als Codeblock in den Chat.

**Regel (ab 23.11.2026):** Jeder offene Schritt trägt eine Modell-Empfehlung `[Modell, Aufwand]`; Claude nennt sie auch im Prompt für die nächste Sitzung.

Erledigte Phasen 0–12 und Phase 11 Schritte 1–5: `docs/roadmap-archiv.md` (nur bei Bedarf lesen).

## Phase 11 – Prioritätspyramide (ab 22.11.2026)
Pyramide fertig (Modul + Heute-Feld), Doku `docs/module/pyramide.md`. Schritte 1–5 im Archiv.
Schritt 6 (Aufräumen je Bereich) geht in Phase 12 auf.

## Phase 13 – Feinschliff & Alltagstauglichkeit (ab 25.11.2026, automatische Kette)
Läuft über geplante Aufgaben (je Schritt eine Sitzung, ~12 Min Abstand, Stopp bei 90 % des 5-h-Limits). Regeln wie Phase 12.
- [x] 1. Kalender: Migration 019 prüfen (SQL als Codeblock in den Chat, Lukas führt aus), Code gegen Doku prüfen. [Sonnet, mittel]
      Stand 25.11.: Code passt zur Doku, nur Dateitabelle ergänzt. Lukas: 019 im SQL-Editor ausführen (falls noch nicht).
- [x] 2. Heute erweitern: Routine-Status, Training des Tages, Quiz des Tages, Streaks im festen Tagesfeld. [Sonnet, mittel]
      Stand 25.11.: Kästchen Quiz + Serie neu (`serien.js`), Routinen/Training springen zur offenen Einheit; mit Testdaten geprüft. Lukas: mit echten Daten ansehen.
- [x] 3. Leistung iPhone: Unschärfe/Farbwolken entschärfen, Offline-Cache (`sw.js`) aufräumen, Version hochzählen. [Sonnet, niedrig]
      Stand 25.11.: Unschärfe auf Touch-Geräten 22→12 px (auch Routinen-Fenster, vorher 30 px), `gleiten.js` fehlte im Cache, sw v160. Lukas: Scrollen auf dem iPhone ansehen.
- [x] 4. Roadmap kürzen: Phase 12 nach `roadmap-archiv.md`. [Sonnet, niedrig]
      Stand 25.11.: Phase 12 steht jetzt im Archiv, Roadmap kurz.
- [x] 5. Abschluss-Prüfung: im Browser (Mac + iPhone-Breite) alle Module durchklicken, Animationen auf Ruckeln prüfen (Dauer, Einblenden, Übergänge), ALLE Funktionen testen (anlegen, abhaken, bearbeiten, löschen, Sync), Fehler beheben, Ergebnis in Chat + Doku. [Sonnet, mittel]
      Stand 25.11.: Vorschau (`tests/vorschau.html`) Mac + iPhone-Breite: alle 13 Seiten laden, kein Überlauf, keine Konsolenfehler; To-do anlegen/abhaken/bearbeiten/löschen ok. Animationen ≤ 420 ms, nur Seitenleiste + Routinen-Balken animieren Breite (bewusst), 2 Unschärfe-Elemente. Lukas: Login/Sync, Scrollen und Routinen/Training/Ziele mit echten Daten auf dem iPhone ansehen; Migration 019 ausführen.
