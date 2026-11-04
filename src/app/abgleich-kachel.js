// Große Kachel „Abgleich“ (in den Einstellungen): Zustand groß, Uhrzeit/Wartendes klein darunter.
// Antippen = jetzt abgleichen. Während des Abgleichs dreht sich das Symbol.
import { kachel } from '../ui/kachel.js';
import { on } from '../core/events.js';
import { syncNow, syncStatus } from '../core/sync.js';

const uhr = (iso) => new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

const WERT = {
  neu: 'Noch nicht abgeglichen',
  läuft: 'Gleiche ab …',
  ok: 'Alles synchron',
  fehler: 'Hat nicht geklappt',
};

function texte({ state, at, pending }) {
  const wartet = pending ? `${pending} ${pending === 1 ? 'Änderung wartet' : 'Änderungen warten'}` : '';
  const wert = WERT[state] ?? 'Offline';
  let unten = 'Antippen zum Abgleichen';
  if (state === 'ok') unten = `Zuletzt um ${uhr(at)}`;
  if (state === 'fehler') unten = 'Neuer Versuch in Kürze';
  if (state === 'offline' || !WERT[state]) unten = 'Wird später hochgeladen';
  return { wert, unten: [unten, wartet].filter(Boolean).join(' · ') };
}

export function abgleichKachel({ signal } = {}) {
  const k = kachel({
    symbol: 'abgleich',
    titel: 'Abgleich',
    wert: ' ',
    text: ' ',
    gross: true,
    onClick: () => syncNow(),
  });
  const wert = k.querySelector('.kachel__wert');
  const unten = k.querySelector('.kachel__sub');

  function zeige(status) {
    const t = texte(status);
    wert.textContent = t.wert;
    unten.textContent = t.unten;
    k.classList.toggle('kachel--laeuft', status.state === 'läuft');
    k.classList.toggle('kachel--warn', status.state === 'fehler');
  }

  zeige(syncStatus());
  on('sync', zeige, { signal });
  return k;
}
