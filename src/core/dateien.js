// Dateien (z. B. Bilder) local-first: zuerst im Gerät (IndexedDB „dateien“), dann in Supabase Storage.
// pfad = '<speicher-ordner>/<name>', z. B. 'physio-bilder/<user_id>/<id>.jpg'.
//   speichereDatei(pfad, blob) – im Gerät speichern und zum Hochladen vormerken
//   holeDatei(pfad)            – Blob aus dem Gerät; fehlt er, einmal aus Supabase holen und behalten (sonst null)
//   dateiUrl(pfad)             – Adresse zum Anzeigen (<img src>), oder null
//   loescheDatei(pfad)         – im Gerät löschen und zum Entfernen in Supabase vormerken
// Hoch- und Wegräumen passiert im normalen Abgleich (sync.js ruft dateienAbgleichen auf).
// Ereignis 'dateien' mit { pfad } nach jeder Änderung.
import { transaction, done } from './db.js';
import { getSupabase } from './supabase.js';
import { isLoggedIn } from './auth.js';
import { emit } from './events.js';

const teile = (pfad) => {
  const i = pfad.indexOf('/');
  return [pfad.slice(0, i), pfad.slice(i + 1)];
};

async function lokal(pfad) {
  const eintrag = await transaction(['dateien'], 'readonly', (s) => done(s.dateien.get(pfad)));
  return eintrag?.blob ?? null;
}

export async function speichereDatei(pfad, blob) {
  await transaction(['dateien', 'datei_warteschlange'], 'readwrite', (s) => {
    s.dateien.put({ pfad, blob });
    s.datei_warteschlange.put({ pfad, aktion: 'hoch' });
  });
  emit('dateien', { pfad });
}

const urls = new Map(); // pfad → Objekt-Adresse (bleibt, solange die App offen ist)

export async function loescheDatei(pfad) {
  await transaction(['dateien', 'datei_warteschlange'], 'readwrite', (s) => {
    s.dateien.delete(pfad);
    s.datei_warteschlange.put({ pfad, aktion: 'weg' });
  });
  if (urls.has(pfad)) URL.revokeObjectURL(urls.get(pfad));
  urls.delete(pfad);
  emit('dateien', { pfad });
}

// Gleichzeitige Anfragen für dieselbe Datei teilen sich einen Download.
const laufend = new Map();

export function holeDatei(pfad) {
  if (!laufend.has(pfad)) {
    const anfrage = (async () => {
      const blob = await lokal(pfad);
      if (blob || !navigator.onLine || !isLoggedIn()) return blob;
      try {
        const supabase = await getSupabase();
        const [ordner, name] = teile(pfad);
        const { data, error } = await supabase.storage.from(ordner).download(name);
        if (error || !data) return null; // z. B. noch nicht hochgeladen: beim nächsten Mal wieder versuchen
        await transaction(['dateien'], 'readwrite', (s) => { s.dateien.put({ pfad, blob: data }); });
        return data;
      } catch (err) {
        console.warn('Datei konnte nicht geladen werden:', pfad, err);
        return null;
      }
    })().finally(() => laufend.delete(pfad));
    laufend.set(pfad, anfrage);
  }
  return laufend.get(pfad);
}

export async function dateiUrl(pfad) {
  if (urls.has(pfad)) return urls.get(pfad);
  const blob = await holeDatei(pfad);
  if (!blob) return null;
  if (!urls.has(pfad)) urls.set(pfad, URL.createObjectURL(blob));
  return urls.get(pfad);
}

export async function dateienWartend() {
  return transaction(['datei_warteschlange'], 'readonly', (s) => done(s.datei_warteschlange.count()));
}

// Arbeitet die Warteschlange ab. Fehler bei einer Datei halten die anderen nicht auf;
// sie bleibt vorgemerkt und wird beim nächsten Abgleich wieder versucht.
export async function dateienAbgleichen(supabase) {
  const auftraege = await transaction(['datei_warteschlange'], 'readonly', (s) => done(s.datei_warteschlange.getAll()));
  for (const { pfad, aktion } of auftraege) {
    const [ordner, name] = teile(pfad);
    try {
      if (aktion === 'hoch') {
        const blob = await lokal(pfad);
        if (blob) {
          const { error } = await supabase.storage.from(ordner)
            .upload(name, blob, { upsert: true, contentType: blob.type || 'image/jpeg' });
          if (error) throw error;
        }
      } else {
        const { error } = await supabase.storage.from(ordner).remove([name]);
        if (error) throw error;
      }
      // Auftrag nur streichen, wenn er sich inzwischen nicht geändert hat
      await transaction(['datei_warteschlange'], 'readwrite', async (s) => {
        const jetzt = await done(s.datei_warteschlange.get(pfad));
        if (jetzt?.aktion === aktion) s.datei_warteschlange.delete(pfad);
      });
    } catch (err) {
      console.warn('Datei-Abgleich fehlgeschlagen:', pfad, err);
    }
  }
}
