// Verbindung zu Supabase.
// Die Bibliothek kommt als eine einzige Datei vom CDN (feste Version).
// Der Service Worker hält sie offline bereit. Sie wird erst geladen, wenn sie gebraucht wird,
// damit die App auch ohne Netz sofort startet.
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './config.js';

export const SUPABASE_LIB = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/dist/umd/supabase.js';

// Unter diesem Schlüssel merkt sich Supabase die Anmeldung im Gerät (localStorage).
export const AUTH_STORAGE_KEY = 'system0-auth';

let clientPromise = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Supabase-Bibliothek konnte nicht geladen werden'));
    document.head.append(script);
  });
}

// Liefert die Verbindung (wird nur einmal aufgebaut).
export function getSupabase() {
  if (!clientPromise) {
    clientPromise = loadScript(SUPABASE_LIB)
      .then(() =>
        window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          auth: {
            storageKey: AUTH_STORAGE_KEY,
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false,
          },
        })
      )
      .catch((err) => {
        clientPromise = null; // beim nächsten Mal neu versuchen
        throw err;
      });
  }
  return clientPromise;
}
