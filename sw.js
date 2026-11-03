// Service Worker: hält die App-Dateien offline bereit.
// Bei jeder Änderung an App-Dateien VERSION hochzählen,
// damit Geräte die neue Fassung laden.
// Supabase-Anfragen (Daten, Login) werden nie gecacht.

const VERSION = 'v2';
const CACHE = `system0-${VERSION}`;

const APP_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './src/main.js',
  './src/core/config.js',
  './src/styles/tokens.css',
  './src/styles/base.css',
  './src/styles/components.css',
  './src/styles/checkbox.css',
  './src/styles/modal.css',
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
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_FILES)));
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
  // Nur eigene Dateien, nur GET. Alles andere (z. B. Supabase) geht direkt ins Netz.
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((hit) => hit || fetch(event.request))
  );
});
