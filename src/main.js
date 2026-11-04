// Startpunkt der App: Service Worker anmelden, Router starten,
// je nach Login den Login oder den Rahmen der App (Navigation + Bereiche) zeigen.
import { isLoggedIn, onAuthChange, watchSession } from './core/auth.js';
import { startRouter } from './core/router.js';
import { startSync } from './core/sync.js';
import { loginView } from './app/login.js';
import { shell } from './app/shell.js';
import './app/bereiche.js';

const app = document.getElementById('app');
let aufraeumen = null;

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  // Neue App-Fassung aktiv → einmal neu laden, damit sie sofort zu sehen ist.
  // Nicht beim allerersten Start (da gab es vorher keinen Service Worker).
  const hadController = Boolean(navigator.serviceWorker.controller);
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloaded) return;
    reloaded = true;
    location.reload();
  });
  navigator.serviceWorker.register('./sw.js').catch((err) => {
    console.warn('Service Worker konnte nicht starten:', err);
  });
}

function render(loggedIn) {
  aufraeumen?.();
  aufraeumen = null;
  if (!loggedIn) {
    app.replaceChildren(loginView());
    return;
  }
  const rahmen = shell();
  aufraeumen = rahmen.destroy;
  app.replaceChildren(rahmen.element);
  startSync();
}

startRouter();
onAuthChange(render);
render(isLoggedIn());
registerServiceWorker();

// Online: Supabase prüft im Hintergrund, ob die Sitzung noch gültig ist.
if (navigator.onLine) watchSession().catch((err) => console.warn(err.message));
