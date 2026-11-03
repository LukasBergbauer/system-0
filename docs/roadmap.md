# Roadmap

Reihenfolge bewusst klein gehalten: erst ein Kern, den Lukas täglich nutzt, dann wachsen.

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
- [ ] Navigation (Tab-Leiste iPhone, Seitenleiste Mac)

## Phase 1 – Alltag
- [ ] To-dos (`module/todos.md`)
- [ ] Design-Runde: Lukas ist mit Design und Anordnung noch nicht zufrieden. Erst überarbeiten,
  wenn mit Navigation und To-dos echte Ansichten da sind. Dann gemeinsam festlegen, was sich ändern soll
  (Farben, Abstände, Schrift, Anordnung der Ansichten) und `design.md`, `tokens.css` und die Bausteine anpassen.
  Lukas' Punkte (sammeln, sobald sie ihm einfallen):
  - (noch offen)
- [ ] Kalender persönlich, mit Google-Kalender-Anzeige (`module/kalender.md`)
- [ ] Heute-Übersicht (`module/heute.md`)
- [ ] Routinen, ohne Sperre (`module/routinen.md`)

## Phase 2 – Körper
- [ ] PhysioZentrum: Datenbank und Suche (`module/physio.md`)
- [ ] Trainings-Notebook mit Übernahme von Übungen aus dem PhysioZentrum (`module/training.md`)

## Phase 3 – Kopf & Richtung
- [ ] Lebensziele und Visionen (`module/ziele.md`)
- [ ] Affirmationen täglich, passend zu den Zielen (`module/affirmationen.md`)
- [ ] Gewohnheiten aufbauen und abbauen (`module/gewohnheiten.md`)

## Phase 4 – Wissen & Kreativ
- [ ] Wissen-Quiz (`module/wissen.md`)
- [ ] Bücher (`module/buecher.md`)
- [ ] Insta-Organizer (`module/insta.md`)

## Phase 5 – Ausbau
- [ ] Routinen-Sperre
- [ ] PhysioZentrum als Mindmap mit Lernpfaden
- [ ] Notion-Anbindung
