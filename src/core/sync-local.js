// Lokale Seite des Abgleichs: Warteschlange lesen, Server-Daten einmischen, Merkzettel (meta).
// Nur für sync.js gedacht – Module benutzen store.js.
import { transaction, done } from './db.js';
import { emit } from './events.js';

const time = (iso) => (iso ? Date.parse(iso) : 0);
const iso = (value) => (value ? new Date(value).toISOString() : value);

// Einträge, die noch hochgeladen werden müssen, nach Tabelle: { tabelle: [zeilen] }
export async function pendingRows() {
  return transaction(['warteschlange', 'daten'], 'readonly', async (s) => {
    const queue = await done(s.warteschlange.getAll());
    const out = {};
    for (const { table, id } of queue) {
      const entry = await done(s.daten.get([table, id]));
      if (entry) (out[table] ||= []).push(entry.row);
    }
    return out;
  });
}

// Nach dem Hochladen: aus der Warteschlange nehmen –
// aber nur, wenn der Eintrag seitdem nicht schon wieder geändert wurde.
export async function markUploaded(table, rows) {
  await transaction(['warteschlange', 'daten'], 'readwrite', async (s) => {
    for (const row of rows) {
      const entry = await done(s.daten.get([table, row.id]));
      if (!entry || entry.row.updated_at === row.updated_at) s.warteschlange.delete([table, row.id]);
    }
  });
}

// Server-Daten übernehmen, wenn sie neuer sind als die lokalen (gleich alt = schon bekannt).
export async function mergeFromServer(table, rows) {
  if (!rows.length) return;
  const changed = await transaction(['daten', 'warteschlange'], 'readwrite', async (s) => {
    let count = 0;
    for (const raw of rows) {
      const row = { ...raw, created_at: iso(raw.created_at), updated_at: iso(raw.updated_at) };
      const entry = await done(s.daten.get([table, row.id]));
      if (entry && time(entry.row.updated_at) >= time(row.updated_at)) continue; // lokal gleich oder neuer
      s.daten.put({ table, id: row.id, row });
      s.warteschlange.delete([table, row.id]);
      count++;
    }
    return count;
  });
  if (changed) emit('daten', { table, source: 'server' });
}

export async function getMeta(key) {
  const entry = await transaction(['meta'], 'readonly', ({ meta }) => done(meta.get(key)));
  return entry ? entry.value : null;
}

export async function setMeta(key, value) {
  await transaction(['meta'], 'readwrite', ({ meta }) => meta.put({ key, value }));
}
