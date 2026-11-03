// Abgleich lokal ↔ Supabase.
// Ablauf: erst Neues vom Server holen, dann die Warteschlange hochladen.
// Wann: beim Start, wenn das Netz zurückkommt, wenn die App wieder sichtbar wird,
// kurz nach jeder Änderung und jede Minute.
// Status als Ereignis 'sync': { state: 'neu' | 'läuft' | 'ok' | 'offline' | 'fehler', at, pending }
import { getSupabase } from './supabase.js';
import { isLoggedIn } from './auth.js';
import { emit, on } from './events.js';
import { TABLES } from './tabellen.js';
import { pendingRows, markUploaded, mergeFromServer, getMeta, setMeta } from './sync-local.js';

const PAGE = 1000;
const OVERLAP_MS = 60 * 1000; // etwas Überlappung, damit nichts durchrutscht
const LOCAL_ONLY = ['user_id', 'server_at']; // setzt der Server selbst

let running = null;
let again = false;
let timer = null;
let lastStatus = { state: 'neu', at: null, pending: 0 };

export function syncStatus() {
  return lastStatus;
}

function status(state, extra = {}) {
  lastStatus = { ...lastStatus, state, ...extra };
  emit('sync', lastStatus);
}

async function pull(supabase, table) {
  const key = `abgleich:${table}`;
  let since = await getMeta(key);
  for (;;) {
    let query = supabase.from(table).select('*').order('server_at').limit(PAGE);
    if (since) query = query.gt('server_at', new Date(Date.parse(since) - OVERLAP_MS).toISOString());
    const { data, error } = await query;
    if (error) throw error;
    await mergeFromServer(table, data);
    if (data.length) {
      since = data[data.length - 1].server_at;
      await setMeta(key, since);
    }
    if (data.length < PAGE) return;
  }
}

async function push(supabase) {
  const pending = await pendingRows();
  for (const [table, rows] of Object.entries(pending)) {
    for (let i = 0; i < rows.length; i += 500) {
      const part = rows.slice(i, i + 500);
      const payload = part.map((row) => {
        const copy = { ...row };
        LOCAL_ONLY.forEach((k) => delete copy[k]);
        return copy;
      });
      const { error } = await supabase.from(table).upsert(payload, { onConflict: 'id' });
      if (error) throw error;
      await markUploaded(table, part);
    }
  }
}

async function countPending() {
  const pending = await pendingRows();
  return Object.values(pending).reduce((n, rows) => n + rows.length, 0);
}

async function run() {
  if (!isLoggedIn()) return;
  if (!navigator.onLine) return status('offline', { pending: await countPending() });
  status('läuft');
  try {
    const supabase = await getSupabase();
    for (const table of TABLES) await pull(supabase, table);
    await push(supabase);
    status('ok', { at: new Date().toISOString(), pending: await countPending() });
  } catch (err) {
    console.warn('Abgleich fehlgeschlagen:', err);
    status(navigator.onLine ? 'fehler' : 'offline', { pending: await countPending() });
  }
}

// Startet einen Abgleich. Läuft schon einer, folgt direkt danach ein weiterer.
export function syncNow() {
  if (running) {
    again = true;
    return running;
  }
  running = run().finally(() => {
    running = null;
    if (again) {
      again = false;
      syncNow();
    }
  });
  return running;
}

let started = false;

export function startSync() {
  if (started) return syncNow();
  started = true;
  window.addEventListener('online', () => syncNow());
  window.addEventListener('offline', () => syncNow());
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') syncNow();
  });
  on('daten', ({ source }) => {
    if (source === 'server') return; // kam gerade vom Server, nichts hochzuladen
    clearTimeout(timer);
    timer = setTimeout(syncNow, 1000);
  });
  setInterval(syncNow, 60 * 1000);
  return syncNow();
}
