# Roadmap

Reihenfolge bewusst klein gehalten: erst ein Kern, den Lukas täglich nutzt, dann wachsen.

## Phase 0 – Fundament
- [x] Repo, Supabase-Projekt, GitHub Pages eingerichtet (`docs/start.md`)
  - [x] Repo mit Platzhalter-`index.html`, `src/core/config.js`, `supabase/migrations/`
  - [x] Supabase-Projekt angelegt, URL + Publishable key in `config.js`
  - [x] Lukas' Konto in Supabase angelegt, öffentliche Registrierung abgeschaltet
  - [x] GitHub Pages aktiv: https://lukasbergbauer.github.io/system-0/
- [ ] App-Hülle, Manifest, Icons, installierbar auf Mac und iPhone
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
  - [ ] Service Worker auf echtem Gerät prüfen (die eingebaute Browser-Vorschau lässt keine zu)
  - [ ] Lukas: nach dem Push auf Mac (Dock) und iPhone (Home-Bildschirm) installieren, offline öffnen
  - Merke: Bei jeder Änderung an App-Dateien `VERSION` in `sw.js` hochzählen und neue Dateien in `APP_FILES` eintragen
- [ ] Design-Tokens und UI-Bausteine
- [ ] Login, lokale Datenbank, Sync, Export
- [ ] Navigation (Tab-Leiste iPhone, Seitenleiste Mac)

## Phase 1 – Alltag
- [ ] To-dos (`module/todos.md`)
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
