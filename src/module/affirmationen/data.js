// Daten der Affirmationen: nur über core/store.js. affirmationen (lebensziel_id, text, aktiv, reihenfolge).
// Liest Ziele und Bereiche (Modul „Ziele“) nur als Rohdaten, schreibt dort nichts.
import { getAll, save, remove } from '../../core/store.js';

export const TABELLE = 'affirmationen';
export const TABELLEN = [TABELLE, 'lebensziele', 'ziel_bereiche'];

const RANG = { aktiv: 0, pausiert: 1, erreicht: 2 };

// Ziele (aktive zuerst), je mit bereich (name, vision) und affirmationen. Erreichte nur, wenn sie Affirmationen haben.
export async function ladeAlles() {
  const [affs, ziele, bereiche] = await Promise.all([getAll(TABELLE), getAll('lebensziele'), getAll('ziel_bereiche')]);
  return ziele
    .map((z) => ({
      ...z,
      bereich: bereiche.find((b) => b.id === z.bereich_id),
      affirmationen: affs.filter((a) => a.lebensziel_id === z.id).sort((a, b) => a.reihenfolge - b.reihenfolge),
    }))
    .filter((z) => z.status !== 'erreicht' || z.affirmationen.length)
    .sort((a, b) => RANG[a.status] - RANG[b.status] || a.reihenfolge - b.reihenfolge);
}

export const speichere = (felder) => save(TABELLE, felder.id ? felder : { aktiv: true, reihenfolge: Date.now(), ...felder });
export const loesche = (a) => remove(TABELLE, a.id);

// Vorlage aus Ziel und Warum, ohne KI; Lukas passt sie an.
export function vorschlag(z) {
  const titel = (z.titel || 'mein Ziel').trim();
  const warum = (z.warum || '').trim().replace(/[.!]+$/, '');
  if (!warum) return `Ich gehe jeden Tag einen Schritt auf „${titel}“ zu.`;
  return `Ich gehe jeden Tag einen Schritt auf „${titel}“ zu, weil ${warum.charAt(0).toLocaleLowerCase('de') + warum.slice(1)}.`;
}
