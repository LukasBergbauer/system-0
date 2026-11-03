// Startpunkt der App.
// Jetzt: Service Worker anmelden und „System 0“ zeigen.
// Später: Login prüfen, Router starten.

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('./sw.js').catch((err) => {
    console.warn('Service Worker konnte nicht starten:', err);
  });
}

function showStart() {
  const app = document.getElementById('app');
  app.innerHTML = '<h1 class="start">System 0</h1>';
}

showStart();
registerServiceWorker();
