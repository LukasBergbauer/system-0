// Kacheln: Glas-Flächen im Raster (2 Spalten), z. B. für Einstellungen oder Übersichten.
// Klein: Symbol oben, darunter Label + Wert. Groß (ganze Breite): Symbol links, Text rechts.
// kacheln([kachel({ symbol: 'heute', titel: 'Abgleich', wert: 'Alles synchron', gross: true }), …])
// Mit onClick wird die Kachel ein Knopf. children = freier Inhalt unten (z. B. ein Knopf).
import { el } from './dom.js';
import { symbol as zeichen } from './symbol.js';

export function kacheln(kinder = []) {
  return el('div', { class: 'kacheln' }, kinder);
}

export function kachel({ symbol, titel, wert, text, gross = false, onClick, children } = {}) {
  const klasse = `kachel${gross ? ' kachel--gross' : ''}${onClick ? ' kachel--tap' : ''}`;
  const inhalt = [
    symbol && el('span', { class: 'kachel__symbol' }, zeichen(symbol)),
    el('span', { class: 'kachel__text' }, [
      titel && el('span', { class: 'kachel__titel label', text: titel }),
      wert && el('span', { class: 'kachel__wert', text: wert }),
      text && el('span', { class: 'kachel__sub', text }),
    ]),
    children,
  ];
  return onClick
    ? el('button', { class: klasse, attrs: { type: 'button' }, on: { click: onClick } }, inhalt)
    : el('div', { class: klasse }, inhalt);
}
