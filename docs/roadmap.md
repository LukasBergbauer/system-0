# Roadmap

Reihenfolge bewusst klein gehalten: erst ein Kern, den Lukas täglich nutzt, dann wachsen.

**Regel (ab 09.11.2026):** Stand und Pläne knapp hier bzw. in der Modul-Doku vermerken **und** immer auch in den Chat. So wenig Zeilen wie möglich, so viel wie nötig.
**Regel (ab 09.11.2026):** Supabase-Migrationen/SQL immer zusätzlich vollständig als Codeblock in den Chat.

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
  - Physio ist wichtig und kommt direkt nach der Design-Runde (Roadmap entsprechend umgestellt)

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
- [x] Physio mit Mindmap, erste Fassung (`module/physio.md`) – vorgezogen aus Phase 2, abgeschlossen 05.11.2026
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
  Erledigt (09.11.2026, `sw.js` `v69`): `bausteine.html` ohne „Bereichsfarbe“/Kopfbild (jetzt Chips-Muster). Statusleiste: dunkler Streifen hinter Uhrzeit/Akku
  ist schon da (`base.css`). Von Lukas auf dem iPhone geprüft.
- [x] Heute-Übersicht (`module/heute.md`) – als Glas-Dashboard, Plan a)–e) fertig (09.11.2026):
  a) Rechnungen, Kopf, Hero, 4 Kacheln, b) Kalender-Karte, Verlauf, Donut, c) Seitenleiste mit Abschnitten,
  d) Akzent-Knopf, Neu-Menü, Schnellaktionen (Router-Zusatz `#/todos/neu`), e) Suche (Seitenleisten-Feld + ⌘K,
  `src/app/suche.js`, öffnet Treffer über `#/<bereich>/<id>`). Such-Einstieg iPhone (09.11.2026, `v69`): Lupe im Heute-Kopf (nur < 768 px, `emit('suche')` → Hülle öffnet Suche) und „Suchen …“ oben in „Mehr“.
- [x] Routinen, ohne Sperre (`module/routinen.md`) – gebaut 09.11.2026: Karten je Routine mit 7-Tage-Verlauf und Serie,
  Bearbeiten (Schritte als Zeilen), Durchlauf als Vollbild, Leiste auf Heute. Migration `006_routinen.sql`; `sw.js` `v45`.
  Fix 09.11.: Abgleich (Migration `007`, `reihenfolge` → `bigint`), Punkte = Woche Mo–So; `sw.js` `v46`.
  Migration ausgeführt, mit Lukas auf Mac und iPhone geprüft.

## Phase 2 – Körper
- (Physio: Datenbank und Suche → nach Phase 1 vorgezogen)
- [x] Trainings-Notebook mit Übernahme von Übungen aus Physio (`module/training.md`)
  - [x] Erste Fassung (09.11.2026): Einheiten, Sätze, Übungen (eigene + Verweis nach Physio, Hyrox-Vorlagen),
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
- [x] Affirmationen täglich, passend zu den Zielen (`module/affirmationen.md`)
  - [x] Erste Fassung (09.11.2026): Seite je Ziel, Vorschlag aus dem Warum, „Affirmation des Tages“ auf Heute, Suche.
        Migration `012_affirmationen.sql`; `sw.js` `v54`.
        Ziele heißen in der App jetzt „Visionen“ (Ziel → Schritt, Schritt → Teilschritt), `sw.js` `v55`.
  - [x] Migration 012 ausgeführt, Affirmationen, Visionen und Heute auf Geräten geprüft (09.11.2026)
- [x] Gewohnheiten aufbauen und abbauen (`module/gewohnheiten.md`)
  - [x] Erste Fassung (09.11.2026): Aufbauen (abhaken/Anzahl/Zeit), Abbauen (Tage ohne, Rückfall mit Auslöser-Chips),
        Leiste auf Heute. Migration `013_gewohnheiten.sql`; `sw.js` `v58`.
  - [x] Migration 013 ausgeführt, auf Geräten geprüft (09.11.2026)

- [x] Zähler gehen beim Entfernen auf 0 (09.11.2026): Training zählt nur Einheiten mit Inhalt (Sätze oder Dauer/Gefühl/Belastung/Notiz),
      in Training und Heute gleich; Einheit löschen räumt alle Sätze frisch gelesen weg; Gewohnheit zurücksetzen entfernt
      zweite Tageseinträge (anderes Gerät); Routine löschen räumt Logs weg; Ring/Balken zeigen bei 0 keinen Punkt bzw. kein Leuchten. `sw.js` `v62`
      Training ohne Plan: kein Standardziel 3 mehr, nur „0 Einheiten“ ohne Balken. `sw.js` `v65`

## Phase 4 – Wissen & Kreativ
- [x] Wissen-Quiz (`module/wissen.md`)
  - [x] Erste Fassung (09.11.2026): Daily (5 neue Fragen/Tag, Serie), Endlos (Themen, neue zuerst), Statistik, Import aus Claude-Chat,
        Karte auf Heute, 150 Fragen in 6 Themen. Migration `014_wissen.sql`; `sw.js` `v60` (Fragen überarbeitet: verständlicher, Anatomie/Physio schwieriger).
  - [x] Thema Muskeln, Teil 1 (Arm + Bein, 368 Fragen, Generator `tools/quiz/`), `sw.js` `v61`. Teil 2 Rumpf/Atmung/Beckenboden/Hals/Nacken/Kau (124 Muskeln, 496 Fragen), `sw.js` `v63`.
  - [x] Thema Bänder (42 Bänder, 117 Fragen), `sw.js` `v64`. 014 ausgeführt, von Lukas auf Geräten geprüft (inkl. Zähler bei 0)
- [x] Bücher (`module/buecher.md`)
  - [x] Erste Fassung (09.11.2026): Liste nach Status, Cover (Foto oder Open Library), Markdown-Editor, Leseansicht, Suche.
        Migration `015_buecher.sql`; `sw.js` `v67`. 015 ausgeführt, von Lukas auf Geräten geprüft
- [x] Insta-Organizer (`module/insta.md`)
  - [x] Erste Fassung (09.11.2026): Skript-Import aus Claude (JSON, Schlüssel = Update), Kurzfassung je Post, Planer/Monat, Hashtag-Sets,
        Zahlen von Hand bzw. per Import, Export für eigenen Agenten, Erkenntnisse, Heute-Leiste, Suche. Migration `016_insta.sql`; `sw.js` `v68`.
        016 ausgeführt, von Lukas auf Geräten geprüft

## Phase 5 – Ausbau
- [x] Routinen-Sperre (`module/routinen.md`)
  - [x] Gebaut (09.11.2026): Schalter + Startzeit je Routine, Vollbild-Sperre, „Heute aussetzen“. Migration `017_routinen_sperre.sql`; `sw.js` `v70`.
        017 ausgeführt, von Lukas auf Geräten geprüft
- [x] Physio: Kosmos-Startseite mit Bubbles (`module/physio.md` → „Plan Kosmos“)
  - [x] Gebaut (09.11.2026): heller Glas-Kosmos, Bubbles je Pfad, Hover = eindringen, Klick = Innenansicht; Art Trainingsform.
        Migration `018_physio_trainingsform.sql`; `sw.js` `v72`. 018 ausgeführt, von Lukas auf Geräten geprüft
  - [x] Mindmap im Glas-Kosmos-Stil (09.11.2026): Glas-Bubbles statt Pillen, Lichtfäden, Schweben unregelmäßig (Kosmos + Mindmap),
        Bubble antippen = schwebt in die Mitte, Rest blendet aus; Knopf „Text“ öffnet den Eintrag (Glas-Karten). `sw.js` `v73`. Geprüft: Schweben gefiel nicht
  - [x] Wolken statt Schweben (09.11.2026): feste Plätze, Wolken-Form, Hover = leicht größer + Wabbeln, Linien von Anfang an,
        Kosmos-Bubble gleitet beim Klick in die Mitte; Name „Physio“. `sw.js` `v74`. Offen: auf Geräten prüfen
  - [x] Lernpfade (09.11.2026, `module/physio.md` → „Plan Lernpfade“): Region → Krankheitsbild → Muskel/Trainingsform → Übung,
        Pfad-Leiste oben. `sw.js` `v75`. Offen: auf Geräten mit echten Regionen prüfen
  - [x] 3D-Kugeln + Weiterhangeln im Kosmos (09.11.2026): Kosmos nutzt die Fokus-Karte, Mitte antippen = anderes Interface. `sw.js` `v76`.
        Gerät zeigte altes JS + neues CSS (GitHub-CDN lieferte beim Update kurz alte Datei) → `sw.js` holt mit `?v=VERSION`, `v77`.
  - [x] Art-Liste und Mindmap-Suche sind ein Overlay (09.11.2026, `tiefe.js` weg). `sw.js` `v78`.
  - [x] ~~Physio-Kugel = Listen-Suche (v79)~~ → falsch herum. Glas-Innenansicht für alle Kugeln, edler, flüssig gemessen. `sw.js` `v80`. Offen: auf Geräten prüfen
  - [x] Physio-Kugel (10.11.2026, `v87`): Bereiche selbst festlegen, Suche + Verlauf oben im Kosmos, Fußzeile weg. Offen: `021` ausführen, Geräte
- [x] Extra-Themen (09.11.2026, eine Sitzung, Block für Block)
  - [x] 1. Wiederherstellen: Kachel in Einstellungen, Export-JSON → Vorschau je Tabelle → einspielen (lokal + Sync, nichts löschen,
        gleiche id = überschreiben). `src/core/wiederherstellen.js`, `src/app/wiederherstellen-kachel.js`; `sw.js` `v81`
  - [x] 2. Kalender: Wiederholungen (eigene Termine), Monatsansicht, fällige To-dos. Migration `019_termine_wiederholung.sql`; `sw.js` `v82`
  - [x] 3. To-dos: Schnell-Knöpfe, Wischen (abhaken/löschen + Rückgängig), Erledigte > 30 Tage ausgeblendet. `sw.js` `v83`
  - [x] 4. Heute: Kacheln per lange drücken + ziehen umordnen (pro Gerät). `sw.js` `v84`
  - [x] 5. Physio: einmalige Hinweise (Mitte öffnen, Lösen), Titel/Kurz enger, Art-Chips am Mac umbrechen. `sw.js` `v85`
  - [x] 6. Mitteilungen (Web Push) – geprüft: kostenlos (Supabase Free: Edge Functions, pg_cron, pg_net; Apple-Push gratis),
        keine Secrets im Code (VAPID-Schlüssel nur als Supabase-Secret `VAPID_KEYS`, erzeugt mit `tools/vapid.html`).
        iPhone nur als Home-Bildschirm-App (iOS 16.4+). Gebaut: Kachel „Mitteilungen“ (Einstellungen, an/aus je Gerät,
        Vorlauf 5/15/30/60 Min.), `src/core/mitteilungen.js` (Abo), `src/core/erinnerungen.js` (plant 14 Tage: Termine inkl.
        Wiederholungen, ganztägige 8:00; Routinen mit eigener Startzeit, außer fertig/ausgesetzt), `sw.js` zeigt die Mitteilung
        (Antippen öffnet Kalender/Routinen). Edge Function `supabase/functions/erinnerungen/index.ts` (`jsr:@negrel/webpush`),
        Migration `020_erinnerungen.sql` (Tabellen, `erinnerungen_faellig()`, Cron). `sw.js` `v86`.
        Grenze: geplant wird nur, wenn die App in den letzten 14 Tagen offen war. Offen: Einrichten (Lukas) + auf Geräten prüfen
  - [x] 7. Abschluss: alle „Wünsche für später“ und offenen Punkte der Modul-Dokus abgehakt oder als „bewusst gestrichen“ markiert.
        Physio-Kugel-Funktionen gebaut (10.11.2026).

**Stand 09.11.2026:** Alle Phasen und Extras gebaut. Offen bei Lukas: Migrationen 019 + 020 ausführen, Edge Function
„erinnerungen“ anlegen (VAPID_KEYS aus `tools/vapid.html`, VAPID_KONTAKT, „Verify JWT“ aus), alles auf Geräten prüfen.
Nächster Schritt: Lukas wählt aus den Physio-Vorschlägen (~~Verknüpfen im Kosmos~~ `v88`, ~~Schnell-Notiz~~ `v89`, ~~Zufall~~ gestrichen; ~~Lücken finden~~ `v90`; ~~Verknüpfung mit Notiz + schwebende Notiz~~ `v91`) – alle umgesetzt, „+ Verknüpfen“ von Lukas geprüft (10.11.2026). Grober Plan fertig.
Offen bei Lukas: 019–023 ausführen, Edge Function „erinnerungen“ einrichten, Rest auf Geräten prüfen, neue Wünsche melden.
- ~~Notion-Anbindung~~ gestrichen (Lukas, 09.11.2026: nicht mehr gewünscht)
- ~~Idee KI-Auswertung~~ bewusst gestrichen (09.11.2026; kostet je nach Anbieter Geld bzw. Datenschutz);
      kostenlos jetzt schon: Export-JSON in einen Claude-Chat geben

## Phase 6 – Design-Überarbeitung (10.11.2026)
Entscheidungen Lukas: Bereichs-„Emoji“ = vorhandene Linien-Symbole, dezent; Ecken „fein“; Titel groß + kräftig mit Symbol.
Vorschau ohne Login: `tests/vorschau.html` (lokal, Supabase aus; nur Testdaten in IndexedDB).
- [x] 1. Seitenleiste: Klapp-Knopf weg, schmal + Aufklappen beim Drüberfahren; Zeiger gleitet ohne Nachfedern
      (Ursache Sprung: `--feder` schwingt ~10 % der Strecke über, dazu Breite/Höhe-Nachlauf beim Ein-/Ausklappen)
- [x] 2. Heute: Bearbeiten-Modus mit festem Raster statt Drag & Drop (`module/heute.md`), `sw.js` `v93`
- [x] 3. Bereichsfarben (`--c-<id>`, `data-bereich` → `--bereich`) in Navi, Seite und Heute-Feldern (`design.md`)
- [x] 4. Akzente Weiß + Graphit (`akzent-neutral.css`), Nebentext kontrastreicher (`design.md` → Akzentfarbe)
- [x] 5. Überschriften größer/edler (`--fs-seite` 42 px, 650) mit Bereichs-Symbol im Seitentitel und in Heute-Karten
- [x] 6. Knöpfe: eine Höhe (`--knopf`), nebeneinander (`.knopfreihe`, Fenster-Fuß am iPhone gleich breit); Prüfskript fand keine gestapelten Paare
- [x] 7. Ecken/Glaskante: Radien 16/22/10 als Tokens, 0,5-px-Lichtrand, Innenlicht, ruhiger Schatten (`design.md`), `sw.js` `v98`
**Stand 10.11.2026:** Design-Überarbeitung 1–7 fertig, lokal am Mac (1300 px) und in iPhone-Größe geprüft (Koralle, Weiß, Graphit).
Offen bei Lukas: auf Geräten prüfen (v. a. Hover-Leiste, Bearbeiten-Modus am iPhone, Akzente Weiß/Graphit).
- [x] 8. Rückmeldung Lukas: Bereichsfarben zurückgebaut (alles einheitlich), dafür wählbarer **Unterton** (`design.md`), `sw.js` `v99`.
      Lokal geprüft: Koralle+Gold, Weiß+Rosé (Mac), Graphit+Gold (iPhone). Offen: auf Geräten prüfen.
- [x] 9. Runde 2 – Seitenleiste: Auf/Zu per Klasse `shell--leiste-offen` (nav.js `leisteKlappen`) statt `:not(:hover, :has(:focus-visible))`
      (Safari rechnete das nicht zuverlässig neu → Abschnitts-Namen blieben stehen/fehlten; Text blendete vor der Breite ein).
      Auf sofort (240 ms), zu nach 140 ms; Text zu sofort weg, auf erst nach 90 ms. Heute: Leiste schiebt den Inhalt. `sw.js` `v100`
- [x] 10. Runde 2 – Module außer Heute: Musterseite `muster/runde2.html` (Kopf A Glas-Leiste / B Plakette / C Editorial,
      Abschnitte 1 Glas-Kasten / 2 Reiter / 3 Linie, Bereichs-Muster je Modul). Lukas wählt: Kopf A, Abschnitte 1, alle Muster.
- [x] 11. Kopf A (`ui/kopfbild.js`) mit Abschnitt + Kennzahlen (`kennzahlen.js` je Modul), Muster je Bereich (`kopf-muster.css`), `sw.js` `v101`
- [x] 12. Abschnitts-Überschriften als Glas-Kasten (`ui/abschnitt.js`, Stil in `schrift.css`) in To-dos, Kalender (Liste/Woche/Monat),
      Gewohnheiten, Training (Plan, Heute), Insta-Post. `sw.js` `v102`
**Stand Runde 2 (10.11.2026):** 9–12 fertig, lokal geprüft am Mac (1300 px) und iPhone-Größe. Offen bei Lukas: auf Geräten prüfen
(v. a. Leiste in Safari, Muster-Stärke).
- [x] 13. Rückmeldung Runde 2: Leiste ruckelte (margin-Übergang rechnete Heute jedes Bild neu, Zeiger-Messung je Bild).
      Jetzt: Inhalt weicht in **allen** Bereichen aus, gleitet per FLIP/Web Animations (`app/gleiten.js`, 260 ms, Heute-Felder einzeln),
      Zeiger nur bei neuer Höhe, Leiste `contain`. Kopf-Kennzahlen ohne Trennstriche. Training-Karte „Diese Woche“ gestrichen,
      Kopf zeigt Einheiten · Minuten · Wochen in Folge. `sw.js` `v103`. Offen bei Lukas: Gefühl in Safari/am Mac prüfen.
- [x] 14. Sprung noch zu heftig (Kurve `--ease` legte ~80 % der Strecke ins erste Drittel): Leiste + Inhalt jetzt 420 ms,
      sanfte Kurve `cubic-bezier(.45,0,.2,1)`, startet sofort; Text blendet ab 160 ms ein. `sw.js` `v104`
**Stand 10.11.2026:** Lukas: Leiste wirkt ruhig, Feinschliff (Tempo, Felder-Verzerrung beim Gleiten) evtl. später.
Runde 2 abgeschlossen. Nächster Schritt: iPhone-App-Icon (stille Stein-Null auf weißem Schimmer) + Funktions-Vorschläge.
Vorgemerkt (später): Sonntags-Reflexion zum Durchklicken über alle Bereiche.
- [x] 15. App-Icon: Muster `muster/icon.html` (A Marmor, B Graphit, C graviert). Lukas: Null von C + Hintergrund von A →
      `assets/icons/icon.svg`, PNG 180/192/512 per Chrome headless gerendert, Manifest `background_color` #F6F5F2, `sw.js` `v105`.
      Offen bei Lukas: Icon am iPhone neu vom Homescreen hinzufügen (iOS behält das alte sonst).
- [x] 16. Leiste: Logo oben links = App-Icon, Profil „L“ als gravierte Stein-Kachel (`avatar-l.svg`), `sw.js` `v106`
- [x] 17. Fensterleiste (Mac-Web-App) / Statusleiste färbt sich wie der Hintergrund: `core/akzent.js` setzt `theme-color` = aufgelöstes `--bg`
      nach dem Überblenden (Zeitgeber + `transitionend`), `sw.js` `v107`
- Vorschläge Funktionen (10.11.2026, nur Liste im Chat): Wochenrückblick (= Sonntags-Reflexion), Erinnerungen, Inbox, Training-Fortschritt,
  Zitate aus Büchern, Gewohnheiten↔Ziele, Quiz-Wiederholung, Backup-Export, Heute-Abendmodus, Insta-Auswertung.

## Phase 7 – Funktionen je Modul (Wünsche Lukas, 10.11.2026)
Reihenfolge, je Punkt eigener Commit + `sw.js` hochzählen, lokal Mac + iPhone-Größe prüfen:
- [ ] 1. Heute: jede Box (auch klein) zeigt den Modulnamen
- [ ] 2. Kalender: echte Tag-/Woche-/Monat-Ansicht (Zeitraster), Glas-Stil
- [ ] 3. To-dos: Box „Heute“ + „Morgen“ vorneweg; morgige rutschen am Folgetag nach Heute; nicht erledigte von gestern
      unten als „Nicht erledigt“ mit Datum; Strich neben dem Titel weg; Bereichs-Chips unter „Neues To-do“ weg (Bereiche bleiben)
- [ ] 4. Routinen: strukturierter anordnen (nicht lose nebeneinander)
- [ ] 5. Quiz: Statistik volle Breite; Daily-Box mittig mit „Starten“ und mehr Text; Endlos als schmalerer, gefüllter Balken mit allen Themen
- [ ] 6. Bücher: Bücher in Glas-Box; Seiten-Kreis unten rechts am Cover (manuell setzen); „Zusammenfassung“ mit Seitenzahl,
      erscheint unter dem Buch; Knopf „Absatz“ für Lieblingsstellen, wählbar auf Heute
- [ ] 7. Einstellungen: Abmelden-Knopf volle Breite
Später: Physio, Insta.
