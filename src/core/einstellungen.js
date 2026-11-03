// Einstellungen: einfache Schlüssel/Wert-Paare, synchronisiert über die Tabelle „einstellungen“.
import { getAll, save } from './store.js';

const TABLE = 'einstellungen';

// Falls es (nach Offline-Arbeit auf zwei Geräten) einen Schlüssel doppelt gibt: der neueste zählt.
async function find(key) {
  const rows = (await getAll(TABLE)).filter((r) => r.schluessel === key);
  rows.sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at));
  return rows[0] || null;
}

export async function getSetting(key, fallback = null) {
  const row = await find(key);
  return row ? row.wert : fallback;
}

export async function setSetting(key, value) {
  const row = await find(key);
  return save(TABLE, { ...(row ? { id: row.id } : {}), schluessel: key, wert: value });
}
