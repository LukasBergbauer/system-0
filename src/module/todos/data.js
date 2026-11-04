// Daten der To-dos: Lesen und Schreiben nur über core/store.js.
// Tabellen: todos (titel, notiz, prio 1–3, faellig_am, bereich_id, erledigt_am)
//           todo_bereiche (name, reihenfolge)
import { getAll, save, remove } from '../../core/store.js';

export const TODOS = 'todos';
export const BEREICHE = 'todo_bereiche';

export const PRIOS = [
  { id: 1, label: 'Hoch' },
  { id: 2, label: 'Mittel' },
  { id: 3, label: 'Niedrig' },
];

export function ladeTodos() {
  return getAll(TODOS);
}

// Bereiche in ihrer Reihenfolge (bei Gleichstand nach Name).
export async function ladeBereiche() {
  const rows = await getAll(BEREICHE);
  return rows.sort((a, b) => a.reihenfolge - b.reihenfolge || a.name.localeCompare(b.name, 'de'));
}

// Schnelleingabe: nur Titel, Priorität mittel, ohne Datum und Bereich.
export function neuesTodo(titel) {
  return save(TODOS, { titel, notiz: '', prio: 2, faellig_am: null, bereich_id: null, erledigt_am: null });
}

// Ändert nur die übergebenen Felder (id muss dabei sein).
export function aendereTodo(felder) {
  return save(TODOS, felder);
}

export function setzeErledigt(id, erledigt) {
  return save(TODOS, { id, erledigt_am: erledigt ? new Date().toISOString() : null });
}

export function loescheTodo(id) {
  return remove(TODOS, id);
}

// ---------- Bereiche ----------

// Neuer Bereich kommt ans Ende.
export async function neuerBereich(name) {
  const alle = await ladeBereiche();
  const letzte = alle.reduce((max, b) => Math.max(max, b.reihenfolge), 0);
  return save(BEREICHE, { name, reihenfolge: letzte + 1 });
}

export function benenneBereich(id, name) {
  return save(BEREICHE, { id, name });
}

// Bereich weich löschen; seine To-dos (auch erledigte) werden „ohne Bereich“.
export async function loescheBereich(id) {
  const betroffen = (await ladeTodos()).filter((t) => t.bereich_id === id);
  for (const t of betroffen) await save(TODOS, { id: t.id, bereich_id: null });
  await remove(BEREICHE, id);
}
