// Seitenkopf aller Bereiche außer Heute: großer Titel und darunter kurze Kennzahlen („5 offen · 2 fällig“).
// kopfbild({ titel: 'Training', werte: [{ zahl: 3, text: 'Einheiten' }] })
// werte darf ein Promise sein; kopf.werte(neue) tauscht sie später aus.
import { el } from './dom.js';

export function kopfbild({ titel, werte = [] } = {}) {
  const box = el('div', { class: 'kopf__werte' });
  const kopf = el('header', { class: 'kopf' }, [el('h1', { class: 'kopf__titel', text: titel }), box]);
  kopf.werte = (liste) => Promise.resolve(liste).then((w) => box.replaceChildren(...(w ?? []).map(({ zahl, text }) =>
    el('span', { class: 'kopf__wert' }, [el('b', { text: String(zahl) }), text]))));
  kopf.werte(werte);
  return kopf;
}
