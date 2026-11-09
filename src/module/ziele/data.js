// Daten der Lebensziele: nur über core/store.js.
// ziel_bereiche (name, vision, reihenfolge), lebensziele (bereich_id, titel, warum, zieldatum, status, reihenfolge),
// ziel_schritte (ziel_id, text, erledigt_am, reihenfolge).
import { getAll, save, remove } from '../../core/store.js';

export const BEREICHE = 'ziel_bereiche';
export const ZIELE = 'lebensziele';
export const SCHRITTE = 'ziel_schritte';
export const TABELLEN = [BEREICHE, ZIELE, SCHRITTE];

export const STATUS = [
  { id: 'aktiv', label: 'Aktiv' },
  { id: 'pausiert', label: 'Pausiert' },
  { id: 'erreicht', label: 'Erreicht' },
];

const nachReihe = (a, b) => a.reihenfolge - b.reihenfolge;

// Bereiche sortiert, je mit ziele (sortiert, je mit schritte).
export async function ladeAlles() {
  const [bereiche, ziele, schritte] = await Promise.all([getAll(BEREICHE), getAll(ZIELE), getAll(SCHRITTE)]);
  const mitSchritten = ziele.sort(nachReihe).map((z) => ({
    ...z, schritte: schritte.filter((s) => s.ziel_id === z.id).sort(nachReihe),
  }));
  return bereiche.sort(nachReihe).map((b) => ({ ...b, ziele: mitSchritten.filter((z) => z.bereich_id === b.id) }));
}

export const fortschritt = (z) => (z.schritte.length ? z.schritte.filter((s) => s.erledigt_am).length / z.schritte.length : 0);

export const speichereBereich = (felder) => save(BEREICHE, felder.id ? felder : { reihenfolge: Date.now(), ...felder });
export const speichereZiel = (felder) => save(ZIELE, felder);
export const neuesZiel = (bereich_id, titel) => save(ZIELE, { bereich_id, titel, status: 'aktiv', reihenfolge: Date.now() });
export const neuerSchritt = (ziel_id, text) => save(SCHRITTE, { ziel_id, text, erledigt_am: null, reihenfolge: Date.now() });
export const hakeSchritt = (s, an) => save(SCHRITTE, { id: s.id, erledigt_am: an ? new Date().toISOString() : null });
export const loescheSchritt = (s) => remove(SCHRITTE, s.id);

export async function loescheZiel(z) {
  for (const s of z.schritte) await remove(SCHRITTE, s.id);
  await remove(ZIELE, z.id);
}

export async function loescheBereich(b) {
  for (const z of b.ziele) await loescheZiel(z);
  await remove(BEREICHE, b.id);
}
