# Roadmap

Reihenfolge bewusst klein gehalten: erst ein Kern, den Lukas täglich nutzt, dann wachsen.

**Regel (ab 09.11.2026):** Stand und Pläne knapp hier bzw. in der Modul-Doku vermerken **und** immer auch in den Chat. So wenig Zeilen wie möglich, so viel wie nötig.
**Regel (ab 09.11.2026):** Supabase-Migrationen/SQL immer zusätzlich vollständig als Codeblock in den Chat.

**Regel (ab 23.11.2026):** Jeder offene Schritt trägt eine Modell-Empfehlung `[Modell, Aufwand]`; Claude nennt sie auch im Prompt für die nächste Sitzung.

Erledigte Phasen 0–8: `docs/roadmap-archiv.md` (nur bei Bedarf lesen).

## Phase 9 – Gewohnheiten-Raster + Overlay-Design (22.11.2026)
Plan:
- [x] 1. (v125) Gewohnheiten wie „FocusHero“: je Gewohnheit Glas-Karte (Symbol, Name, Summe), Pillen „Heute“ + Serie (Flamme),
      Jahres-Raster (Wochen-Spalten Jan–Dez, Mo/Mi/Fr), Stufen aus Akzent/Unterton, heute mit Rand, iPhone wischbar ab heute.
      Daten reichen → keine Migration. Lukas: bunt je Gewohnheit (`--gew-1…6`). Lokal geprüft Mac 1300 px + iPhone 375 px.
- [ ] 2. Seiten-Design (Lukas: alle Seiten sehen gleich aus, wirken leer/„reingeklatscht“ aus losen Blöcken): Muster `muster/seiten.html`
      (A Bühne · B Farbiger Kopf + Bento · C Ordner-Reiter). Lukas wählt **B**.
- [x] 3. (v126) Farbkopf auf allen Seiten (`kopfbild.css`), Bento (`bento.css`) in To-dos + Gewohnheiten (`design.md`). Lokal geprüft Mac + iPhone.
- [x] 6. (v127) Lukas: „eher A, aber nicht alles zusammengefasst“. Bento raus, Karten/Abschnitte wie davor, Tokens `--luft`/`--innen`/`--leiste`,
      `.leiste` mit eingebautem Knopf (To-dos). Lokal geprüft Mac + iPhone.
- [x] 7. (v128) System A in allen Modulen: `--luft`/`--innen` überall, `ui/leiste.js` (Kalender, Insta, Visionen), doppelte Hauptknöpfe
      weg („+ Termin“, „+ Post“), Erklärtexte gekürzt (Quiz, Einstellungen, leere Hinweise). Lokal geprüft Mac + iPhone.
      Physio bleibt wie es ist (Lukas).
- [x] 8. (v129) Kopf überall einheitlich (Affirmationen/Bücher ohne Sonderform), Gewohnheiten ohne Überstand: Titel skaliert,
      lange Namen brechen um, Pillen rutschen bei Platzmangel darunter, Raster-Ränder weich ausgeblendet, Heute-Rand nicht abgeschnitten.
      Geprüft 320 / 375 px. Offen bei Lukas: auf Geräten ansehen.
- [x] 5. Lukas: Bento zu gedrückt. Wunsch: ein System (gleiche Abstände, Schriftrollen, Rundungen), Knöpfe verschmelzen mit Leisten,
      Zusatztexte weg. Muster `muster/system.html` (A Ruhig & luftig · B Kapseln · C Flach mit Fuß-Aktion), Wahl offen.
      Danach: System in tokens/components, Bento-Fugen zurück, alle Module umstellen.
- [ ] 4. (ersetzt durch 5) Bento in den übrigen Modulen (Kalender, Routinen, Training, Physio, Visionen, Affirmationen, Quiz, Bücher, Insta, Einstellungen):
      je Modul Container `.bento`, lose Kästen zu Feldern, eine Hauptaktion im Fuß, Rest als Symbol, Text kürzen.

## Phase 10 – Sleek & edel + To-dos-Makeover (22.11.2026)
Lukas: weniger „bubbly“, edler; leichtes Glas bleibt, dazu strikte Linien und klare Auswahl (Segmente statt Kapseln). To-dos komplett neu, gut bedienbar.
Plan:
- [x] 1. Muster `muster/sleek.html` (A/B/C): Lukas: „sieht aus wie Windows“, lieber wie bisher, nur Feinschliff, mehr Apple.
- [x] 1b. Muster `muster/apple.html`: To-dos wie bisher + iOS-Feinschliff (Segment, Gruppen-Titel über Karte, eingerückte Linien,
      runde Haken, „!!“-Priorität, Erledigt als Zeile). Lukas: ja, aber Zusatzknöpfe (Heute/Morgen/Priorität) besser einbauen.
- [x] 2+3. (v130) To-dos umgebaut: `ui/segment.js` (iOS-Segment) für Bereiche + Textknopf „Bearbeiten“; Eingabe-Leiste mit
      Kalender-Symbol (ohne → Heute → Morgen), „!“ (normal → !! → ↓) und Akzent-„+“ (`leiste.css`, gilt für alle Leisten);
      Gruppen-Titel über der Karte, eingerückte Linien, „!!“ vor dem Titel, Erledigt/Ältere als Zeile. Lokal geprüft Mac + iPhone.
- [x] 3b. (v131) Lukas: kleine iOS-Gruppen sehen blöd aus → Gruppen, Zeilen, Erledigt wieder wie davor (Glas-Karten, Punkt-Priorität).
      Bleibt: Segment für Bereiche, Eingabe-Zeile mit Kapseln „Heute“ · „Morgen“ · „!“ (Priorität) + „+“.
- [x] 3c. (v132) Kapseln klein (28 px) mit Symbolen: Sonne = Heute, Sonnenaufgang = Morgen, Fahne = Priorität (hoch = Akzent, niedrig = Pfeil).
      Gruppen Heute · Morgen · Diese Woche hervorgehoben (eigenes Symbol, Akzent-Kopf, Zahl als Pille).
- [–] 2./3. (ursprünglicher Plan) ersetzt durch 1b–3c: Lukas will kein Komplett-Redesign, nur Apple-Feinschliff.
**Stand 22.11.2026:** Phase 9/10 fertig (v132). Gewohnheiten-Raster, Farbkopf, System A, To-dos-Feinschliff. Offen: auf Geräten prüfen.

## Phase 11 – Neue Vision: Prioritätspyramide (ab 22.11.2026)
Idee Lukas: Das System richtet sich nach **Tages-Prioritäten** aus. Neues Modul „Pyramide“ + Funktions-Redesign je Bereich.
Doku: `docs/module/pyramide.md`.
Plan:
- [x] 1. Geklärt (23.11.): reine Erinnerung, kein Abhaken; unten groß/wichtig, oben klein; 1 Begriff je Ebene;
      viele Pyramiden (1 dauerhafte + kleine abends für morgen); keine Verbindung zu To-dos usw. Details `docs/module/pyramide.md`.
- [x] 2. Muster `muster/pyramide.html`: A · Stufen gewählt.
- [x] 3. Datenmodell (23.11.): `026_pyramiden.sql`, Tabelle in `core/tabellen.js`. Zugriff über `core/store.js` (`pyramiden`).
- [x] 4. (23.11.) `[Sonnet, mittel]` Modul `src/module/pyramide/` + Symbol + Nav-Eintrag; Pyramiden anlegen/bearbeiten/wechseln.
- [x] 5. (23.11.) Heute: Pyramide als Feld `pyramide` (2×3) ganz oben, Hero daneben (2×2). Tippen → Pyramide.
- [ ] 6. `[Opus, mittel]` Funktions-Redesign je Bereich, jeweils erst kurz mit Lukas klären, dann bauen, ein Commit je Bereich.
      Leitfrage: Wie zahlt der Bereich auf die Tages-Prioritäten ein, was ist überflüssig?
      - [x] To-dos (23.11.): Heute max. 3 (Fokus), nur noch Heute · Morgen · Irgendwann · Erledigt; Priorität, Bereiche, „Nicht erledigt“ und Donut weg. `v136`.
      - [x] Kalender (23.11.): **ganz entfernt** (Modul, Nav, Heute-Felder Kalender/Termine, Suche, Termin-Erinnerungen, Google-Abgleich im Client). Tabelle `termine`/`todo_bereiche` bleiben in der DB, werden nicht mehr synchronisiert. Tab-Leiste: Heute · To-dos · Pyramide · Training. `v138`.
      Reihenfolge: ~~To-dos~~ → ~~Kalender~~ → Routinen → Gewohnheiten → Training → Visionen/Affirmationen → Quiz → Bücher → Insta → Physio → Einstellungen.
