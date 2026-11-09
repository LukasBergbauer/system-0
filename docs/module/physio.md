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
**Erste Fassung fertig (05.11.2026).** Teile a bis e und g (Bilder) gebaut und von Lukas auf iPhone und Mac geprüft;
Gleiten fühlt sich nach dem Umbau (`gleiten.js`) „sehr gut“ an. Teil f (Feinschliff) wird nicht mehr als eigener Block
gebaut: die offenen Punkte stehen unter „Wünsche für später“. Verknüpfungen und weitere Funktionen entwickelt Lukas
weiter, wenn er die Datenbank wirklich befüllt und merkt, was fehlt oder hakt – dann als eigene kleine Schritte.
- [x] a) Grundgerüst + Daten:
  - `src/module/physio/arten.js` (Arten + optionale Felder je Art, `art(id)`),
    `daten.js` (`ladeEintraege`, `ladeLinks`, `neuerEintrag(art, titel)`, `aendereEintrag`, `loescheEintrag`
    – löscht seine Verknüpfungen mit, `verknuepfe(a, b)` – keine doppelten, nicht mit sich selbst, `loese(a, b)`,
    `nachbarn(id, eintraege, links)`, `zaehleLinks`, `suche(eintraege, text)` – Titel, Kurz, Text, Felder;
    ohne Groß/Klein und Akzente; Titel-Treffer zuerst), `view.js` (Seite), `index.js` (Anmeldung)
  - Seite: große Kachel „Mindmap“ (noch nicht antippbar, kommt in b), Kacheln mit Anzahl je Art und Verknüpfungen
  - Symbol `physio` (drei verbundene Punkte); Tab-Leiste zeigt „Physio“ (neue Router-Option `kurztitel`)
  - Noch ohne Kopfbild: Zeile `bild:` in `index.js` einschalten, sobald `assets/bilder/physio-1…3.webp` da sind
    (und in `APP_FILES` von `sw.js` eintragen)
  - Tabellen in `src/core/tabellen.js`; `sw.js` auf `v22`. Lokal geprüft (iPhone-Größe, Mac-Breite,
    Daten-Funktionen mit Testdaten im Browser, ohne echte Daten anzulegen)
  - Offen: Lukas führt `003_physio.sql` in Supabase aus (vorher meldet der Abgleich für die zwei Tabellen einen Fehler 404)
- [x] b) Overlay + Suche:
  - `overlay.js`: `oeffneMindmap({ ausKnopf, signal })`, ein `<dialog>` mit Klasse `.hell`. Öffnen: heller Kreis
    wächst aus der Mindmap-Kachel (`clip-path`), Schließen schrumpft zurück. Schließen per ✕, Esc oder Zurück
    (eigener Verlaufseintrag mit `pushState`, Adresse bleibt `#/physio`). Leiste: „‹ Suche“ · MINDMAP · ✕.
    Hört auf das Ereignis `daten` (anderes Gerät). Findet die Kachel über `data-mm-start`, auch wenn die Seite
    dahinter neu gezeichnet wurde
  - `suche.js`: Suchfeld oben (Serifenschrift). Leer: „Zuletzt bearbeitet“ (8) + „+ Neuer Punkt“.
    Mit Text: Treffer (max. 30) mit Art rechts, „+ „…“ anlegen“. Noch gar nichts da: gleich das Anlegen-Formular
  - `anlegen.js`: Art-Chips + Titel, Enter oder „Anlegen“; letzte Art wird im Gerät gemerkt
  - Helle Farben als Token-Satz `.hell` in `tokens.css` (gleiche Namen, helle Werte); Stile `src/styles/physio.css`
  - `sw.js` auf `v23`. Lokal geprüft (iPhone-Größe, Mac-Breite): Öffnen/Schließen per ✕, Esc, Zurück; Anlegen, Suche.
    Testpunkt danach wieder gelöscht
- [x] c) Fokus-Karte:
  - `mindmap-inhalt.js`: drei Ansichten (Suche · Karte · Liste) und Verlauf. Leiste: links „‹ Suche“ (Karte ohne Verlauf)
    bzw. „‹ Zurück“ (voriger Punkt, Liste → Karte, Suche → Karte), rechts Lupe (zur Suche) und ✕.
    Aus der Suche gewählter Punkt landet auch im Verlauf. Gelöschte Punkte fallen aus Mitte und Verlauf raus.
    (Zurück-Wischen: seit Teil d Schritt für Schritt, siehe unten)
  - `fokus.js`: Knöpfe bleiben über Wechsel erhalten (Map id → Knopf), dadurch gleitet der angetippte Nachbar
    in die Mitte und die alte Mitte zu den Nachbarn; Neue schweben aus der Mitte ein, Wegfallende blenden aus.
    Linien als SVG: Mitte → Nachbar, gestrichelt zwischen Nachbarn, die untereinander verknüpft sind;
    bei neuer Mitte erst nach dem Gleiten eingeblendet. Fußzeile: Kurzbeschreibung der Mitte + Anzahl.
    `ResizeObserver` ordnet beim Drehen/Größe ändern neu an. Mitte antippen: noch ohne Funktion (Teil e)
  - `fokus-layout.js`: Ringe als Ellipsen. Schmal (< 500 px): ein Ring, 8 Plätze; breit: zwei Ringe, 16 Plätze.
    Mehr Nachbarn → letzter Platz „+N weitere“ → Liste „Verknüpft mit …“. Größen der Punkte (`groessen`)
  - `knoten.js`: Punkt mit Art-Label, Titel (2 Zeilen, Silbentrennung), Kurzbeschreibung als Hover-Blase (nur Maus).
    Art dezent an der Form: Krankheitsbild getönt, Region dicker Rand, Technik gestrichelt. Lange Titel (> 14 Zeichen)
    in der Mitte kleiner
  - Symbol `suche` (Lupe); Stile `src/styles/physio-karte.css`; `mitte.js` entfernt. `sw.js` auf `v24`
  - Lokal geprüft mit Testdaten nur im Speicher (nichts gespeichert): iPhone-Größe (1 Ring, „+8“, Liste, Verlauf,
    Gleiten, Querlinien), Mac-Breite (2 Ringe, Hover-Vorschau), echtes Overlay ohne Fehler
- [x] d) Hinzufügen + Verknüpfen in der Mindmap, dazu Zurück-Wischen Schritt für Schritt (Lukas' Wunsch):
  - `mm-verlauf.js`: jeder Schritt (Punkt, Suche, Liste, Verknüpfen) ist ein eigener Eintrag im Browser-Verlauf
    (`pushState`, Adresse bleibt `#/physio`). Zurück-Wischen, Zurück-Taste und „‹ Zurück“ gehen einen Schritt zurück;
    vor dem ersten Schritt schließt Zurück das Overlay. ✕/Esc verlassen alle eigenen Einträge auf einmal (`history.go`).
    Eigene Kennung je Overlay, alte Einträge nach Neuladen zählen nicht. `mindmap-inhalt.js` nutzt das statt eigener Liste
  - Unter der Mitte Knopf „+ Verknüpfen“ → `verknuepfen.js`: Art-Chips, Feld „Titel oder suchen …“, passende vorhandene
    Punkte (antippen = verknüpfen, „schon verknüpft“ markiert), Enter/„„…“ anlegen“ = neuer Punkt + Verknüpfung.
    Gibt es den Titel schon (ohne Groß/Klein, Akzente), wird der vorhandene verknüpft statt doppelt angelegt.
    Danach zurück zur Karte, der Punkt schwebt ein. „Neu“ und „Verknüpfen“ bewusst ein einziger Schritt
  - Lösen: Nachbar lange drücken (550 ms, iPhone) oder Rechtsklick (Mac) → Rückfrage → `loese`. Der Klick nach
    langem Drücken zählt nicht als Antippen; kein Kopiermenü auf dem iPhone (`-webkit-touch-callout: none`)
  - `daten.js` exportiert `norm`, `anlegen.js` exportiert `letzteArt`/`merkeArt`. Fußzeilen-Stile nach `physio.css`
    (Dateien unter 200 Zeilen). `sw.js` auf `v25`
  - Lokal geprüft (iPhone-Größe) mit zwei Testpunkten, danach gelöscht: Anlegen + Verknüpfen, kein Doppel bei gleichem
    Titel, Zurück Schritt für Schritt bis Schließen, ✕ räumt Verlauf auf, Lösen per Rechtsklick und langem Drücken,
    kurzes Tippen wechselt normal
- [x] e) Punkt öffnen:
  - Mitte antippen → Ansicht `eintrag` (eigener Schritt im Verlauf, Zurück → Karte). `eintrag.js`: Art-Chips, Titel groß
    (Serifenschrift), Kurzbeschreibung kursiv, Strich, Felder der Art (`arten.js`), Notizen, Video-Link mit
    „Video öffnen ↗“ (nur bei gültigem http(s)-Link, öffnet neuen Tab bzw. Safari), „Punkt löschen“ (Rückfrage,
    Verknüpfungen mit) → zurück
  - Kein Bearbeiten-Modus: jedes Feld direkt bearbeitbar (`textfeld.js`: Textarea, wächst mit, Linie nur bei Hover/Fokus).
    Speichert 500 ms nach dem letzten Tastendruck (gesammelt in einem `save`) und sofort beim Verlassen eines Felds.
    Leerer Titel wird nicht gespeichert, beim Verlassen kommt der alte zurück. Art wechseln behält Werte der alten
    Art in `felder` (tauchen wieder auf, wenn man zurückwechselt). Ansicht wird nicht neu gebaut, solange sie offen ist
  - Stile `src/styles/physio-eintrag.css`; `sw.js` auf `v26`
  - Lokal geprüft (iPhone-Größe, Mac-Breite) mit Testpunkt, der über „Punkt löschen“ wieder entfernt wurde:
    Speichern von Kurz/Feld/Video, Link erscheint, Art-Wechsel (Felder wechseln, alte Werte bleiben), Zurück zur Karte
    (Fußzeile zeigt neue Kurzbeschreibung), Löschen mit Rückfrage
- [x] Nach Lukas' Test auf dem iPhone: Wechsel der Mitte wirkte „gesprungen, dann festgesetzt“ (Schrift sprang sofort
  auf groß/Serif, Kurve mit schnellem Start, alte Linien schlagartig weg). Jetzt: Text des Punkts, der die Rolle wechselt,
  blendet beim Losgleiten aus (120 ms) und nach dem Gleiten wieder ein (Klasse `mm-knoten--wechsel`, `GLEITEN_MS` in
  `fokus.js` = `--mm-gleiten` 650 ms); Kurve `--mm-kurve` (sanft an, sanft aus); Innenabstand gleitet mit; alte Linien
  blenden aus (`mm-karte__linien--alt`), neue ab 60 % ein. `sw.js` auf `v27`. Geprüft über die geplanten Übergänge im
  Browser (Fenster war ausgeblendet, daher kein Video)
- [x] Lukas (05.11.2026): Animation wirkt weiterhin „off“. Ursache vermutlich: Breite/Höhe/Innenabstand wurden animiert →
  das iPhone muss jedes Bild neu berechnen (Ruckeln), und der Text blendete erst nach dem Ankommen ein („Einrasten“).
  Jetzt `gleiten.js` (FLIP): vorher messen, neuen Zustand ohne Übergang setzen, per `translate` + `scale` optisch an den
  alten Platz zurück, dann nur `transform`/`opacity` animieren (`will-change: transform`). Neue Punkte kommen klein
  aus der Mitte, Wegfallende blenden aus (vom Zwischenschritt `mm-karte__knoten--still` ausgenommen).
  Text blendet bei 55 % der Bewegung wieder ein (`TEXT_EIN_MS`). Unterbrechen mitten in einer Bewegung geht weich weiter
  (Messung nimmt den aktuellen Zwischenstand). `sw.js` auf `v30`. Geprüft über die geplanten Übergänge (Fenster ausgeblendet);
  **Lukas prüft auf dem iPhone**
- Speicher (Frage von Lukas): Bilder liegen im Datei-Speicher (1 GB), nicht in der 500-MB-Datenbank (dort nur ~200 Byte je Bild).
  Lukas' Wahl: große Bilder 1200 px statt 1600 (`GROSS` in `bild-verkleinern.js`, `sw.js` `v31`).
  Test mit stark gemustertem Foto 3000 × 2000: groß 1200 × 800 = 150 KB, klein 26 KB → ~176 KB je Bild, ~5.500+ Bilder je GB

## Wünsche für später
Lukas sammelt hier, was beim Befüllen auffällt; umgesetzt wird es als eigener kleiner Schritt.
- Kopfbild: drei Fotos `assets/bilder/physio-1…3.webp` (Lukas erzeugt sie mit dem Prompt aus `design.md`, Vorschlag:
  „a smooth stone sphere connected to smaller pebbles by thin threads of light“), dann Zeile `bild:` in `index.js`
  einschalten und Fotos in `APP_FILES` von `sw.js` eintragen
- Kleine Hinweise: „Lange drücken zum Lösen“, „Mitte antippen zum Öffnen“ (z. B. einmalig oder dezent in der Fußzeile)
- Eintrag: Abstand Titel ↔ Kurzbeschreibung etwas enger
- Mac: Art-Chip-Reihe im Eintrag auf breiten Bildschirmen umbrechen lassen („Technik“ wird abgeschnitten)
- Zurück-Wischen und Kamera/Mediathek auf dem echten iPhone weiter beobachten
- Verknüpfungen und Funktionen: ergeben sich beim Befüllen (Lukas, 05.11.2026)
- Später (aus dem ursprünglichen Plan): Übungen ins Trainings-Notebook übernehmen, Lernpfade, Notion, Bild-Export

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
  und Mac prüfen; neue Dateien in `APP_FILES` von `sw.js`, `VERSION` hochzählen.
  Dazu (offen aus d/e, mit Lukas klären): kleine Hinweise, z. B. „Lange drücken zum Lösen“ und dass man die Mitte
  zum Öffnen antippen kann; Abstand Titel ↔ Kurzbeschreibung im Eintrag etwas enger; Zurück-Wischen auf dem echten iPhone testen;
  am Mac bricht die Art-Chip-Reihe im Eintrag nicht um („Technik“ abgeschnitten) – auf breiten Bildschirmen umbrechen lassen;
  Gleiten noch nicht flüssig (siehe „Offen“ oben)
- g) **Bilder** (Gespräch 05.11.2026, Plan unten). Kommt vor f, weil sich das Aussehen der Karte dadurch ändert
- Später: Übungen ins Trainings-Notebook übernehmen, Notion

## Plan Teil g: Bilder (von Lukas abgesegnet 05.11.2026)
Entscheidungen (Gespräch 05.11.2026):
- **Ganzer Ball = Bild:** Punkte mit Bild werden in der Karte runde Fotos, Titel klein darunter. Die Mitte mit Bild:
  Foto füllt den großen Kreis, Titel darunter. Punkte ohne Bild bleiben Kapseln wie bisher.
- **Karte schwarz-weiß, Eintrag farbig** (passt zu „Stein & Licht“, Karte bleibt ruhig).
- **Mehrere Bilder pro Punkt:** kleine Galerie im Eintrag; das erste ist das Titelbild (das Bild im Ball).
- Nur eigene Übungsfotos/Skizzen, keine Fotos von Patient:innen.

Technik:
- Migration `004_physio_bilder.sql`: Tabelle `physio_bilder` (`eintrag_id`, `reihenfolge`, `breite`, `hoehe`; wird wie alle
  Tabellen abgeglichen) und privater Speicher-Ordner `physio-bilder` in Supabase Storage (max. 5 MB je Datei,
  Zugriff nur auf den eigenen Unterordner `<user_id>/…`). Gratis-Tarif: 1 GB, reicht für einige tausend Bilder
- Jedes Bild wird im Browser verkleinert und zweimal gespeichert: groß (lange Seite 1600 px, JPEG, ca. 200–300 KB)
  für den Eintrag – seit 05.11.2026 1200 px, ca. 130–150 KB –, klein (quadratisch 320 px, ca. 20–30 KB) für den Ball. iPhone-Fotos (HEIC) wandelt iOS beim Auswählen
  selbst in JPEG um
- Local-first wie bei den Daten: Dateien zuerst im Gerät (IndexedDB, neuer Speicher `dateien`, dafür `DB_VERSION` 2
  in `src/core/db.js`), dann Hochladen über eine eigene Warteschlange, sobald Netz da ist. Fehlt ein Bild auf dem
  anderen Gerät noch, wird es beim ersten Anzeigen geladen und dort ebenfalls gespeichert (danach offline da).
  Neues Kern-Modul `src/core/dateien.js` (speichern, holen, löschen, hochladen), nutzbar später auch für Bücher-Cover
- Löschen: Zeile weich gelöscht (kommt auf alle Geräte), Dateien werden im Speicher-Ordner entfernt
- Export (JSON) enthält die Bilder nicht, nur ihre Liste; ein Bild-Export wäre ein eigener späterer Schritt

Teile (nach jedem Teil kurz prüfen):
- g1) **Fundament:** Lukas führt `004_physio_bilder.sql` aus; `db.js` Version 2 mit Speicher `dateien`;
  `src/core/dateien.js` (lokal speichern, Warteschlange, Hochladen/Herunterladen über Supabase Storage, Löschen);
  `src/module/physio/bild-verkleinern.js` (groß + klein); `bilder.js` im Modul (Bilder eines Punkts, hinzufügen,
  Titelbild setzen, löschen); Tabelle in `tabellen.js`
- g2) **Galerie im Eintrag:** oben im Eintrag waagrechte Bildleiste in Farbe, „+ Bild“ (iPhone: Kamera oder Mediathek,
  mehrere auf einmal). Antippen → Großansicht mit „Als Titelbild“ und „Löschen“ (Rückfrage). Zurück-Wischen schließt die Großansicht
- g3) **Bilder in der Karte:** Bälle mit Titelbild als runde Fotos in Schwarz-Weiß, Titel darunter; Mitte mit Bild
  füllt den Kreis. Auf dem iPhone 6 statt 8 Plätze im Ring, sobald Bilder dabei sind (sonst überlappen sie).
  Kleine Bilder werden beim Öffnen der Mindmap vorgeladen, damit nichts nachblitzt; Gleiten wie bisher
- Am Ende neue Dateien in `APP_FILES` von `sw.js`, `VERSION` hochzählen

Stand Teil g:
- [x] g1) Fundament:
  - Migration `004_physio_bilder.sql` von Lukas ausgeführt
  - `src/core/db.js` Version 2: Speicher `dateien` ({ pfad, blob }) und `datei_warteschlange` ({ pfad, aktion: hoch|weg });
    Umstellung legt nur Neues an (alte Daten bleiben). Offene ältere Fenster: `onversionchange` lässt los;
    blockiert ein altes Fenster ohne diese Regel, zeigt `onblocked` einen Hinweis (`.db-hinweis` in `app.css`).
    Passiert bei Lukas am Mac: Seite blieb leer, bis das alte Fenster geschlossen war
  - `src/core/dateien.js`: `speichereDatei`, `holeDatei` (lokal, sonst einmal aus Storage laden und behalten),
    `dateiUrl`, `loescheDatei`, `dateienWartend`, `dateienAbgleichen`. Läuft im normalen Abgleich (`sync.js`) nach
    den Zeilen mit, wartende Dateien zählen bei „wartende Änderungen“ mit; Ereignis `dateien` stößt Abgleich an
  - `sync.js`: fehlt eine Tabelle in Supabase (Migration noch nicht ausgeführt, Fehler `PGRST205`), wird nur diese
    ausgelassen statt den ganzen Abgleich abzubrechen
  - `bild-verkleinern.js` (über `<img>` + `onload`, nicht `decode()`: das hing im unsichtbaren Fenster):
    groß lange Seite 1600 px JPEG 0,82, klein 320 × 320 mittig JPEG 0,8. Test: 812 KB → 212 KB + 26 KB, 0,3 s
  - `bilder.js`: `ladeBilder`, `bilderVon`, `titelbilder`, `bildUrl(bild, 'gross'|'klein')`, `fuegeBilderHinzu`,
    `setzeTitelbild`, `loescheBild`, `loescheBilderVon`; Pfad `physio-bilder/<user_id>/<id>[-klein].jpg`.
    `loescheEintrag` löscht die Bilder mit. Tabelle in `tabellen.js`; `sw.js` auf `v29`
  - Geprüft mit Testpunkt (danach gelöscht): Hochladen (4 Dateien), Zurückholen aus Storage, Titelbild umstellen,
    Löschen räumt Zeilen und Dateien im Speicher-Ordner auf
- [x] g2) Galerie im Eintrag:
  - `galerie.js`: Bildleiste oben im Eintrag (nach den Art-Chips), in Farbe, waagrecht wischbar (bewusst ohne
    `scroll-snap`: das ließ die Leiste um den Innenabstand verrutschen). Erstes Bild mit Label „Titelbild“.
    „+ Bild“ öffnet `<input type=file accept=image/* multiple>` (iPhone: Kamera oder Mediathek). Während des Verkleinerns
    pulsierende Platzhalter „Wird hinzugefügt …“. Platz je Bild über `breite/hoehe` reserviert, Bild blendet ein.
    Fehlt ein Bild (offline, noch nicht geladen): Hinweis in der Kachel, nächster Versuch beim nächsten Auffrischen.
    Kacheln bleiben über Auffrischungen erhalten (kein Flackern)
  - `bild-gross.js`: Ansicht `bild` (eigener Schritt im Verlauf, `schritt.bildId`; Zurück-Wischen schließt): Bild groß in Farbe,
    „Bild 2 von 3“ bzw. „Titelbild · Bild 1 von 3“, „Als Titelbild“ (nicht beim ersten), „Löschen“ (Rückfrage) → zurück
  - Overlay lädt jetzt auch `physio_bilder` (und hört auf Änderungen); `mindmap-inhalt.js` reicht die Bilder der Mitte
    an Eintrag (`zeigeBilder` frischt nur die Leiste auf) und Großansicht weiter
  - Stile `src/styles/physio-bilder.css`; `sw.js` auf `v32`
  - Lokal geprüft (iPhone-Größe) mit Testpunkt, danach samt Bildern gelöscht (Speicher-Ordner wieder leer):
    Hinzufügen von 2 Bildern auf einmal, Titelbild-Markierung, Großansicht, „Als Titelbild“, Zurück, Löschen,
    Verlauf nach ✕ sauber
  - Merke: Wird die Seite neu geladen, während die Mindmap offen ist, bleiben deren Verlaufseinträge stehen
    (harmlos, Zurück tut dann einmal nichts)
- [x] g3) Bilder in der Karte + Mac-Extras (Lukas' Wunsch):
  - `knoten.js`: Punkt mit Titelbild = Ball (`mm-knoten--ball`): Foto rund in Schwarz-Weiß (`grayscale`), Titel klein
    darunter (mit schmalem Hintergrund, damit Linien nicht durchlaufen), Art-Label entfällt, Hover-Kurzbeschreibung
    über dem Ball. Mitte mit Bild: Foto füllt den großen Kreis, Serifentitel darunter. Foto blendet ein, sobald geladen;
    fehlt es (offline), bleibt ein grauer Ball. Lädt nur neu, wenn sich das Titelbild ändert
  - `fokus-layout.js`: `groessen().ball` (72 / 84 px); `positionen(…, mitBildern)` → iPhone 6 statt 8 Plätze, mehr Höhe
    für Ball + Titel. Mac bleibt bei bis zu 16. Gleiten (FLIP) funktioniert auch Ball ↔ Mitte (Foto bleibt sichtbar)
  - `overlay.js` lädt beim Öffnen die kleinen Ball-Bilder vor; `fokus.zeige(…, bilder)`
  - Mac: Fotos auf den geöffneten Eintrag ziehen (Bildleiste wird gestrichelt markiert) oder mit ⌘ + V einfügen
    (`bilderVonAussen` in `eintrag.js`, `galerie.hinzufuegen`). Text-Einfügen in Felder bleibt normal
  - Stile `src/styles/physio-baelle.css` (+ Ziehen-Hinweis in `physio-bilder.css`); `sw.js` auf `v33`
  - Lokal geprüft: iPhone-Größe (Bälle, 6 Plätze, „+2“, Ball gleitet in die Mitte), Mac-Breite (gemischter Ring),
    Ziehen und ⌘ + V mit Testpunkt (danach gelöscht, Speicher-Ordner leer); erfundene Ball-Bilder nur lokal, wieder entfernt

## Plan Kosmos (09.11.2026, Lukas: heller Glas-Kosmos)
Vision: Physio in der Mitte, drumherum je Pfad eine Bubble, schwebend wie im Weltall, futuristisch statt Kachel-Raster.
- **Bühne** (`kosmos.js`, `physio-kosmos.css`): ersetzt die Kacheln. Tiefer Raum mit feinem Sternenstaub und Akzent-Nebel,
  Mitte Kern „Physio“ (Glas-Kugel, leuchtet im Akzent, öffnet die Suche/Mindmap)
- **Bubbles** (`bubble.js`): Seifenblasen-Glas mit irisierendem Rand im Akzent, Anzahl + Name. Innen: Krankheitsbilder,
  Trainingsformen, Muskeln, Übungen; außen kleiner: Regionen, Techniken. Schweben langsam, jede eigener Takt, leichte Tiefe (Parallaxe zur Maus)
- **Hover = eindringen:** Bubble kommt nach vorn und wächst, Membran dehnt sich und „reißt“ weich auf, Innenraum
  (Anzahl, letzte 3 Einträge) blendet ein, die anderen weichen zurück und werden unscharf. Rausgehen: genau umgekehrt.
  iPhone: Tippen = eindringen, nochmal Tippen = öffnen, daneben tippen = raus
- **Klick = ganz hinein:** Bubble füllt den Bildschirm → Innenansicht der Art: Suchfeld, Liste, „+ Neu“;
  Eintrag antippen → bestehende Mindmap mit diesem Punkt in der Mitte. Zurück = Bubble schrumpft, man ist wieder draußen
- **Neue Art „Trainingsform“** (Felder: Ziel, Belastung/Dosierung, Prinzipien): Migration `018_physio_trainingsform.sql` (Check erweitern)
- Nur `transform`/`opacity`, „Bewegung reduzieren“ = kein Schweben. Danach: Mindmap-Overlay optisch angleichen, Lernpfade

Stand (09.11.2026, `sw.js` `v72`): gebaut. `kosmos.js` (Bühne, Bubbles, Eindringen, Parallaxe), `tiefe.js` (Innenansicht mit
eigenem Verlaufsschritt; Eintrag → Mindmap, Zurück-Kette Mindmap → Bubble → Kosmos geht), `view.js` ohne Kacheln,
Stile `physio-kosmos.css`, `physio-tiefe.css`. Art `trainingsform` in `arten.js`. Lokal geprüft (Mac-Breite, iPhone-Größe).
018 ausgeführt, von Lukas auf Geräten geprüft.

Stand Glas-Mindmap (09.11.2026, `sw.js` `v73`): Overlay ohne `.hell`, Hintergrund = App-Farbwolken.
- Schweben (`schweben.js`, Keyframes in `physio-kosmos.css`): x, y, Drehen, Wabbeln je eigener krummer Takt; Kosmos schief angeordnet, Größen gemischt (`g`)
- `knoten.js`: Knopf (gleitet) > `.mm-knoten__blase` (Glas, schwebt); Größe je Punkt `--v` aus der id. `fokus-layout.js`: runde Bubbles, Plätze leicht verschoben
- `fokus.js`: Bubble antippen → schwebt in die Mitte, alle anderen blenden aus, neue Nachbarn danach (`gleite(…, spaeter)`); Mitte antippen tut nichts,
  Knopf „Text“ öffnet den Eintrag. Linien = gebogene Akzent-Fäden von Rand zu Rand (Verlauf `mm-faden`)
- Eintrag: jedes Feld eine Glas-Karte (`physio-eintrag.css`). Lokal geprüft (Mac-Breite, iPhone-Größe). Offen: Lukas prüft auf Geräten.
Nächster Schritt: Lernpfade.

## Offen / bitte prüfen (aus der Planung, erledigt bzw. unter „Wünsche für später“)
- Das Overlay ist hell (Elfenbein-Weiß mit dunkler Schrift), während die App sonst dunkel ist. So gewünscht;
  falls es zu grell wirkt, später einen Ton dunkler.
- Foto-Objekt für den Kopf (Prompt in `design.md`), Vorschlag: „a smooth stone sphere connected to smaller pebbles
  by thin threads of light“ oder einfacher „a stone anatomical vertebra“.

