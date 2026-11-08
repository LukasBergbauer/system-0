// Google-Kalender (nur lesen): Abruf über die Supabase-Funktion „google-kalender“, Zwischenspeicher nur auf dem Gerät.
// Die geheime iCal-Adresse liegt in `einstellungen` (google_ical), die Termine nie in Supabase.
// Nach jedem Abruf kommt das Ereignis `daten` mit { table: 'google' }.
import { getSupabase } from '../../core/supabase.js';
import { getMeta, setMeta } from '../../core/sync-local.js';
import { getSetting, setSetting } from '../../core/einstellungen.js';
import { emit } from '../../core/events.js';
import { leseIcal } from './ical.js';
import { plusTage } from './zeit.js';

export const GOOGLE = 'google';
export const GOOGLE_PREFIX = 'https://calendar.google.com/calendar/ical/';
const SCHLUESSEL = 'google_ical';
const MERKER = 'kalender:google';
const ALTER = 15 * 60 * 1000; // höchstens alle 15 Minuten neu abrufen

let speicher = null; // { abgerufen, termine, fehler }
let laeuft = null;

export async function googleStand() {
  if (!speicher) speicher = (await getMeta(MERKER)) || { abgerufen: null, termine: [], fehler: null };
  return speicher;
}

export const googleTermine = async () => (await googleStand()).termine;
export const googleAdresse = async () => (await getSetting(SCHLUESSEL)) || '';

async function merke(neu) {
  speicher = neu;
  await setMeta(MERKER, neu);
  emit('daten', { table: GOOGLE });
}

// Leere Adresse = Google ausschalten
export async function setzeGoogleAdresse(adresse) {
  await setSetting(SCHLUESSEL, adresse || null);
  await merke({ abgerufen: null, termine: [], fehler: null });
  if (adresse) await holeGoogle(true);
}

// sofort = auch wenn der letzte Abruf jünger als 15 Minuten ist
export function holeGoogle(sofort = false) {
  laeuft ??= abrufen(sofort).finally(() => { laeuft = null; });
  return laeuft;
}

async function abrufen(sofort) {
  const [adresse, stand] = await Promise.all([googleAdresse(), googleStand()]);
  if (!adresse || !navigator.onLine) return;
  if (!sofort && stand.abgerufen && Date.now() - Date.parse(stand.abgerufen) < ALTER) return;
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase.functions.invoke('google-kalender', { body: { adresse } });
    if (error) throw new Error((await error.context?.text?.()) || error.message);
    const heute = new Date();
    const termine = leseIcal(data, plusTage(heute, -90), plusTage(heute, 365));
    await merke({ abgerufen: heute.toISOString(), termine, fehler: null });
  } catch (fehler) {
    console.warn('Google-Kalender nicht abrufbar:', fehler);
    await merke({ ...stand, fehler: String(fehler.message || fehler) });
  }
}
