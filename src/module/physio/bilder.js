// Bilder der Punkte im PhysioZentrum. Zeilen in der Tabelle physio_bilder (store.js),
// die Dateien selbst über core/dateien.js (erst im Gerät, dann Supabase Storage, Ordner „physio-bilder“).
// Je Bild zwei Dateien: <user_id>/<id>.jpg (groß) und <user_id>/<id>-klein.jpg (Ball).
// Reihenfolge: kleinste Zahl = Titelbild (das Bild im Ball).
import { getAll, save, remove } from '../../core/store.js';
import { speichereDatei, loescheDatei, dateiUrl } from '../../core/dateien.js';
import { getUser } from '../../core/auth.js';
import { verkleinere } from './bild-verkleinern.js';

export const BILDER = 'physio_bilder';
const ORDNER = 'physio-bilder';

let nutzer = null;
async function nutzerId() {
  nutzer ??= getUser().then((u) => {
    if (!u) throw new Error('Nicht angemeldet');
    return u.id;
  }).catch((err) => {
    nutzer = null;
    throw err;
  });
  return nutzer;
}

async function pfad(bild, groesse) {
  return `${ORDNER}/${await nutzerId()}/${bild.id}${groesse === 'klein' ? '-klein' : ''}.jpg`;
}

const ordnen = (a, b) => a.reihenfolge - b.reihenfolge || a.created_at.localeCompare(b.created_at);

export function ladeBilder() {
  return getAll(BILDER);
}

// Bilder eines Punkts in ihrer Reihenfolge (erstes = Titelbild).
export function bilderVon(eintragId, bilder) {
  return bilder.filter((b) => b.eintrag_id === eintragId).sort(ordnen);
}

// Titelbild je Punkt: Map eintrag_id → Bild
export function titelbilder(bilder) {
  const karte = new Map();
  for (const b of [...bilder].sort(ordnen)) if (!karte.has(b.eintrag_id)) karte.set(b.eintrag_id, b);
  return karte;
}

// Adresse zum Anzeigen (groesse 'gross' oder 'klein'), oder null, falls (noch) nicht da.
export async function bildUrl(bild, groesse = 'gross') {
  return dateiUrl(await pfad(bild, groesse));
}

// Fügt Fotos hinten an. Gibt die neuen Zeilen zurück. Ein Foto, das sich nicht lesen lässt, wird übersprungen.
export async function fuegeBilderHinzu(eintragId, dateien, vorhandene) {
  let naechste = Math.max(0, ...bilderVon(eintragId, vorhandene).map((b) => b.reihenfolge + 1));
  const neu = [];
  for (const datei of dateien) {
    try {
      const { gross, klein, breite, hoehe } = await verkleinere(datei);
      const bild = { id: crypto.randomUUID() };
      await speichereDatei(await pfad(bild, 'gross'), gross);
      await speichereDatei(await pfad(bild, 'klein'), klein);
      neu.push(await save(BILDER, { ...bild, eintrag_id: eintragId, reihenfolge: naechste++, breite, hoehe }));
    } catch (err) {
      console.warn('Bild übersprungen:', datei?.name, err);
    }
  }
  return neu;
}

// Bild nach vorne holen (wird Titelbild).
export async function setzeTitelbild(bild, vorhandene) {
  const erste = Math.min(...bilderVon(bild.eintrag_id, vorhandene).map((b) => b.reihenfolge));
  if (bild.reihenfolge <= erste) return;
  await save(BILDER, { id: bild.id, reihenfolge: erste - 1 });
}

export async function loescheBild(bild) {
  await remove(BILDER, bild.id);
  await loescheDatei(await pfad(bild, 'gross'));
  await loescheDatei(await pfad(bild, 'klein'));
}

export async function loescheBilderVon(eintragId) {
  for (const b of bilderVon(eintragId, await ladeBilder())) await loescheBild(b);
}
