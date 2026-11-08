// Daten des Kalenders: Lesen und Schreiben nur über core/store.js.
// Tabelle termine (titel, start, ende, ganztaegig, ort, notiz), start/ende als ISO-Text.
import { getAll, save, remove } from '../../core/store.js';

export const TERMINE = 'termine';

export const ladeTermine = () => getAll(TERMINE);

// Neu (ohne id) oder ändern (mit id).
export const speichereTermin = (felder) => save(TERMINE, felder);

export const loescheTermin = (id) => remove(TERMINE, id);
