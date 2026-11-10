// Verlauf: was Lukas auf seinem Computer gemacht hat, damit System 0 entsteht. Zum Nachlesen und Lernen.
// Neue Schritte unten anhängen: { datum, punkte: ['…'] }. Angezeigt in Einstellungen → Verlauf (verlauf-kachel.js).
export const VERLAUF = [
  {
    datum: '03.11.2026 · Start',
    punkte: [
      'Idee und Regeln festgelegt: CLAUDE.md (feste Regeln) und docs/ (Architektur, Datenmodell, Design, Roadmap, Module)',
      'GitHub: neues Repo „system-0“ angelegt und den Ordner auf dem Mac damit verbunden',
      'Claude-Desktop-App: Code-Tab geöffnet, Ordner system-0 gewählt; erster Auftrag „Lies CLAUDE.md und docs/roadmap.md …“',
      '.gitignore angelegt, .DS_Store (Mac-Datei) aus dem Repo entfernt',
      'Supabase: neues Projekt, Region Frankfurt; Projekt-URL und Publishable (anon) Key in src/core/config.js',
      'Supabase → Authentication: eigenes Konto angelegt, danach öffentliche Registrierung abgeschaltet',
      'GitHub → Settings → Pages: Seite aus dem main-Branch veröffentlicht → lukasbergbauer.github.io/system-0',
    ],
  },
  {
    datum: '03.11.2026 · App-Hülle',
    punkte: [
      'index.html, manifest.webmanifest, sw.js (Service Worker mit Versionsnummer) und Icons → App ist installierbar (PWA)',
      'Icons mit Mac-Bordmitteln aus einer SVG in 180/192/512 px erzeugt',
      'Lokal testen im Terminal: cd ~/Documents/GitHub/system-0 und python3 -m http.server 8000, dann http://127.0.0.1:8000',
      'iPhone: Seite in Safari öffnen → Teilen → „Zum Home-Bildschirm“; Mac: Safari → Ablage → „Zum Dock hinzufügen“',
      'Ab hier jede Aufgabe gleich: Claude baut und committet, Lukas lädt mit git push hoch, Pages veröffentlicht nach ca. 1 Min.',
    ],
  },
  {
    datum: '03.–04.11.2026 · Fundament',
    punkte: [
      'Design-Tokens und UI-Bausteine (src/ui/), Musterseite bausteine.html',
      'Login mit E-Mail und Passwort über Supabase Auth',
      'Lokale Datenbank IndexedDB (local-first) + Sync mit Supabase, Export als JSON',
      'Erste SQL-Migration 001_basis.sql im Supabase-Dashboard → SQL Editor eingefügt und ausgeführt (Tabellen + Row Level Security)',
      'Navigation: Tab-Leiste am iPhone, Seitenleiste am Mac',
    ],
  },
  {
    datum: '04.–05.11.2026 · Erste Module',
    punkte: [
      'To-dos (Migration 002), Design-Runde „Stein & Licht“ mit eigenen Bild-KI-Fotos in assets/bilder/',
      'Physio-Mindmap (Migration 003, 004 mit Supabase Storage für Bilder)',
      'Gelernt: nach jeder Änderung an App-Dateien VERSION in sw.js hochzählen, sonst zeigt die App alte Dateien',
    ],
  },
  {
    datum: '08.–09.11.2026 · Alltag, Körper, Kopf',
    punkte: [
      'Kalender (Migration 005) + Google-Kalender: Supabase → Edge Functions → Funktion „google-kalender“ im Dashboard angelegt',
      'Design-Runde 2: Glas-Dashboard; Heute-Übersicht mit Suche (⌘K)',
      'Routinen, Training, Ziele, Affirmationen, Gewohnheiten, Wissen-Quiz, Bücher, Insta (Migrationen 006–016)',
      'Routinen-Sperre, Physio-Kosmos, Termin-Wiederholung (017–019)',
      'Mitteilungen per Web Push: Migration 020, Schlüssel mit tools/vapid.html erzeugt, als Supabase-Secret VAPID_KEYS gespeichert,',
      'Edge Function „erinnerungen“ angelegt („Verify JWT“ aus), Zeitplan über pg_cron – alles kostenlos im Free-Plan',
    ],
  },
  {
    datum: '10.11.2026 · Feinschliff',
    punkte: [
      'Design-Überarbeitung Phase 6: Seitenleiste, eine Farbe + Unterton, Ecken, neues App-Icon (Stein-0)',
      'Phase 7: Wünsche je Modul (Kalender-Zeitraster, To-dos Heute/Morgen, Bücher-Zitate, Migrationen 021–024)',
      'Phase 8: Einstellungen mit Prompts und diesem Verlauf',
    ],
  },
];
