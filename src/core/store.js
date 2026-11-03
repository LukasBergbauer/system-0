// Lesen und Schreiben lokal (IndexedDB). Module benutzen nur diese Funktionen.
// Jede Änderung landet zuerst hier und dann in der Warteschlange für den Abgleich (sync.js).
// Automatisch gesetzt: id (neu), created_at (neu), updated_at (immer), deleted (weich löschen).
// Nach jeder Änderung: Ereignis 'daten' mit { table } (siehe events.js).
import { transaction, done } from './db.js';
import { emit } from './events.js';

const now = () => new Date().toISOString();

// Alle Einträge einer Tabelle (gelöschte nur auf Wunsch).
export async function getAll(table, { withDeleted = false } = {}) {
  const entries = await transaction(['daten'], 'readonly', ({ daten }) =>
    done(daten.index('table').getAll(table))
  );
  const rows = entries.map((e) => e.row);
  return withDeleted ? rows : rows.filter((r) => !r.deleted);
}

// Ein Eintrag oder null (auch null, wenn gelöscht).
export async function get(table, id) {
  const entry = await transaction(['daten'], 'readonly', ({ daten }) => done(daten.get([table, id])));
  return entry && !entry.row.deleted ? entry.row : null;
}

// Neu anlegen (ohne id) oder ändern (mit id). Gibt den gespeicherten Eintrag zurück.
export async function save(table, data) {
  const row = await transaction(['daten', 'warteschlange'], 'readwrite', async (s) => {
    const id = data.id || crypto.randomUUID();
    const old = await done(s.daten.get([table, id]));
    const time = now();
    const next = {
      ...(old ? old.row : {}),
      ...data,
      id,
      created_at: old?.row.created_at || data.created_at || time,
      updated_at: time,
      deleted: data.deleted ?? old?.row.deleted ?? false,
    };
    s.daten.put({ table, id, row: next });
    s.warteschlange.put({ table, id });
    return next;
  });
  emit('daten', { table });
  return row;
}

// Weich löschen: Eintrag bleibt mit deleted = true, damit die Löschung auf alle Geräte kommt.
export async function remove(table, id) {
  const exists = await transaction(['daten'], 'readonly', ({ daten }) => done(daten.get([table, id])));
  if (!exists) return;
  await save(table, { id, deleted: true });
}

// Alle Daten aller Tabellen, z. B. für den Export: { tabelle: [einträge] }
export async function dumpAll() {
  const entries = await transaction(['daten'], 'readonly', ({ daten }) => done(daten.getAll()));
  const out = {};
  for (const { table, row } of entries) (out[table] ||= []).push(row);
  return out;
}
