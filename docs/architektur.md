# Architektur

## Grundprinzip
PWA: eine Web-App, die auf Mac (Safari/Chrome → „Zum Dock hinzufügen“) und iPhone
(Safari → Teilen → „Zum Home-Bildschirm“) wie eine App läuft.

- **Code:** GitHub-Repo `system-0`, ausgeliefert über GitHub Pages.
- **Daten:** Supabase (Free, Region Frankfurt), Login nur für Lukas.
- **Offline:** Service Worker cacht die App-Dateien, IndexedDB hält eine lokale Kopie aller Daten.

## Ordnerstruktur (Zielbild)
```
system-0/
├── CLAUDE.md
├── index.html                 # App-Hülle, lädt nur src/main.js
├── manifest.webmanifest       # Name, Icons, Farben für den Homescreen
├── sw.js                      # Service Worker (Offline-Cache)
├── assets/icons/
├── supabase/migrations/       # SQL-Dateien, nummeriert: 001_basis.sql, 002_todos.sql …
├── docs/
└── src/
    ├── main.js                # Start: Auth prüfen, Router starten
    ├── app/                   # Ansichten außerhalb der Module: Login, Startansicht, vorläufige Karten
    ├── core/
    │   ├── config.js          # Supabase-URL + Publishable key
    │   ├── supabase.js        # Verbindung (Bibliothek vom CDN, erst bei Bedarf geladen)
    │   ├── auth.js            # Login/Logout
    │   ├── db.js              # öffnet IndexedDB
    │   ├── store.js           # Lesen/Schreiben lokal (IndexedDB)
    │   ├── sync.js            # Abgleich lokal ↔ Supabase (+ sync-local.js, tabellen.js)
    │   ├── einstellungen.js   # Schlüssel/Wert-Einstellungen
    │   ├── export.js          # alle Daten als JSON
    │   ├── router.js          # Navigation zwischen Modulen
    │   └── events.js          # Module benachrichtigen sich gegenseitig
    ├── ui/                    # wiederverwendbare Bausteine: Karte, Liste, Checkbox, Modal, Tabs
    ├── styles/
    │   ├── tokens.css         # alle Farben, Abstände, Radien, Schriften
    │   ├── base.css
    │   └── components.css
    └── module/
        ├── heute/  todos/  routinen/  kalender/
        ├── physio/  training/  gewohnheiten/
        ├── ziele/  affirmationen/  wissen/  buecher/  insta/
```

## Aufbau eines Moduls
```
src/module/<name>/
├── index.js      # registriert das Modul beim Router
├── view.js       # baut die Ansicht
├── data.js       # Lesen/Schreiben über core/store.js
└── *.js          # weitere kleine Teile nach Bedarf
```

## Mac vs. iPhone
Eine Codebasis, responsives Layout:
- **iPhone:** schnelles Eintragen und Abhaken, untere Tab-Leiste, große Tippflächen.
- **Mac:** Planen und Auswerten, Seitenleiste, mehrspaltige Ansichten.
- Die komplette Datenbasis ist auf beiden Geräten abrufbar.

## Hosting-Hinweis
GitHub Pages ist im Gratis-Plan nur für öffentliche Repos verfügbar. Das ist okay, weil im Code keine
Daten und keine Secrets liegen. Wer den Code privat halten will: Cloudflare Pages (gratis, auch mit privatem Repo).
