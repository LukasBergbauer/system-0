# Modul: Pyramide (Prioritäten-Erinnerung)
**Phase 11.** Eigenes Modul (Lukas, 23.11.2026).

## Idee (geklärt 23.11.2026)
- **Keine To-do-Liste**, nichts abhaken. Ein tägliches Abbild: was hat zurzeit Priorität.
- Ebenen von unten nach oben: unten groß und wichtig (Fundament), oben klein und speziell (der Reihe nach).
- **Ein Begriff pro Ebene.**
- **Viele Pyramiden** anlegbar: eine große dauerhafte + kleine, abends für morgen erstellt.
- Keine Verbindung zu To-dos, Terminen, Routinen, Gewohnheiten.

## Stand
- [x] Geklärt. Muster `muster/pyramide.html`: **A · Stufen** gewählt (23.11.): Balken nach oben schmaler und heller, unten kräftig in Akzentfarbe.
- [x] Datenmodell (23.11.): Tabelle `pyramiden` (`026_pyramiden.sql`): titel, art `dauerhaft`/`tag`, tag (Datum), ebenen text[] (Index 0 = Fundament unten), reihenfolge. Lesen/Schreiben nur über `core/store.js`.
- [x] Modul gebaut (23.11.): `src/module/pyramide/` (data, view, stufen, bearbeiten), Symbol `pyramide`, Nav in „Körper & Kopf“, `styles/pyramide.css`. Segment wechselt Pyramiden, Modal legt an/bearbeitet/löscht (Ebenen eine je Zeile, oben = Spitze). Im Browser nur ohne Login geprüft (Ansicht direkt gemountet).
- [x] Heute (23.11.): Feld `pyramide` zeigt die Tages-Pyramide von heute, sonst die dauerhafte (`heute/pyramide-karte.js`). Nachbesserung: Stufen füllen die Karte, lange Begriffe brechen um, leere Ebenen ignoriert, ohne Pyramide Hinweis „Tippen zum Anlegen“, 1×1 zeigt das Fundament. `sw.js` `v135`.
- [ ] Nächster Schritt: Funktions-Redesign je Bereich (Roadmap Phase 11, Schritt 6).
