// Service Worker: hält die App-Dateien offline bereit.
// Bei jeder Änderung an App-Dateien VERSION hochzählen,
// damit Geräte die neue Fassung laden.
// Supabase-Anfragen (Daten, Login) werden nie gecacht.

const VERSION = 'v61';
const CACHE = `system0-${VERSION}`;
const LIB = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/dist/umd/supabase.js';
// Auf dem eigenen Mac (localhost) immer zuerst das Netz fragen, damit Änderungen sofort sichtbar sind.
const DEV = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

const APP_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './src/main.js',
  './src/core/config.js',
  './src/core/supabase.js',
  './src/core/auth.js',
  './src/core/db.js',
  './src/core/events.js',
  './src/core/store.js',
  './src/core/tabellen.js',
  './src/core/sync-local.js',
  './src/core/sync.js',
  './src/core/einstellungen.js',
  './src/core/export.js',
  './src/core/akzent.js',
  './src/app/login.js',
  './src/app/shell.js',
  './src/app/nav.js',
  './src/app/nav-plan.js',
  './src/app/suche.js',
  './src/app/bald.js',
  './src/app/bereiche.js',
  './src/app/mehr.js',
  './src/app/einstellungen.js',
  './src/app/akzent-kachel.js',
  './src/module/heute/index.js',
  './src/module/heute/view.js',
  './src/module/heute/rechnen.js',
  './src/module/heute/bewegung.js',
  './src/module/heute/kopf.js',
  './src/module/heute/kopf-knoepfe.js',
  './src/module/heute/hero.js',
  './src/module/heute/kacheln.js',
  './src/module/heute/kalender-karte.js',
  './src/module/heute/routinen-leiste.js',
  './src/module/heute/gewohnheiten-leiste.js',
  './src/module/heute/ziele-leiste.js',
  './src/module/heute/affirmation.js',
  './src/module/heute/quiz-karte.js',
  './src/module/heute/verlauf.js',
  './src/module/heute/donut.js',
  './src/module/todos/index.js',
  './src/module/todos/data.js',
  './src/module/todos/sortierung.js',
  './src/module/todos/view.js',
  './src/module/todos/zeile.js',
  './src/module/todos/schnelleingabe.js',
  './src/module/todos/bearbeiten.js',
  './src/module/todos/erledigt.js',
  './src/module/todos/gruppen.js',
  './src/module/todos/filter.js',
  './src/module/todos/bereiche-verwalten.js',
  './src/module/kalender/index.js',
  './src/module/kalender/daten.js',
  './src/module/kalender/zeit.js',
  './src/module/kalender/view.js',
  './src/module/kalender/bearbeiten.js',
  './src/module/kalender/erkennen.js',
  './src/module/kalender/schnelleingabe.js',
  './src/module/kalender/woche.js',
  './src/module/kalender/ical.js',
  './src/module/kalender/wiederholung.js',
  './src/module/kalender/google.js',
  './src/module/kalender/google-adresse.js',
  './src/module/routinen/index.js',
  './src/module/routinen/data.js',
  './src/module/routinen/view.js',
  './src/module/routinen/karte.js',
  './src/module/routinen/bearbeiten.js',
  './src/module/routinen/durchlauf.js',
  './src/module/ziele/index.js',
  './src/module/ziele/data.js',
  './src/module/ziele/view.js',
  './src/module/ziele/karte.js',
  './src/module/ziele/bereich.js',
  './src/module/ziele/ziel.js',
  './src/module/affirmationen/index.js',
  './src/module/affirmationen/data.js',
  './src/module/affirmationen/view.js',
  './src/module/affirmationen/bearbeiten.js',
  './src/module/gewohnheiten/index.js',
  './src/module/gewohnheiten/data.js',
  './src/module/gewohnheiten/view.js',
  './src/module/gewohnheiten/karte-auf.js',
  './src/module/gewohnheiten/karte-ab.js',
  './src/module/gewohnheiten/bearbeiten.js',
  './src/module/gewohnheiten/rueckfall.js',
  './src/module/wissen/index.js',
  './src/module/wissen/data.js',
  './src/module/wissen/view.js',
  './src/module/wissen/runde.js',
  './src/module/wissen/import.js',
  './src/module/wissen/fragen/allgemein.json',
  './src/module/wissen/fragen/geschichte.json',
  './src/module/wissen/fragen/geografie.json',
  './src/module/wissen/fragen/natur.json',
  './src/module/wissen/fragen/anatomie.json',
  './src/module/wissen/fragen/physio.json',
  './src/module/wissen/fragen/muskeln.json',
  './src/module/training/index.js',
  './src/module/training/daten.js',
  './src/module/training/rechnen.js',
  './src/module/training/view.js',
  './src/module/training/liste.js',
  './src/module/training/einheit.js',
  './src/module/training/saetze.js',
  './src/module/training/wahl.js',
  './src/module/training/uebung.js',
  './src/module/training/plan-daten.js',
  './src/module/training/plaene.js',
  './src/module/training/plan.js',
  './src/module/training/plan-einheit.js',
  './src/module/training/durchlauf.js',
  './src/module/heute/training.js',
  './src/styles/training.css',
  './src/styles/ziele.css',
  './src/module/physio/index.js',
  './src/module/physio/view.js',
  './src/module/physio/daten.js',
  './src/module/physio/arten.js',
  './src/module/physio/overlay.js',
  './src/module/physio/suche.js',
  './src/module/physio/anlegen.js',
  './src/module/physio/mindmap-inhalt.js',
  './src/module/physio/fokus.js',
  './src/module/physio/fokus-layout.js',
  './src/module/physio/knoten.js',
  './src/module/physio/gleiten.js',
  './src/module/physio/mm-verlauf.js',
  './src/module/physio/verknuepfen.js',
  './src/module/physio/eintrag.js',
  './src/module/physio/textfeld.js',
  './src/module/physio/bilder.js',
  './src/module/physio/bild-verkleinern.js',
  './src/module/physio/galerie.js',
  './src/module/physio/bild-gross.js',
  './src/styles/physio-bilder.css',
  './src/styles/physio-baelle.css',
  './src/core/dateien.js',
  './src/styles/physio-eintrag.css',
  './src/styles/physio-karte.css',
  './src/styles/physio.css',
  './src/core/router.js',
  './src/app/abgleich-kachel.js',
  './src/app/kopfbilder.js',
  './src/styles/tokens.css',
  './src/styles/base.css',
  './src/styles/components.css',
  './src/styles/checkbox.css',
  './src/styles/modal.css',
  './src/styles/app.css',
  './src/styles/nav.css',
  './src/styles/heute.css',
  './src/styles/heute-karten.css',
  './src/styles/todos.css',
  './src/styles/kalender.css',
  './src/styles/routinen.css',
  './src/styles/gewohnheiten.css',
  './src/styles/wissen.css',
  './src/styles/kopfbild.css',
  './src/styles/kachel.css',
  './src/styles/farbkreise.css',
  './src/styles/schrift.css',
  './src/ui/dom.js',
  './src/ui/card.js',
  './src/ui/list.js',
  './src/ui/checkbox.js',
  './src/ui/button.js',
  './src/ui/input.js',
  './src/ui/modal.js',
  './src/ui/tabs.js',
  './src/ui/symbol.js',
  './src/ui/kopfbild.js',
  './src/ui/kachel.js',
  './src/ui/chips.js',
  './src/core/sprueche.js',
  './assets/bilder/heute-1.webp',
  './assets/bilder/heute-2.webp',
  './assets/bilder/heute-3.webp',
  './assets/bilder/todos-1.webp',
  './assets/bilder/todos-2.webp',
  './assets/bilder/todos-3.webp',
  './assets/bilder/einstellungen-1.webp',
  './assets/bilder/einstellungen-2.webp',
  './assets/bilder/einstellungen-3.webp',
  './bausteine.html',
  './src/bausteine.js',
  './src/bausteine-neu.js',
  './assets/icons/icon.svg',
  './assets/icons/icon-180.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  // Supabase-Bibliothek vom CDN (feste Version, muss zu src/core/supabase.js passen)
  LIB,
];

self.addEventListener('install', (event) => {
  // cache: 'reload' = immer frisch vom Server holen, nie aus dem Browser-Zwischenspeicher
  // (GitHub Pages erlaubt dort 10 Minuten, sonst landen alte Dateien im neuen Cache).
  const requests = APP_FILES.map((url) => new Request(url, { cache: 'reload' }));
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(requests)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const own = url.origin === self.location.origin;
  // Nur eigene Dateien und die Supabase-Bibliothek, nur GET.
  // Alles andere (Supabase-Daten, Login) geht direkt ins Netz und wird nie gecacht.
  if (event.request.method !== 'GET' || !(own || url.href === LIB)) return;

  if (DEV && own) {
    // no-cache: beim Server nachfragen statt alte Dateien aus dem Browser-Zwischenspeicher zu nehmen.
    // Neue Anfrage nur aus der Adresse bauen: Chrome lehnt fetch(Seitenaufruf, { cache }) ab,
    // dann käme die Seite nur noch aus dem Cache (alt) oder gar nicht.
    const frisch = new Request(event.request.url, { cache: 'no-cache', credentials: 'same-origin' });
    event.respondWith(
      fetch(frisch)
        .catch(() => caches.match(event.request))
        .then((antwort) => antwort || Response.error())
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((hit) => hit || fetch(event.request))
  );
});
