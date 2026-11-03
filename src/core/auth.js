// Anmelden, abmelden, Anmeldung merken.
// „Angemeldet“ heißt: Im Gerät liegt eine gespeicherte Sitzung. Das funktioniert auch offline.
// Supabase löscht sie selbst, wenn sie ungültig wird (z. B. Passwort geändert) –
// nicht aber bei fehlendem Netz.
import { getSupabase, AUTH_STORAGE_KEY } from './supabase.js';

const listeners = new Set();

export function isLoggedIn() {
  try {
    return Boolean(localStorage.getItem(AUTH_STORAGE_KEY));
  } catch {
    return false;
  }
}

// cb(angemeldet: boolean) wird bei jeder Änderung aufgerufen.
export function onAuthChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notify() {
  const state = isLoggedIn();
  listeners.forEach((cb) => cb(state));
}

// Supabase meldet z. B. eine abgelaufene, ungültige Sitzung. Nur bei Online-Start nötig.
export async function watchSession() {
  const supabase = await getSupabase();
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') notify();
  });
}

export async function signIn(email, password) {
  const supabase = await getSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(errorText(error));
  notify();
}

export async function signOut() {
  try {
    const supabase = await getSupabase();
    // scope 'local': nur dieses Gerät abmelden, andere Geräte bleiben angemeldet.
    await supabase.auth.signOut({ scope: 'local' });
  } finally {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    notify();
  }
}

export async function getUser() {
  const supabase = await getSupabase();
  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
}

function errorText(error) {
  if (!navigator.onLine) return 'Keine Verbindung. Anmelden geht nur mit Internet.';
  if (error.code === 'invalid_credentials') return 'E-Mail oder Passwort stimmt nicht.';
  if (error.status === 429) return 'Zu viele Versuche. Bitte kurz warten.';
  return 'Anmelden hat nicht geklappt. Bitte nochmal versuchen.';
}
