// Wiederherstellen aus einer Export-Datei (export.js): lesen, Vorschau, einspielen.
// Nichts wird gelöscht. Gleiche id = überschreiben. updated_at = jetzt, damit der Abgleich die Zeilen hochlädt
// und sie auf allen Geräten gewinnen.
import { transaction } from './db.js';
import { emit } from './events.js';
import { TABLES } from './tabellen.js';

// Datei lesen → { tabellen: { name: [zeilen] }, anzahl: { name: n }, exportiert_am } oder Fehler.
export async function exportLesen(file) {
  let data;
  try {
    data = JSON.parse(await file.text());
  } catch {
    throw new Error('Die Datei ist kein gültiges JSON.');
  }
  if (data?.app !== 'System 0' || typeof data.tabellen !== 'object') {
    throw new Error('Das ist keine Export-Datei von System 0.');
  }
  const tabellen = {};
  for (const name of TABLES) {
    const rows = (data.tabellen[name] || []).filter((r) => r && typeof r.id === 'string');
    if (rows.length) tabellen[name] = rows;
  }
  const anzahl = Object.fromEntries(Object.entries(tabellen).map(([t, r]) => [t, r.length]));
  return { tabellen, anzahl, exportiert_am: data.exportiert_am };
}

// Alle Zeilen lokal speichern und in die Warteschlange legen (eine Transaktion).
export async function einspielen(tabellen) {
  const zeit = new Date().toISOString();
  await transaction(['daten', 'warteschlange'], 'readwrite', (s) => {
    for (const [table, rows] of Object.entries(tabellen)) {
      for (const r of rows) {
        const row = { ...r, updated_at: zeit, created_at: r.created_at || zeit, deleted: !!r.deleted };
        s.daten.put({ table, id: row.id, row });
        s.warteschlange.put({ table, id: row.id });
      }
    }
  });
  for (const table of Object.keys(tabellen)) emit('daten', { table });
}
