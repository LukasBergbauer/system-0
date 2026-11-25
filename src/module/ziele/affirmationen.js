// Daten der Affirmationen (gehören zu einem Schritt): affirmationen (lebensziel_id, text, aktiv, reihenfolge). Nur über core/store.js.
import { save, remove } from '../../core/store.js';

export const AFFIRMATIONEN = 'affirmationen';

export const speichereAff = (felder) => save(AFFIRMATIONEN, felder.id ? felder : { aktiv: true, reihenfolge: Date.now(), ...felder });
export const loescheAff = (a) => remove(AFFIRMATIONEN, a.id);

// Vorlage aus Ziel und Warum, ohne KI; Lukas passt sie an.
export function vorschlag(z) {
  const titel = (z.titel || 'mein Schritt').trim();
  const warum = (z.warum || '').trim().replace(/[.!]+$/, '').replace(/^weil\s+/i, ''); // „Weil …“ nicht doppelt
  if (!warum) return `Ich gehe jeden Tag einen Schritt auf „${titel}“ zu.`;
  return `Ich gehe jeden Tag einen Schritt auf „${titel}“ zu, weil ${warum.charAt(0).toLocaleLowerCase('de') + warum.slice(1)}.`;
}
