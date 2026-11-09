// Karte „Aufbauen“: Name, Wert heute (abhaken bzw. − / +), Balken, Woche Mo–So als Punkte, Serie.
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { SCHRITT, wertAm, setzeWert, wocheTage, serie } from './data.js';

const TAG = new Intl.DateTimeFormat('de-DE', { weekday: 'narrow' });
const einheit = (g, w) => (g.messart === 'zeit' ? `${w} Min` : String(w));

export function karteAuf(g, { onEdit }) {
  const w = wertAm(g);
  const fertig = w >= g.ziel;
  const s = serie(g);
  const plus = SCHRITT[g.messart];

  const steuerung = g.messart === 'haken'
    ? button({ text: fertig ? 'Erledigt ✓' : 'Abhaken', variant: fertig ? 'normal' : 'primary', onClick: () => setzeWert(g, fertig ? 0 : 1) })
    : el('div', { class: 'gewohnheit__zaehler' }, [
      button({ text: '−', variant: 'ghost', disabled: !w, onClick: () => setzeWert(g, w - plus) }),
      el('span', { text: `${einheit(g, w)} / ${einheit(g, g.ziel)}` }),
      button({ text: `+${plus}`, variant: 'primary', onClick: () => setzeWert(g, w + plus) }),
    ]);

  return el('article', { class: `routine gewohnheit${fertig ? ' routine--fertig' : ''}` }, [
    el('button', { class: 'routine__kopf', attrs: { type: 'button', 'aria-label': `${g.name} bearbeiten` }, on: { click: () => onEdit(g) } }, [
      el('span', { class: 'label', text: 'Aufbauen' }),
      el('h2', { class: 'routine__name', text: g.name }),
    ]),
    g.messart !== 'haken' && el('div', { class: 'routine__balken', attrs: { 'aria-hidden': 'true' } }, [
      el('i', { attrs: { style: `width:${Math.min(1, w / g.ziel) * 100}%` } }),
    ]),
    el('div', { class: 'routine__fuss' }, [
      el('div', { class: 'routine__tage', attrs: { 'aria-label': 'Diese Woche' } }, wocheTage(g).map((t) =>
        el('span', { class: t.fertig ? 'an' : t.zukunft ? 'zukunft' : '', attrs: { title: t.tag } }, [TAG.format(new Date(`${t.tag}T12:00`))]))),
      s > 1 && el('small', { class: 'routine__serie', text: `${s} Tage in Folge` }),
      steuerung,
    ]),
  ]);
}
