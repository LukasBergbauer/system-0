# Phase 13 – Ablauf der automatischen Kette

Zwei Rollen. Keine Rückfragen an Lukas (niemand da): selbst entscheiden, kleine Schritte, nichts in Supabase löschen. CLAUDE.md im Projekt gilt.

## Rolle A: Starter (geplante Aufgabe)
1. 5-h-Limit prüfen (`mcp__ccd_session_mgmt__get_usage`, vorher per ToolSearch laden). ≥ 90 %: keine Arbeit; Starter für `resetsAt` + 10 Min planen (Punkt 5), beenden.
2. In `docs/roadmap.md` (nur Abschnitt Phase 13) den ersten Schritt mit `[ ]` nehmen. Keiner mehr: Kette fertig, nichts planen.
3. Neue Sitzung starten mit `mcp__ccd_session__start_session` (per ToolSearch laden): `initiation` user_asked, `context` fresh, `use_worktree` false, `model` und `effort` nach Empfehlung im Schritt (Sonnet = `claude-sonnet-5-5`, Opus = `claude-opus-5-5`; niedrig/mittel/hoch → low/medium/high),
   `prompt` = „Lies /Users/lukas/Projekte/system-0/docs/phase13-kette.md und arbeite als Rolle B den ersten offenen Schritt von Phase 13 ab.“,
   `background` = Projekt system-0, automatische Kette, Details in docs/phase13-kette.md.
   Scheitert der Start: Schritt selbst als Rolle B ausführen.
4. Starter beendet sich (Arbeit macht die neue Sitzung).

## Rolle B: Arbeiter (gestartete Sitzung)
1. Genau den ersten offenen Schritt aus Phase 13 ausführen; nur nötige Doku lesen. Abschluss-Prüfung (Schritt 5): Dev-Server per Bash im Hintergrund (`python3 -m http.server 8000 --bind 127.0.0.1`), Built-in-Browser, Mac- und iPhone-Breite; erst Text/DOM/JS, wenige Screenshots (scale 0.5). Animationen per JS prüfen (Dauer > 300 ms, animierte width/height/top statt transform/opacity, Unschärfe auf vielen Elementen), alle Funktionen jedes Moduls testen (anlegen, abhaken, bearbeiten, löschen, Umschalter, Fenster, Navigation, Konsole ohne Fehler), Fehler beheben. Was nur Lukas prüfen kann (Login, echter Sync, iPhone-Gerät): als offene Liste festhalten.
2. Schritt in `docs/roadmap.md` mit `[x]` + kurzem Stand abhaken. `sw.js`-Version hochzählen, wenn Cache-Dateien betroffen sind. Neues SQL vollständig als ```sql in den Chat.
3. Committen (kurz, deutsch, Zeile `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`) und `git push`.
4. Gibt es noch einen offenen Schritt: 5-h-Limit prüfen (≥ 90 % → Termin = `resetsAt` + 10 Min), sonst `create_scheduled_task` (per ToolSearch laden) mit `fireAt` = jetzt + 12 Min (Zeit per `date`, ISO mit Offset), neue `taskId` `phase13-start-<Zahl>`, title „Phase 13 – Schritt <Nr. des nächsten offenen Schritts>: <Kurzname>“ (damit jeder Chat in der Seitenleiste erkennbar ist), prompt =
   „Projekt /Users/lukas/Projekte/system-0. Lies docs/phase13-kette.md und arbeite als Rolle A (Starter).“
5. Chat-Schluss: 2–4 Zeilen Stand + was Lukas tun muss.
