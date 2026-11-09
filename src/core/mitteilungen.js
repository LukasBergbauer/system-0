// Mitteilungen (Web Push) auf diesem Gerät ein- und ausschalten.
// iPhone: nur in der App vom Home-Bildschirm (iOS 16.4+). Das Abo landet in der Tabelle push_abos (synchronisiert);
// die Supabase-Funktion „erinnerungen“ schickt damit die fälligen Erinnerungen (siehe erinnerungen.js).
import { SUPABASE_URL } from './config.js';
import { getAll, save, remove } from './store.js';
import { idAus } from './erinnerungen.js';

export const ABOS = 'push_abos';
const FUNKTION = `${SUPABASE_URL}/functions/v1/erinnerungen`;

// 'nicht-moeglich' | 'homebildschirm' | 'blockiert' | 'aus' | 'an'
export async function pushStatus() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    const ios = /iPhone|iPad/.test(navigator.userAgent);
    return ios && !navigator.standalone ? 'homebildschirm' : 'nicht-moeglich';
  }
  if (Notification.permission === 'denied') return 'blockiert';
  const reg = await navigator.serviceWorker.ready;
  const abo = await reg.pushManager.getSubscription();
  if (!abo) return 'aus';
  const id = await idAus(abo.endpoint);
  return (await getAll(ABOS)).some((a) => a.id === id) ? 'an' : 'aus';
}

const b64 = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

export async function pushEinschalten() {
  if ((await Notification.requestPermission()) !== 'granted') throw new Error('Mitteilungen wurden nicht erlaubt.');
  const antwort = await fetch(FUNKTION);
  if (!antwort.ok) throw new Error('Die Supabase-Funktion „erinnerungen“ antwortet nicht (schon angelegt?).');
  const { publicKey } = await antwort.json();
  const reg = await navigator.serviceWorker.ready;
  const alt = await reg.pushManager.getSubscription();
  if (alt) await alt.unsubscribe(); // falls mit einem anderen Schlüssel abonniert
  const abo = (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(publicKey) })).toJSON();
  const geraet = /iPhone|iPad/.test(navigator.userAgent) ? 'iPhone' : 'Mac';
  await save(ABOS, { id: await idAus(abo.endpoint), endpoint: abo.endpoint, p256dh: abo.keys.p256dh, auth: abo.keys.auth, geraet, deleted: false });
}

export async function pushAusschalten() {
  const reg = await navigator.serviceWorker.ready;
  const abo = await reg.pushManager.getSubscription();
  if (!abo) return;
  await remove(ABOS, await idAus(abo.endpoint));
  await abo.unsubscribe();
}
