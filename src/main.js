// Startpunkt der App: Service Worker anmelden, je nach Login die passende Ansicht zeigen.
import { isLoggedIn, onAuthChange, watchSession } from './core/auth.js';
import { loginView } from './app/login.js';
import { startView } from './app/start.js';

const app = document.getElementById('app');

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
  app.replaceChildren(loggedIn ? startView() : loginView());
}

onAuthChange(render);
render(isLoggedIn());
registerServiceWorker();

// Online: Supabase prüft im Hintergrund, ob die Sitzung noch gültig ist.
if (navigator.onLine) watchSession().catch((err) => console.warn(err.message));
