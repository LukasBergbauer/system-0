// Seitenkopf aller Bereiche außer Heute: Akzent-Band mit Symbol, großem Titel und rechts kräftigen Kennzahlen.
// kopfbild({ titel: 'Training', symbol: 'training', werte: [{ zahl: 3, text: 'Einheiten' }] })
// werte darf ein Promise sein; kopf.werte(neue) tauscht sie später aus.
import { el } from './dom.js';
import { symbol as linie } from './symbol.js';

export function kopfbild({ titel, symbol, werte = [] } = {}) {
  const box = el('div', { class: 'kopf__werte' });
  const kopf = el('header', { class: 'kopf' }, [
    symbol && el('span', { class: 'kopf__symbol' }, [linie(symbol)]),
    el('h1', { class: 'kopf__titel', text: titel }),
    box,
  ]);
  kopf.werte = (liste) => Promise.resolve(liste).then((w) => box.replaceChildren(...(w ?? []).map(({ zahl, text }) =>
    el('div', { class: 'kopf__wert' }, [el('b', { text: String(zahl) }), el('span', { text })]))));
  kopf.werte(werte);
  return kopf;
}
