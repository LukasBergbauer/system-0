# Roadmap

Reihenfolge bewusst klein gehalten: erst ein Kern, den Lukas täglich nutzt, dann wachsen.

**Regel (ab 09.11.2026):** Stand und Pläne knapp hier bzw. in der Modul-Doku vermerken **und** immer auch in den Chat. So wenig Zeilen wie möglich, so viel wie nötig.

## Phase 0 – Fundament
- [x] Repo, Supabase-Projekt, GitHub Pages eingerichtet (`docs/start.md`)
  - [x] Repo mit Platzhalter-`index.html`, `src/core/config.js`, `supabase/migrations/`
  - [x] Supabase-Projekt angelegt, URL + Publishable key in `config.js`
  - [x] Lukas' Konto in Supabase angelegt, öffentliche Registrierung abgeschaltet
  - [x] GitHub Pages aktiv: https://lukasbergbauer.github.io/system-0/
- [x] App-Hülle, Manifest, Icons, installierbar auf Mac und iPhone
  Plan (mit Lukas abgestimmt):
  - `index.html` ersetzt den Platzhalter: PWA-Meta-Tags (Vollbild, dunkle Statusleiste,
    `viewport-fit=cover`), lädt nur `src/main.js`
  - `manifest.webmanifest`: Name „System 0“, `start_url`/`scope` = `./` (Seite liegt unter `/system-0/`),
    `display: standalone`, Farben aus `design.md`
  - `sw.js`: cacht nur die App-Dateien, mit Versionsnummer; Supabase-Anfragen nie cachen
  - `src/main.js`: Service Worker anmelden, „System 0“ anzeigen (Auth/Router kommen später)
  - `src/styles/tokens.css` mit den Werten aus `design.md`, `src/styles/base.css` (Hintergrund, Schrift, Safe-Area)
  - Icon: dünne „0“ als Ring in `--accent` (#3DFFB0) auf `--bg`; SVG-Vorlage + PNGs 180/192/512
    in `assets/icons/`, erzeugt mit Mac-Bordmitteln
  - Keine UI-Bausteine (das ist der nächste Punkt)

  Stand:
  - [x] Alle Dateien oben gebaut und lokal geprüft (Seite, Manifest, Icons laden; Farben stimmen)
  - [x] `.gitignore`: Regel `Icon?` hätte auf dem Mac den Ordner `assets/icons` ausgeschlossen,
        jetzt genau auf die Mac-Datei `Icon\r` beschränkt
  - [x] Service Worker auf echtem Gerät geprüft: offline startet die App
  - [x] Von Lukas auf Mac (Dock) und iPhone (Home-Bildschirm) installiert und offline geöffnet
  - Merke: Bei jeder Änderung an App-Dateien `VERSION` in `sw.js` hochzählen und neue Dateien in `APP_FILES` eintragen
- [x] Design-Tokens und UI-Bausteine
  Plan (mit Lukas abgestimmt):
  - `src/styles/tokens.css` ergänzen: Abstands-Reihe (4–48 px), wenige Schriftgrößen
    (klein, normal, Überschrift, groß), Animationsdauer (200 ms), Mindest-Tippfläche (44 px);
    neue Werte auch in die Tabelle in `docs/design.md`
  - Bausteine in `src/ui/`, je eine kleine JS-Datei, die ein fertiges Element liefert;
    Stile in `src/styles/components.css`:
    Karte, Liste (Zeilen mit Trennlinien), Checkbox (runder Neon-Haken mit kurzer Animation),
    Knopf (normal + ohne Hintergrund), Eingabefeld, Modal (iPhone: von unten, Mac: mittig), Tabs
  - Musterseite `bausteine.html` zeigt alle Bausteine nebeneinander, damit Lukas den Stil
    auf iPhone und Mac prüfen kann
  - Keine Navigation, kein Login, keine echten Daten (spätere Schritte)
  - Am Ende neue Dateien in `APP_FILES` von `sw.js` eintragen und `VERSION` hochzählen

  Stand:
  - [x] Tokens ergänzt (`--space-1…7`, `--fs-small/normal/title/large`, `--duration`, `--ease`, `--tap`), Tabelle in `design.md`
  - [x] Bausteine in `src/ui/`: `dom.js` (Hilfe `el()`), `card`, `list` (+ `listItem` für Checkbox-Zeilen),
        `checkbox`, `button`, `input`, `modal` (nutzt `<dialog>`), `tabs`; Übersicht in `design.md`
  - [x] Stile auf drei Dateien verteilt (`components.css`, `checkbox.css`, `modal.css`), jeweils unter 200 Zeilen
  - [x] Musterseite `bausteine.html` (+ `src/bausteine.js`), lokal geprüft in Mac- und iPhone-Größe
        (Haken-Animation, Tabs, Modal mittig bzw. von unten, Schließen per Knopf/Esc/Tippen daneben)
  - [x] `sw.js` auf `v2`, neue Dateien in `APP_FILES`
  - [x] Von Lukas auf echtem iPhone und Mac geprüft: alles funktioniert
  - Lokal testen: im Terminal `python3 -m http.server 8000` im Repo-Ordner, dann http://localhost:8000/bausteine.html
- [x] Login, lokale Datenbank, Sync, Export
  Plan (mit Lukas abgestimmt, alles in einer Sitzung, Reihenfolge a → d, nach jedem Teil kurz prüfen):
  - a) Login: Supabase-Bibliothek per CDN mit fester Version; `src/core/supabase.js` (Verbindung),
    `src/core/auth.js` (anmelden, abmelden, Sitzung merken). Login mit E-Mail + Passwort
    (kein Magic Link: der würde Safari statt der Homescreen-App öffnen), gebaut aus den Bausteinen.
    Nicht angemeldet → Login-Ansicht; angemeldet → „System 0“ + Abmelden-Knopf
  - b) Lokale Datenbank: `src/core/store.js` mit IndexedDB (lesen, schreiben, weich löschen);
    `id`, `updated_at`, `deleted` werden automatisch gesetzt (siehe `datenmodell.md`)
  - c) Sync: erste Tabelle `einstellungen` (Schlüssel/Wert) als Migration `001_basis.sql` mit RLS;
    `src/core/sync.js`: Warteschlange lädt hoch, sobald Netz da ist; beim Start neue Daten holen;
    neuester `updated_at` gewinnt. Prüfen: auf dem Mac ändern → erscheint auf dem iPhone, auch nach Offline-Phase
  - d) Export: Knopf lädt alle Daten als JSON-Datei herunter
  - Keine Navigation, keine Module; Aussehen nur mit den vorhandenen Bausteinen (Feinschliff später, siehe Design-Runde)
  - Am Ende neue Dateien in `APP_FILES` von `sw.js` eintragen und `VERSION` hochzählen

  Stand:
  - [x] a) Login: Supabase 2.117.3 als eine UMD-Datei von jsDelivr, erst bei Bedarf geladen
        (`src/core/supabase.js`), im Service Worker offline gecacht. `src/core/auth.js`: „angemeldet“ =
        gespeicherte Sitzung im Gerät (Schlüssel `system0-auth`), dadurch auch offline angemeldet.
        Ansichten in `src/app/` (`login.js`, `start.js`), Grundlayout in `src/styles/app.css`
  - [x] b) `src/core/db.js` (IndexedDB: `daten`, `warteschlange`, `meta`), `src/core/store.js`
        (`getAll`, `get`, `save`, `remove`, `dumpAll`), `src/core/events.js` (Ereignis `daten`)
  - [x] c) Migration `001_basis.sql` (Trigger `sync_felder`, Tabelle `einstellungen`, RLS) in Supabase ausgeführt;
        `src/core/sync.js` + `sync-local.js`, Tabellenliste `src/core/tabellen.js`, `src/core/einstellungen.js`;
        Startansicht mit „Sync-Test“ (Testnotiz) und Abgleich-Status. Von Lukas geprüft: Mac → iPhone, auch nach Flugmodus
  - [x] d) `src/core/export.js` + Karte „Export“: JSON-Datei (Mac: Download, iPhone: Teilen-Menü → „In Dateien sichern“)
  - [x] Service Worker `v6`: holt neue Fassungen immer frisch (`cache: 'reload'`), App lädt bei Update einmal selbst neu,
        auf `localhost` immer zuerst das Netz
  - Merke: Die Karten „Sync-Test“ und „Export“ sind vorläufig in der Startansicht; Testnotiz fliegt raus,
    Export wandert in die Einstellungen, sobald es Navigation gibt
  - Merke: iPhone testet nur die gepushte Fassung (GitHub Pages); `localhost` gibt es nur auf dem Mac
- [x] Navigation (Tab-Leiste iPhone, Seitenleiste Mac)
  Plan (mit Lukas abgestimmt):
  - `src/core/router.js`: Hash-Adressen (`#/heute`, `#/einstellungen` …), funktioniert auf GitHub Pages
    ohne Extra-Einrichtung, Zurück-Knopf/-Wischen klappt. Module melden sich an mit
    `{ id, titel, symbol, ansicht }`; unbekannte Adresse → `#/heute`
  - `src/app/shell.js` + `src/styles/nav.css`: Rahmen der App.
    iPhone: Tab-Leiste unten (Abstand zur Home-Leiste), feste Reihenfolge Heute, To-dos, Kalender, Training, „Mehr“;
    „Mehr“ öffnet eine Liste aller übrigen Bereiche. Mac (ab 768 px): Seitenleiste links mit allen Bereichen.
    Aktiver Eintrag mit Neon-Akzent (wie Tabs)
  - Symbole: dünne Linien-SVGs, selbst gezeichnet, keine Bibliothek
  - Ansichten zum Start: „Heute“ als Platzhalter („kommt bald“), „Einstellungen“ mit Abgleich-Status,
    Export und Abmelden (aus der bisherigen Startansicht). Testnotiz/Sync-Test entfernen (Sync ist bewiesen).
    Weitere Bereiche erscheinen erst, wenn ihr Modul gebaut ist (keine leeren Seiten); ist ein Tab-Platz noch frei,
    rücken vorhandene Einträge nach
  - Aussehen nur mit vorhandenen Bausteinen und Tokens (Feinschliff in der Design-Runde)
  - Am Ende neue Dateien in `APP_FILES` von `sw.js` eintragen und `VERSION` hochzählen

  Stand:
  - [x] `src/core/router.js`: `register({ id, titel, symbol, ansicht })`, optional `nav: false`, `ende: true`;
        `ansicht({ signal })` – `signal` endet beim Verlassen (`on(name, fn, { signal })` in `events.js`).
        Ereignisse `route` und `bereiche`. Unbekannte Adresse → `#/heute` (ohne Verlaufs-Eintrag)
  - [x] `src/app/shell.js` (Rahmen), `nav.js` (Seitenleiste + Tab-Leiste), `nav-plan.js` (Reihenfolge, Tab-Plätze),
        `mehr.js` (`#/mehr`), `bereiche.js` (meldet alle Bereiche an), Stile `src/styles/nav.css`, Token `--sidebar`
  - [x] Symbole `src/ui/symbol.js` (Heute, Einstellungen, Mehr; neues Modul → Symbol dort ergänzen)
  - [x] „Heute“-Platzhalter in `src/module/heute/`, „Einstellungen“ (`src/app/einstellungen.js`) mit Abgleich, Export, Abmelden;
        Testnotiz und `start.js` entfernt
  - [x] „Mehr“ erscheint erst ab 6 Bereichen; jetzt (2 Bereiche) zeigt die Tab-Leiste Heute + Einstellungen
  - [x] Lokal geprüft: Mac-Seitenleiste, iPhone-Tab-Leiste, Zurück, unbekannte Adresse,
        „Mehr“ mit vorübergehenden Test-Bereichen (nur im Browser, nicht im Code)
  - [x] `sw.js` auf `v7`, neue Dateien in `APP_FILES`
  - [x] Von Lukas auf echtem iPhone (gepushte Fassung) und Mac geprüft

## Phase 1 – Alltag
- [x] To-dos (`module/todos.md`)
  Plan (mit Lukas abgestimmt, eine Sitzung, Teile a → b, nach jedem Teil kurz prüfen; Details in `module/todos.md`):
  - a) Grundfunktionen: Migration `002_todos.sql` (Tabellen `todo_bereiche`, `todos`), Modul `src/module/todos/`,
    Schnelleingabe-Feld oben, Liste nach Priorität und Datum, Abhaken, Bearbeiten/Löschen im Modal,
    Abschnitt „Erledigt“ (eingeklappt)
  - b) Bereiche: anlegen/umbenennen/löschen, Umschalter „Nach Priorität“ / „Nach Bereichen“
  - Aussehen nur mit vorhandenen Bausteinen und Tokens (Feinschliff in der Design-Runde)
  - Am Ende neue Dateien in `APP_FILES` von `sw.js` eintragen und `VERSION` hochzählen

  Stand:
  - [x] a) und b) gebaut und lokal geprüft (Details und Dateien in `module/todos.md`)
  - [x] `index.html` lädt jetzt auch `checkbox.css`, `modal.css` (bisher nur auf der Musterseite) und `todos.css`
  - [x] `sw.js` auf `v8`, neue Dateien in `APP_FILES`; auf `localhost` fragt der Service Worker jetzt
        immer beim Server nach (`cache: 'no-cache'`), sonst lieferte der Browser alte Dateien aus seinem Zwischenspeicher
  - [x] Migration `002_todos.sql` von Lukas in Supabase ausgeführt
  - [x] Von Lukas auf echtem iPhone (gepushte Fassung) und Mac geprüft, inkl. Abgleich
  - Merke: Die Funktionen der To-dos sind nicht endgültig. Änderungswünsche sammelt Lukas in
    `module/todos.md` unter „Wünsche für später“; umgesetzt werden sie als eigener kleiner Schritt
- [x] Design-Runde (abgeschlossen 04.11.2026, Stil „Stein & Licht“, siehe `design.md`): Lukas ist mit Design und Anordnung noch nicht zufrieden. Erst überarbeiten,
  wenn mit Navigation und To-dos echte Ansichten da sind. Dann gemeinsam festlegen, was sich ändern soll
  (Farben, Abstände, Schrift, Anordnung der Ansichten) und `design.md`, `tokens.css` und die Bausteine anpassen.
  Lukas' Punkte (Gespräch vom 04.11.2026):
  - Wirkt zu dunkel und zu leer, persönlicher Charakter fehlt. Mehr Premium-Gefühl
    (Vorbilder: Apple Fitness, Revolut). Weiße Akzente. Luftigkeit ist gut so.
  - Gewählt: Glas-Look (leicht durchscheinende Karten mit Unschärfe dahinter)
  - Bei jedem Tippen soll man auch ohne Überschrift sehen, wo man ist: jeder Bereich bekommt
    ein eigenes Kopfbild und eine eigene dezente Bereichsfarbe
  - Bilder: Claude zeichnet sie selbst als SVG. Stil: ästhetisch, japanische Blumen in passenden Farben,
    Training als Motiv; dazu japanische Sprüche
  - Navigation (Tab-Leiste, Seitenleiste) passt, Modal passt
  - To-dos: zu viele Kästen, alles nur untereinander, „Bereiche verwalten“ versteckt.
    Gewählt: Gruppen nach Zeit (Überfällig · Heute · Diese Woche · Später), Priorität als farbiger Punkt,
    kein Umschalter mehr
  - Einstellungen wirken plump. Gewählt: Kacheln (große Status-Kachel für den Abgleich, kleinere für den Rest)
  - „Alles sieht gleich aus“: mehr verschiedene Bausteine (Kopfbild, Kachel, Chips) statt überall dieselbe Karte
  - PhysioZentrum ist wichtig und kommt direkt nach der Design-Runde (Roadmap entsprechend umgestellt)

  Plan (mit Lukas abgestimmt; eine Sitzung, Teile a → f, nach jedem Teil kurz prüfen):
  - a) Grundlook: `tokens.css` + `design.md`. Hintergrund heller (Graphit statt fast Schwarz),
    Glas-Flächen (halbdurchsichtig + `backdrop-filter: blur`), Weiß als Hauptakzent
    (Hauptknopf weiß mit schwarzer Schrift), kein Neon mehr: Zustände (Haken, Fortschritt) in Weiß.
    Neue Tokens für Bereichsfarben (`--farbe-heute`, `--farbe-todos`, `--farbe-einstellungen`,
    später `--farbe-physio`) und für Glas (Fläche, Unschärfe). Feiner Lichtschein oben in der Bereichsfarbe
  - b) Bausteine: Karte im Glas-Look, Knopf `primary` (weiß); neu: `kopfbild` (Illustration + Seitentitel + Spruch),
    `kachel` (Fläche mit Symbol, Wert, Text; groß/klein), `chips` (waagrechte Leiste antippbarer Kapseln).
    Musterseite `bausteine.html` ergänzen
  - c) Illustrationen: SVG je Bereich in `assets/bilder/` (Heute: z. B. Kirschblüten bei Sonnenaufgang,
    To-dos: Ahorn/Pinselstrich, Einstellungen: Chrysantheme o. ä., Physio später: Training/Bewegung),
    zart, ohne eigenen Hintergrund, Ränder weich auslaufend, in der Bereichsfarbe. Sprüche: kleine Liste japanischer Sprichwörter
    (japanisch + deutsche Übersetzung), wechselt täglich; Datei in `src/app/` oder `src/core/`
  - d) Heute: Kopfbild + Spruch des Tages; Inhalt bleibt Platzhalter (echte Heute-Übersicht ist ein eigenes Modul)
  - e) To-dos neu angeordnet: Kopfbild, Schnelleingabe, Gruppen nach Zeit (Überfällig · Heute · Diese Woche ·
    Später · Ohne Datum) ohne Kästen, nur mit Gruppen-Überschrift; Priorität als Punkt; Bereichs-Chips oben
    zum Filtern (Alle · Praxis · …) mit sichtbarem Chip „Bereiche bearbeiten“; „Erledigt“ bleibt eingeklappt unten.
    Auch auf dem Mac untereinander (keine Spalten)
  - f) Einstellungen als Kacheln: große Abgleich-Kachel mit Status-Ring, kleine Kacheln Export und Abmelden
  - Am Ende neue Dateien in `APP_FILES` von `sw.js` eintragen und `VERSION` hochzählen
  Stand:
  - [x] a) Grundlook: `tokens.css` (Graphit `#16161A`, Glas, Weiß als Akzent, Bereichsfarben, `--bereich` per `@property`),
        Lichtschein `.shell::before` in `app.css`, Glas für Karte/Leisten/Modal, Haken weiß gefüllt,
        Linie der Seitenleiste in Bereichsfarbe, `theme-color` angepasst; `design.md` aktualisiert; `sw.js` auf `v9`.
        Lokal geprüft (Mac + iPhone-Größe). Noch nicht von Lukas auf dem echten iPhone geprüft
  - [x] b) Bausteine: Knopf `primary` (weiß), neu `kopfbild.js`, `kachel.js`, `chips.js` (Stile `kopfbild.css`, `kachel.css`);
        `.symbol`-Stil von `nav.css` nach `components.css` (wird jetzt auch außerhalb der Navigation gebraucht).
        Musterseite: Chip-Leiste schaltet die Bereichsfarbe um, Beispiele in `src/bausteine-neu.js` (Kopfbild mit Testbild).
        `sw.js` auf `v10`. Lokal geprüft (Mac + iPhone-Größe)
  - [x] c) Illustrationen + Sprüche: `assets/bilder/heute.svg` (Kirschblüten), `todos.svg` (Bambus + Ensō),
        `einstellungen.svg` (Glyzinie), erzeugt mit `werkzeuge/kopfbilder.py`; `src/core/sprueche.js`
        (20 Sprüche, `spruchDesTages(versatz)`); Token `--font-jp` (Mincho); Bild-Maske blendet auch oben weich aus.
        Musterseite: Chip wechselt Farbe, Bild und Spruch. `sw.js` auf `v11`. Lokal geprüft (iPhone-Größe)
  - d), e), f): im neuen Stil umgesetzt, siehe „Stand (neuer Plan)“ unten

  **Richtungswechsel nach Teil c (04.11.2026):** Lukas hat eine Vorlage gezeigt
  (`docs/vorlagen/design-stein-licht.webp`). Davon nur das **Design** übernehmen, nicht die Inhalte
  (kein „STILL“, keine Texte daraus). Nicht japanisch, nicht orange/gold, sondern grau-weißlich.
  Das gilt jetzt statt der japanischen Bilder und Sprüche aus Teil c; a und b bleiben die Grundlage.
  Entscheidungen:
  - Bild oben wie in der Vorlage (fotorealistischer Stein im Lichtstrahl), von Claude selbst gebaut
    (SVG mit Verläufen, Unschärfe und Körnung), so nah wie möglich an der Vorlage, in Grau statt Gold
  - Untertitel: kursiver deutscher Spruch, wechselt täglich (eigene Sätze, keine Zitate)
  - Akzent: warmes Grau-Weiß (Elfenbein) für Labels, Strich, Symbole, aktiven Tab;
    Bereichsfarbe nur noch als ganz leichter Schimmer im Hintergrund
  - Kopfzeile: dezent „SYSTEM 0“ in gesperrter Serifenschrift oben auf jeder Seite
  - Navigation bleibt unten (Tab-Leiste iPhone, Seitenleiste Mac); keine Kapsel-Navigation oben
  Design-Merkmale aus der Vorlage: Serifenschrift (Apple „New York“ über `ui-serif`, kostenlos, schon auf
  den Geräten) für Titel, Werte und kursive Untertitel; kurzer Strich unter dem Titel; kleine Labels in
  gesperrten Großbuchstaben; Kacheln mit Symbol im abgerundeten Quadrat; großes Bild, das in den Inhalt übergeht;
  aktiver Tab mit kurzem Strich darunter.

  Neuer Plan (wartet auf Lukas' Okay; Teile g → i, danach d → f im neuen Stil, nach jedem Teil kurz prüfen):
  - g) Grundlook neu: `tokens.css` + `design.md`. Akzent Elfenbein (`--accent`), Serifen-Token `--font-serif`,
    Label-Stil (Großbuchstaben, Sperrung), Schimmer schwächer; `--font-jp` entfernen
  - h) Bausteine neu: Markenzeile „SYSTEM 0“; Kopfbild neu (großer Serifentitel, Strich, kursiver Spruch,
    Bild vollflächig, unten weich in den Inhalt auslaufend); Kacheln (Symbol im abgerundeten Quadrat, Label in
    Großbuchstaben, Wert in Serifenschrift); Tab-Leiste/Seitenleiste: aktiver Eintrag Elfenbein + Strich;
    Chips im neuen Stil. Neue Symbole für Abgleich, Export, Konto. Musterseite anpassen
  - i) Bilder + Sprüche: Stein-Szenen als SVG (dunkler Grund, Lichtstrahl schräg von rechts oben, Körnung).
    Je Bereich ein anderes Objekt, damit man sieht, wo man ist: Heute Kugel, To-dos gestapelte Steine,
    Einstellungen flacher Stein / Würfel, Physio später. Japanische Bilder, `werkzeuge/kopfbilder.py`
    (wird zum Stein-Werkzeug umgebaut) und Sprüche ersetzen: `sprueche.js` mit deutschen Sätzen
  - d) Heute, e) To-dos, f) Einstellungen wie oben geplant, aber im neuen Stil
  Stand (neuer Plan):
  - [x] d) Heute: `shell.js` baut jetzt für jeden Bereich den Kopf (`kopfbild` statt einfachem Titel; Spruch je Bereich
        verschieden); Router-Optionen `bild` und `ueber`. Heute: Stein-Kugel, Datum über dem Titel, Spruch.
        Bilder ohne eigenen Hintergrund, Ränder weich (rechts erst ab 560 px). `sw.js` auf `v16`.
        Lokal geprüft (iPhone-Größe, mittlere Breite, Mac-Breite). To-dos/Einstellungen haben schon den großen Titel,
        ihr Bild kommt in e) und f)
  - [x] Bilder ersetzt: Lukas fand die selbst gezeichneten SVG-Steine zu künstlich und sah Bildkanten. Jetzt Fotos
        von Lukas (Bild-KI), je Bereich 3 Varianten (`assets/bilder/<bereich>-1…3.webp`), täglich wechselnd
        (`desTages` in `sprueche.js`); To-dos und Einstellungen haben ihre Bilder damit schon. Einbau per
        `mix-blend-mode: lighten` + Maske, keine Kante mehr. `werkzeuge/kopfbilder.py` und die SVGs entfernt.
        `sw.js` auf `v17`. Lokal geprüft (iPhone-Größe, Mac-Breite)
  - [x] e) To-dos neu angeordnet (Details in `module/todos.md`): Chips, Gruppen nach Zeit, Prio-Punkt, keine Kästen.
        Dazu: Spruch nur noch auf Heute (Router-Option `spruch: true`), Kopf ohne Spruch kompakter (`kopf--kompakt`).
        `sw.js` auf `v18`. Lokal geprüft
  - [x] f) Einstellungen als Kacheln: große Kachel „Abgleich“ (`src/app/abgleich-kachel.js`; Zustand groß, Uhrzeit und
        wartende Änderungen klein, Antippen = abgleichen, Symbol dreht sich beim Abgleich, Fehler in `--warn`),
        kleine Kacheln „Export“ und „Konto“ (Abmelden mit kurzer Rückfrage). `sync-karte.js`/`export-karte.js` entfernt.
        `sw.js` auf `v19`. Lokal geprüft (iPhone-Größe, Mac-Breite, Zustände per Test-Ereignis)
  - [x] Nach Lukas' Prüfung auf dem Mac: Foto verschmolz in seinem Browser nicht (dunkles Rechteck) → Kopfbild jetzt
        `background-blend-mode` statt `mix-blend-mode`, Maske links ganz auf 0. Kacheln filigraner und ruhiger
        (kleinere Symbole, Wert 20 px, weniger Innenabstand). `sw.js` auf `v20`. Lokal geprüft (iPhone-Größe, Mac-Breite)
  - [x] Sichtbarer „Klick“ beim Seitenwechsel behoben: Fotos aller Bereiche werden beim Start vorgeladen
        (`src/app/kopfbilder.js`), Einblende-Animation entfernt. `sw.js` auf `v21`
  - [x] Von Lukas auf dem Mac geprüft: „passt“. Runde abgeschlossen
  - Offen/später: iPhone-Test der letzten Fassung (Lukas pusht selbst). Lukas will später in eigenen Sitzungen
    nochmal ans Design (Feinschliff); dafür reichen `design.md` und diese Notizen
  - [x] g) Grundlook neu: `tokens.css` (Graphit `#151515`, warmes Weiß/Grau, Akzent Elfenbein `#E9E3D7`,
        gedämpfte Bereichsfarben, Schimmer 16 %, `--font-serif`, `--fs-display`, `--fs-label`, `--sperrung`;
        `--font-jp` entfernt). Überschriften (Seite, Karte, Modal, Kopfbild, Markenname Seitenleiste) in Serifenschrift.
        `design.md` aktualisiert, `sw.js` auf `v12`. Lokal geprüft (iPhone-Größe)
  - [x] h) Bausteine neu: `schrift.css` (`.marke`, `.label`, `.strich`); Markenzeile in `shell.js` (iPhone) und
        Seitenleiste (Mac); `kopfbild` neu (Bild vollflächig, großer Serifentitel, Strich, kursiver Spruch als Text);
        Kacheln (Symbol im abgerundeten Quadrat, Label, Wert in Serifenschrift, groß = Symbol links); Chips in
        Serifenschrift, gewählt Elfenbein; Navigation aktiv in Elfenbein + Strich; neue Symbole `abgleich`, `export`, `konto`.
        Musterseite angepasst (Kopf noch ohne Bild). `sw.js` auf `v13`. Lokal geprüft (iPhone-Größe, Mac-Breite)
  - [x] i) Stein-Bilder + deutsche Sprüche: `werkzeuge/kopfbilder.py` neu (Stein-Szenen), `assets/bilder/heute.svg`
        (Kugel), `todos.svg` (Steinstapel), `einstellungen.svg` (Quader), je ca. 3,5 KB; japanische Bilder ersetzt.
        `sprueche.js` mit 20 deutschen Sätzen (`spruchDesTages` liefert jetzt Text). Kopfbild-Maske ringsum weich.
        `sw.js` auf `v14`. Lokal geprüft (iPhone-Größe, Musterseite)
  - [x] Service Worker repariert (`v15`): lokal (localhost) baut er jede Anfrage neu aus der Adresse
        (`new Request(url, { cache: 'no-cache' })`) und liefert bei Fehlern eine saubere Fehlerantwort.
        Vorher kam lokal teils die alte Fassung oder eine Seite ohne Stil. Von Lukas auf dem Mac bestätigt
  - Merke: Zeigt der Browser lokal noch die alte Fassung, hart neu laden (⌘ + ⇧ + R)
  Geklärt mit Lukas:
  - To-do-Gruppen auf Mac und iPhone untereinander
  - Kopfbilder fest (kein Wechsel nach Tageszeit). Nicht plump: ohne eigenen Hintergrund,
    Ränder weich ins Seiten-Hintergrund auslaufen lassen (Verlauf/Maske), eher zart als flächig
  - Neon-Grün fällt weg: Akzent ist Weiß, dazu pro Seite ein leichter Farbschimmer in der Bereichsfarbe
    (Lichtschein oben, Kopfbild, kleine Details). `--accent` wird Weiß; Haken, aktiver Tab usw. entsprechend
- [x] PhysioZentrum mit Mindmap, erste Fassung (`module/physio.md`) – vorgezogen aus Phase 2, abgeschlossen 05.11.2026
  Mindmap als Hauptansicht (helles Overlay, Suche, Fokus-Karte mit Gleiten, Verknüpfen/Anlegen direkt dort,
  Zurück-Wischen Schritt für Schritt), Eintrag mit Feldern je Art und Autospeichern, Bilder (Galerie im Eintrag,
  Bälle schwarz-weiß in der Karte, Mac: Ziehen/⌘V). Migrationen `003_physio.sql`, `004_physio_bilder.sql`; `sw.js` `v33`.
  Neu im Kern dabei: `src/core/dateien.js` (Dateien local-first, auch für spätere Module), lokale DB Version 2,
  Abgleich überspringt fehlende Tabellen. Weiteres sammelt Lukas beim Befüllen unter „Wünsche für später“ in `module/physio.md`
- [x] Kalender persönlich, mit Google-Kalender-Anzeige (`module/kalender.md`) – erste Fassung abgeschlossen 08.11.2026
  Liste „Nächste Termine“ + Woche, Termin anlegen/bearbeiten/löschen, Schnelleingabe mit Erkennung („Mo 18 Uhr Training“),
  Google nur lesen über geheime iCal-Adresse + Supabase-Funktion `google-kalender` (Termine nur im Gerät zwischengespeichert).
  Migration `005_kalender.sql`; `sw.js` `v38`. Testseiten `tests/kalender-erkennen.html`, `tests/kalender-ical.html`.
  Kopfbild vorbereitet, Fotos fehlen noch. Weiteres unter „Wünsche für später“ in `module/kalender.md`
- [x] Design-Runde 2: Glas-Dashboard (08.11.2026)
  Entschieden mit Lukas: Look exakt wie sein Reel „Glassy Dashboard“ (statt der älteren Dashboard-Vorlagen),
  immer hell, eine wählbare Akzentfarbe färbt die ganze Stimmung, iPhone = schwebende Glas-Kapsel unten,
  Mac = Glas-Seitenleiste links, einklappbar. „Stein & Licht“ pausiert (Kopfbilder werden nicht mehr gezeigt).
  Stand: Musterseite `muster/glas.html` (+ `glas.css`, `glas-teile.css`, `glas.js`) bleibt als Vorlage für die
  Heute-Übersicht (Hero-Karte mit Ring, Kennzahl-Kacheln, Schnellaktionen, Verlauf- und Donut-Diagramm).
  App umgestellt: `tokens.css` (alles aus `--accent` gemischt), Farbwolken-Hintergrund in `base.css`, `nav.css`/`nav.js`
  (Kapsel + Seitenleiste mit gleitender Pille), Karten/Kacheln/Knöpfe/Tabs/Modal/Chips als Glas bzw. Pillen,
  Seitenkopf ohne Bild, To-do- und Termin-Gruppen als Glaskarten, Serifenschrift entfernt.
  Akzentfarbe: `src/core/akzent.js` + Kachel in den Einstellungen (synchronisiert). Funktionen unverändert. `sw.js` `v39`.
  Offen/klein: `bausteine.html` zeigt noch den alten Abschnitt „Bereichsfarbe“ und ein Kopfbild; auf dem iPhone
  prüfen, ob die Statusleiste oben gut lesbar ist.
- [x] Heute-Übersicht (`module/heute.md`) – als Glas-Dashboard, Plan a)–e) fertig (09.11.2026):
  a) Rechnungen, Kopf, Hero, 4 Kacheln, b) Kalender-Karte, Verlauf, Donut, c) Seitenleiste mit Abschnitten,
  d) Akzent-Knopf, Neu-Menü, Schnellaktionen (Router-Zusatz `#/todos/neu`), e) Suche (Seitenleisten-Feld + ⌘K,
  `src/app/suche.js`, öffnet Treffer über `#/<bereich>/<id>`). Offen/klein: Such-Einstieg auf dem iPhone.
- [x] Routinen, ohne Sperre (`module/routinen.md`) – gebaut 09.11.2026: Karten je Routine mit 7-Tage-Verlauf und Serie,
  Bearbeiten (Schritte als Zeilen), Durchlauf als Vollbild, Leiste auf Heute. Migration `006_routinen.sql`; `sw.js` `v45`.
  Fix 09.11.: Abgleich (Migration `007`, `reihenfolge` → `bigint`), Punkte = Woche Mo–So; `sw.js` `v46`.
  Migration ausgeführt, mit Lukas auf Mac und iPhone geprüft.

## Phase 2 – Körper
- (PhysioZentrum: Datenbank und Suche → nach Phase 1 vorgezogen)
- [x] Trainings-Notebook mit Übernahme von Übungen aus dem PhysioZentrum (`module/training.md`)
  - [x] Erste Fassung (09.11.2026): Einheiten, Sätze, Übungen (eigene + Verweis ins PhysioZentrum, Hyrox-Vorlagen),
        Verlauf/Bestwert je Übung. Migration `008_training.sql`; `sw.js` `v47`. Offen: Migration ausführen, auf Geräten prüfen
  - [x] Wochenpläne + Training auf Heute (09.11.2026): Pläne (wöchentlich, einer aktiv), Plan-Einheiten mit Ziel-Sätzen,
        Start aus Plan (Sätze vorbefüllt), Kachel/Leiste/Schnellaktion auf Heute. Migration `009_training_plaene.sql`; `sw.js` `v48`.
        008 + 009 ausgeführt, von Lukas auf Geräten geprüft.
  - [x] v2 nach Rückmeldung (09.11.2026): entschlackt (Art/RPE raus), „Heute“ mit großem Start, Start je Plan-Einheit nur am
        eigenen Tag, Durchlauf als Vollbild (Satz für Satz, −/+, RIR 1–4, „Wie war's?“), „Zuletzt …“ je Übung. Migration
        `010_training_rir.sql`; `sw.js` `v51` (inkl. Wochen-Leiste im Hero-Stil). 010 ausgeführt, von Lukas auf Geräten geprüft
  - [x] Training in der Suche (⌘K) (09.11.2026): Gruppen „Trainings-Übungen“ (→ `#/training/uebung:<id>`) und
        „Trainingspläne“ (→ `#/training/plaene:<id>`), keine Einheiten. `sw.js` `v52`. Von Lukas auf Geräten geprüft.

## Phase 3 – Kopf & Richtung
- [x] Lebensziele und Visionen (`module/ziele.md`)
  - [x] Erste Fassung (09.11.2026): Bereiche mit Vision, Ziele (Warum, Zieldatum, Status), Schritte, „Nächster Schritt“ auf Heute,
        Suche. Migration `011_ziele.sql`; `sw.js` `v53`. 011 ausgeführt, von Lukas auf Geräten geprüft
- [ ] Affirmationen täglich, passend zu den Zielen (`module/affirmationen.md`)
  - [x] Erste Fassung (09.11.2026): Seite je Ziel, Vorschlag aus dem Warum, „Affirmation des Tages“ auf Heute, Suche.
        Migration `012_affirmationen.sql`; `sw.js` `v54`.
        Ziele heißen in der App jetzt „Visionen“ (Ziel → Schritt, Schritt → Teilschritt), `sw.js` `v55`. Offen: Migration ausführen, auf Geräten prüfen
- [ ] Gewohnheiten aufbauen und abbauen (`module/gewohnheiten.md`)

## Phase 4 – Wissen & Kreativ
- [ ] Wissen-Quiz (`module/wissen.md`)
- [ ] Bücher (`module/buecher.md`)
- [ ] Insta-Organizer (`module/insta.md`)

## Phase 5 – Ausbau
- [ ] Routinen-Sperre
- [ ] PhysioZentrum: Lernpfade (Mindmap selbst kommt schon mit dem PhysioZentrum), Bilder, Notion
- [ ] Notion-Anbindung
- [ ] Idee KI-Auswertung (Wochenrückblick über alle Module): kostet je nach Anbieter Geld bzw. Datenschutz klären;
      kostenlos jetzt schon: Export-JSON in einen Claude-Chat geben
