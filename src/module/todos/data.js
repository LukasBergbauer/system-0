// Daten der To-dos: Lesen und Schreiben nur über core/store.js.
// Tabelle todos (titel, notiz, faellig_am, erledigt_am). Spalten prio und bereich_id bleiben in der DB, werden nicht mehr genutzt.
import { getAll, save, remove } from '../../core/store.js';
import { heuteISO } from './sortierung.js';

export const TODOS = 'todos';
export const HEUTE_MAX = 3; // Fokus: höchstens 3 To-dos für heute

export function ladeTodos() {
  return getAll(TODOS);
}

// Sind für heute schon HEUTE_MAX offene To-dos geplant? ohneId = das gerade bearbeitete nicht mitzählen.
export async function heuteVoll(ohneId = null) {
  const h = heuteISO();
  return (await ladeTodos()).filter((t) => !t.deleted && !t.erledigt_am && t.faellig_am === h && t.id !== ohneId).length >= HEUTE_MAX;
}

export function neuesTodo(titel, faellig_am = null) {
  return save(TODOS, { titel, notiz: '', prio: 2, faellig_am, erledigt_am: null }); // prio: Pflichtspalte in der DB
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

// Rückgängig nach Wisch-Löschen
export function holeZurueck(id) {
  return save(TODOS, { id, deleted: false });
}
