// Daten der Bücher: Zeilen über core/store.js, Cover-Dateien über core/dateien.js (Ordner „buch-cover“).
// buecher (titel, autor, status, cover, begonnen, beendet, bewertung, zusammenfassung, reihenfolge, seite, seiten),
// buch_notizen (buch_id, art zusammenfassung|absatz, seite, text).
import { getAll, get, save, remove } from '../../core/store.js';
import { speichereDatei, loescheDatei, dateiUrl } from '../../core/dateien.js';
import { getUser } from '../../core/auth.js';

export const BUECHER = 'buecher';
export const NOTIZEN = 'buch_notizen';
const ORDNER = 'buch-cover';

export const STATUS = [
  { id: 'lese', label: 'Lese gerade' },
  { id: 'will', label: 'Will lesen' },
  { id: 'gelesen', label: 'Gelesen' },
];

// Lese gerade/Will lesen: eigene Reihenfolge; Gelesen: zuletzt beendet zuerst.
export async function ladeBuecher(status) {
  const alle = (await getAll(BUECHER)).filter((b) => !status || b.status === status);
  return status === 'gelesen'
    ? alle.sort((a, b) => (b.beendet || '').localeCompare(a.beendet || '') || b.updated_at.localeCompare(a.updated_at))
    : alle.sort((a, b) => a.reihenfolge - b.reihenfolge);
}

export const ladeBuch = (id) => get(BUECHER, id);
export function neuesBuch(status) {
  const heute = new Date().toLocaleDateString('sv');
  return save(BUECHER, { titel: '', status, reihenfolge: Date.now(), begonnen: status === 'lese' ? heute : null, beendet: status === 'gelesen' ? heute : null });
}

// Status wechseln trägt Begonnen/Beendet ein, falls noch leer.
export function speichereBuch(buch, felder) {
  const heute = new Date().toLocaleDateString('sv');
  const extra = {};
  if (felder.status === 'lese' && !buch.begonnen) extra.begonnen = heute;
  if (felder.status === 'gelesen' && !buch.beendet) extra.beendet = heute;
  return save(BUECHER, { id: buch.id, ...extra, ...felder });
}

const pfad = async (name) => {
  const u = await getUser();
  if (!u) throw new Error('Nicht angemeldet');
  return `${ORDNER}/${u.id}/${name}`;
};

export const coverUrl = async (buch) => (buch.cover ? dateiUrl(await pfad(buch.cover)) : null);

// Neues Cover (Blob, schon verkleinert): neuer Dateiname, altes wird weggeräumt.
export async function setzeCover(buch, blob) {
  const name = `${buch.id}-${Date.now()}.jpg`;
  await speichereDatei(await pfad(name), blob);
  if (buch.cover) await loescheDatei(await pfad(buch.cover));
  return save(BUECHER, { id: buch.id, cover: name });
}

export async function entferneCover(buch) {
  if (buch.cover) await loescheDatei(await pfad(buch.cover));
  return save(BUECHER, { id: buch.id, cover: null });
}

export async function loescheBuch(buch) {
  if (buch.cover) await loescheDatei(await pfad(buch.cover));
  for (const n of await ladeNotizen(buch.id)) await remove(NOTIZEN, n.id);
  await remove(BUECHER, buch.id);
}

// Notizen eines Buchs nach Seite (ohne Seite zuletzt), sonst nach Anlage.
export const ladeNotizen = async (buchId) => (await getAll(NOTIZEN)).filter((n) => n.buch_id === buchId)
  .sort((a, b) => (a.seite ?? 1e9) - (b.seite ?? 1e9) || a.created_at.localeCompare(b.created_at));
export const speichereNotiz = (n) => save(NOTIZEN, n);
export const loescheNotiz = (id) => remove(NOTIZEN, id);
