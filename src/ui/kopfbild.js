// Seitenkopf aller Bereiche außer Heute: Glas-Kopfleiste mit Symbol, Abschnitt (z. B. „Körper & Kopf“), Titel
// und rechts kurze Kennzahlen, durch Haarlinien getrennt. Das Muster je Bereich kommt aus kopf-muster.css.
// kopfbild({ titel: 'Training', symbol: 'training', abschnitt: 'KÖRPER & KOPF', werte: [{ zahl: 3, text: 'Einheiten' }] })
// werte darf ein Promise sein; kopf.werte(neue) tauscht sie später aus.
import { el } from './dom.js';
import { symbol as linie } from './symbol.js';

export function kopfbild({ titel, symbol, abschnitt, werte = [] } = {}) {
  const box = el('div', { class: 'kopf__werte' });
  const kopf = el('header', { class: 'kopf' }, [
    symbol && el('span', { class: 'kopf__symbol' }, [linie(symbol)]),
    el('div', { class: 'kopf__text' }, [
      abschnitt && el('span', { class: 'kopf__abschnitt', text: abschnitt }),
      el('h1', { class: 'kopf__titel', text: titel }),
    ]),
    box,
  ]);
  kopf.werte = (liste) => Promise.resolve(liste).then((w) => box.replaceChildren(...(w ?? []).map(({ zahl, text }) =>
    el('div', { class: 'kopf__wert' }, [el('b', { text: String(zahl) }), el('span', { text })]))));
  kopf.werte(werte);
  return kopf;
}
