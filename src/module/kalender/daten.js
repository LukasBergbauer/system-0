// Daten des Kalenders: Lesen und Schreiben nur über core/store.js.
// Tabelle termine (titel, start, ende, ganztaegig, ort, notiz, wiederholung = RRULE), start/ende als ISO-Text.
import { getAll, save, remove } from '../../core/store.js';
import { aufklappen } from '../../core/wiederholung.js';

export const TERMINE = 'termine';

// Wiederholte Termine kommen als einzelne Vorkommen (core/wiederholung.js).
export const ladeTermine = async () => aufklappen(await getAll(TERMINE));

// Neu (ohne id) oder ändern (mit id).
export const speichereTermin = (felder) => save(TERMINE, felder);

export const loescheTermin = (id) => remove(TERMINE, id);

// Offene To-dos mit Fälligkeit als ganztägige Einträge (nur lesen; antippen öffnet sie in To-dos).
// Überfällige stehen bei heute. Gelesen über core/store.js, wie die Heute-Übersicht.
export async function faelligeTodos() {
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  return (await getAll('todos'))
    .filter((t) => t.faellig_am && !t.erledigt_am)
    .map((t) => {
      const [j, m, d] = t.faellig_am.split('-').map(Number);
      const tag = new Date(Math.max(+new Date(j, m - 1, d), +heute));
      return { id: t.id, titel: t.titel, todo: true, ganztaegig: true, start: tag.toISOString(),
        ende: new Date(tag.getFullYear(), tag.getMonth(), tag.getDate() + 1).toISOString() };
    });
}
