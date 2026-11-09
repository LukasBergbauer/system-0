// Erinnerungen planen: aus Terminen und Routinen die Mitteilungen der nächsten 14 Tage in die Tabelle „erinnerungen“.
// Die Supabase-Funktion „erinnerungen“ schickt sie zur Zeit (pg_cron jede Minute). Nur wenn irgendein Gerät
// Mitteilungen eingeschaltet hat (push_abos). Gleiche Quelle + Zeit = gleiche id, deshalb doppelt nichts,
// auch wenn Mac und iPhone beide planen. Vergangenes/Gesendetes wird nie angefasst.
// - Termine (eigene, auch Wiederholungen): Vorlauf aus Einstellung „erinnerung_minuten“ (Standard 15) vor Beginn;
//   ganztägige um 8:00 Uhr am Tag.
// - Routinen mit eigener Startzeit (sperre_ab): täglich zur Startzeit, außer heute schon fertig oder ausgesetzt.
import { getAll, save, remove } from './store.js';
import { on } from './events.js';
import { aufklappen } from './wiederholung.js';
import { getSetting } from './einstellungen.js';

export const ERINNERUNGEN = 'erinnerungen';
const TAGE = 14;
const QUELLEN = new Set(['termine', 'routinen', 'routine_logs', 'push_abos', 'einstellungen']);

// Feste uuid aus einem Text (SHA-256, als uuid geschrieben)
export async function idAus(text) {
  const h = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))]
    .slice(0, 16).map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

const uhr = (d) => d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
const tagISO = (d) => d.toLocaleDateString('sv-SE');

async function gewuenscht(jetzt, bis) {
  const minuten = Number(await getSetting('erinnerung_minuten', 15)) || 15;
  const liste = [];
  for (const t of aufklappen(await getAll('termine'))) {
    const s = new Date(t.start);
    const zeit = t.ganztaegig ? new Date(s.getFullYear(), s.getMonth(), s.getDate(), 8) : new Date(+s - minuten * 60e3);
    const text = t.ganztaegig ? 'Heute, ganztägig' : `Um ${uhr(s)}${t.ort ? ` · ${t.ort}` : ''}`;
    liste.push({ quelle: `termin|${t.id}`, zeit, titel: t.titel, text, ziel: '#/kalender' });
  }
  const logs = await getAll('routine_logs');
  for (const r of (await getAll('routinen')).filter((x) => x.sperre_ab)) {
    const [h, m] = r.sperre_ab.split(':').map(Number);
    for (let i = 0; i <= TAGE; i++) {
      const zeit = new Date(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate() + i, h, m);
      const log = logs.find((l) => l.routine_id === r.id && l.tag === tagISO(zeit));
      if (log?.fertig_am || log?.ausgesetzt) continue;
      liste.push({ quelle: `routine|${r.id}`, zeit, titel: r.name, text: 'Zeit für deine Routine', ziel: '#/routinen' });
    }
  }
  return liste.filter((e) => e.zeit > jetzt && e.zeit < bis);
}

let laeuft = null;
export async function planen() {
  if (laeuft) return laeuft;
  laeuft = (async () => {
    const jetzt = new Date(Date.now() + 60e3); // die nächste Minute gehört schon dem Server
    const bis = new Date(Date.now() + TAGE * 864e5);
    const vorhanden = (await getAll(ERINNERUNGEN)).filter((e) => !e.gesendet_am && new Date(e.zeit) > jetzt);
    if (!(await getAll('push_abos')).length) {
      for (const e of vorhanden) await remove(ERINNERUNGEN, e.id); // niemand bekommt Mitteilungen
      return;
    }
    const neu = new Map();
    for (const e of await gewuenscht(jetzt, bis)) {
      const zeit = e.zeit.toISOString();
      neu.set(await idAus(`${e.quelle}|${zeit}`), { zeit, titel: e.titel, text: e.text, ziel: e.ziel });
    }
    const alt = new Map(vorhanden.map((e) => [e.id, e]));
    for (const [id, e] of neu) {
      const a = alt.get(id);
      if (!a || a.titel !== e.titel || a.text !== e.text) await save(ERINNERUNGEN, { id, ...e, gesendet_am: null, deleted: false });
    }
    for (const id of alt.keys()) if (!neu.has(id)) await remove(ERINNERUNGEN, id);
  })().finally(() => { laeuft = null; });
  return laeuft;
}

// Beim Start und nach Änderungen an Terminen/Routinen (gebündelt) neu planen.
let timer = null;
let gestartet = false;
export function startErinnerungen() {
  if (gestartet) return;
  gestartet = true;
  const bald = () => { clearTimeout(timer); timer = setTimeout(() => planen().catch((e) => console.warn('Erinnerungen:', e)), 3000); };
  on('daten', ({ table }) => QUELLEN.has(table) && bald());
  setInterval(bald, 6 * 3600e3); // lange offen (Mac): Fenster der 14 Tage weiterschieben
  bald();
}
