// Service Worker: hält die App-Dateien offline bereit.
// Bei jeder Änderung an App-Dateien VERSION hochzählen,
// damit Geräte die neue Fassung laden.
// Supabase-Anfragen (Daten, Login) werden nie gecacht.

const VERSION = 'v4';
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
  './src/app/login.js',
  './src/app/start.js',
  './src/styles/tokens.css',
  './src/styles/base.css',
  './src/styles/components.css',
  './src/styles/checkbox.css',
  './src/styles/modal.css',
  './src/styles/app.css',
  './src/ui/dom.js',
  './src/ui/card.js',
  './src/ui/list.js',
  './src/ui/checkbox.js',
  './src/ui/button.js',
  './src/ui/input.js',
  './src/ui/modal.js',
  './src/ui/tabs.js',
  './bausteine.html',
  './src/bausteine.js',
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
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }
  event.respondWith(
    caches.match(event.request).then((hit) => hit || fetch(event.request))
  );
});
