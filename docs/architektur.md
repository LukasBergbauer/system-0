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
    ├── main.js                # Start: Router starten, je nach Login Login oder Rahmen zeigen
    ├── app/                   # außerhalb der Module: Login, Rahmen (shell, nav, nav-plan), Mehr,
    │                          # Einstellungen, bereiche.js (meldet alle Bereiche an)
    ├── core/
    │   ├── config.js          # Supabase-URL + Publishable key
    │   ├── supabase.js        # Verbindung (Bibliothek vom CDN, erst bei Bedarf geladen)
    │   ├── auth.js            # Login/Logout
    │   ├── db.js              # öffnet IndexedDB
    │   ├── store.js           # Lesen/Schreiben lokal (IndexedDB)
    │   ├── sync.js            # Abgleich lokal ↔ Supabase (+ sync-local.js, tabellen.js)
    │   ├── einstellungen.js   # Schlüssel/Wert-Einstellungen
    │   ├── export.js          # alle Daten als JSON
    │   ├── router.js          # Navigation: Hash-Adressen #/<id>, Bereiche melden sich an
    │   └── events.js          # Module benachrichtigen sich gegenseitig
    ├── ui/                    # wiederverwendbare Bausteine: Karte, Liste, Checkbox, Modal, Tabs, Symbole
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
├── index.js      # registriert das Modul beim Router: register({ id, titel, symbol, ansicht })
├── view.js       # baut die Ansicht
├── data.js       # Lesen/Schreiben über core/store.js
└── *.js          # weitere kleine Teile nach Bedarf
```

Neues Modul anmelden: `index.js` in `src/app/bereiche.js` importieren, Symbol in `src/ui/symbol.js` ergänzen.
`ansicht({ signal })` liefert ein Element; Ereignisse mit `on(name, fn, { signal })` abonnieren,
dann enden sie automatisch beim Verlassen der Ansicht.

## Navigation
- Adressen: `#/heute`, `#/einstellungen` … (Zurück-Knopf und -Wischen funktionieren). Unbekannt → `#/heute`.
- iPhone: Tab-Leiste unten. Reihenfolge Heute, To-dos, Kalender, Training, dann der Rest, Einstellungen ganz hinten.
  Bis 5 Bereiche stehen alle in der Leiste, ab 6 die ersten 4 + „Mehr“ (`#/mehr`, Liste der übrigen).
- Mac (ab 768 px): Seitenleiste links mit allen Bereichen, Einstellungen unten.

## Mac vs. iPhone
Eine Codebasis, responsives Layout:
- **iPhone:** schnelles Eintragen und Abhaken, untere Tab-Leiste, große Tippflächen.
- **Mac:** Planen und Auswerten, Seitenleiste, mehrspaltige Ansichten.
- Die komplette Datenbasis ist auf beiden Geräten abrufbar.

## Hosting-Hinweis
GitHub Pages ist im Gratis-Plan nur für öffentliche Repos verfügbar. Das ist okay, weil im Code keine
Daten und keine Secrets liegen. Wer den Code privat halten will: Cloudflare Pages (gratis, auch mit privatem Repo).
