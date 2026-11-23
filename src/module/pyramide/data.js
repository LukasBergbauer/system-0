// Daten der Pyramiden: nur über core/store.js. pyramiden (titel, art, tag, ebenen[0 = unten], reihenfolge).
import { getAll, save, remove } from '../../core/store.js';

export const TABELLE = 'pyramiden';

// Dauerhafte zuerst, dann Tages-Pyramiden: neueste Tage zuerst.
export async function ladeAlle() {
  const liste = (await getAll(TABELLE)).map((p) => ({ ...p, ebenen: p.ebenen || [] }));
  return liste.sort((a, b) => (a.art === 'dauerhaft') !== (b.art === 'dauerhaft')
    ? (a.art === 'dauerhaft' ? -1 : 1)
    : (b.tag || '').localeCompare(a.tag || '') || a.reihenfolge - b.reihenfolge);
}

export const speichere = (felder) => save(TABELLE, felder.id ? felder : { reihenfolge: Date.now(), ...felder });
export const loesche = (p) => remove(TABELLE, p.id);

export function morgenDatum() {
  const d = new Date(Date.now() + 864e5);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function datumKurz(tag) {
  if (!tag) return '';
  return new Date(`${tag}T12:00:00`).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'numeric' });
}

export const name = (p) => p.titel || (p.art === 'dauerhaft' ? 'Dauerhaft' : datumKurz(p.tag) || 'Tag');
