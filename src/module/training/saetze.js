// Block einer Übung in der Einheit: Name (→ Übungsseite), „Zuletzt“, Satz-Zeilen (Felder je Messung, RIR bei Wdh), „+ Satz“.
// Jedes Feld speichert beim Verlassen (change). Neu/Löschen ruft danach neu() auf.
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { SAETZE, MESSUNG, aendere, neuerSatz, loescheSatz, zeitText, zeitLesen } from './daten.js';

const zahlLesen = (t) => {
  const n = parseFloat(String(t).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};
export const zeigen = (key, w) => (w == null ? '' : key === 'zeit' ? zeitText(w) : String(w).replace('.', ','));
export const lesen = (key, t) => (key === 'zeit' ? zeitLesen(t) : key === 'wdh' ? (zahlLesen(t) == null ? null : Math.round(zahlLesen(t))) : zahlLesen(t));
export const PLATZ = { wdh: '10', gewicht: '40', zeit: '1:30', distanz: '500', rir: '2' };
const rirLesen = (t) => { const n = parseInt(t, 10); return n >= 1 && n <= 4 ? n : null; };
const label = (key) => (key === 'rir' ? 'RIR' : MESSUNG.find((m) => m.id === key).label);
const spalten = (messung) => (messung.includes('wdh') ? [...messung, 'rir'] : messung);

function satzZeile(satz, i, messung, neu) {
  const felder = spalten(messung).map((key) => {
    const f = el('input', {
      class: 'field__input satz__feld',
      attrs: { inputmode: key === 'zeit' ? 'text' : key === 'wdh' || key === 'rir' ? 'numeric' : 'decimal', placeholder: PLATZ[key], 'aria-label': label(key) },
      on: { change: () => {
        satz[key] = key === 'rir' ? rirLesen(f.value) : lesen(key, f.value);
        f.value = zeigen(key, satz[key]);
        aendere(SAETZE, { id: satz.id, [key]: satz[key] });
      } },
    });
    f.value = zeigen(key, satz[key]);
    return f;
  });
  return el('li', { class: 'satz' }, [
    el('span', { class: 'satz__nr', text: i + 1 }),
    ...felder,
    el('button', { class: 'satz__weg', text: '×', attrs: { type: 'button', 'aria-label': `Satz ${i + 1} löschen` },
      on: { click: async () => { await loescheSatz(satz.id); neu(); } } }),
  ]);
}

// letztes = Sätze dieser Übung aus der vorigen Einheit (oder null), zuletzt = fertiger Text dazu.
export function uebungBlock({ uebung, saetze, einheit_id, letztes, zuletzt, oeffne, neu }) {
  const messung = uebung.messung?.length ? uebung.messung : ['wdh'];
  return el('section', { class: 'card training__block' }, [
    el('button', { class: 'training__block-kopf', attrs: { type: 'button' }, on: { click: () => oeffne('uebung', uebung.id) } }, [
      el('span', { class: 'training__block-name', text: uebung.name }),
      el('span', { class: 'training__pfeil', text: '›' }),
    ]),
    zuletzt && el('p', { class: 'training__letztes', text: zuletzt }),
    uebung.notiz && el('p', { class: 'training__zuletzt', text: uebung.notiz }),
    saetze.length > 0 && el('div', { class: 'satz satz--kopf', attrs: { 'aria-hidden': 'true' } }, [
      el('span', { class: 'satz__nr' }),
      ...spalten(messung).map((key) => el('span', { class: 'satz__feld label', text: label(key) })),
      el('span', { class: 'satz__weg' }),
    ]),
    el('ol', { class: 'saetze' }, saetze.map((s, i) => satzZeile(s, i, messung, neu))),
    button({ text: '+ Satz', variant: 'ghost', onClick: async () => {
      await neuerSatz(einheit_id, uebung.id, saetze[saetze.length - 1] ?? letztes?.[letztes.length - 1]);
      neu();
    } }),
  ]);
}
