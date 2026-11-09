// Karte „Abbauen“: große Zahl „Tage ohne“, beste Serie, kleiner Knopf „Rückfall“, Auslöser zum Aufklappen.
import { el } from '../../ui/dom.js';
import { tageOhne, besteSerie, ausloeserZaehlen } from './data.js';
import { oeffneRueckfall } from './rueckfall.js';

export function karteAb(g, { onEdit }) {
  const n = tageOhne(g);
  const beste = besteSerie(g);
  const ausloeser = ausloeserZaehlen(g);

  return el('article', { class: 'routine gewohnheit gewohnheit--ab' }, [
    el('button', { class: 'routine__kopf', attrs: { type: 'button', 'aria-label': `${g.name} bearbeiten` }, on: { click: () => onEdit(g) } }, [
      el('span', { class: 'label', text: 'Abbauen' }),
      el('h2', { class: 'routine__name', text: g.name }),
    ]),
    el('div', { class: 'gewohnheit__ohne' }, [
      el('strong', { text: String(n) }),
      el('span', { text: n === 1 ? 'Tag ohne' : 'Tage ohne' }),
    ]),
    el('div', { class: 'routine__fuss' }, [
      beste > n && el('small', { class: 'routine__serie', text: `Beste Serie: ${beste} Tage` }),
      el('button', { class: 'gewohnheit__rueckfall', text: 'Rückfall', attrs: { type: 'button' }, on: { click: () => oeffneRueckfall(g) } }),
    ]),
    ausloeser.length > 0 && el('details', { class: 'gewohnheit__ausloeser' }, [
      el('summary', { text: 'Auslöser' }),
      el('ul', {}, ausloeser.map(([name, z]) => el('li', {}, [el('span', { text: name }), el('b', { text: `${z}×` })]))),
    ]),
  ]);
}
