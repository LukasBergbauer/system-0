// Abschnitts-Überschrift als dezenter Glas-Kasten (Runde 2): Symbol, Label in Großbuchstaben, Zahl rechts.
// abschnitt({ titel: 'Heute', zahl: 3, symbol: 'todos' }); in einer Karte automatisch ohne Schatten (schrift.css).
import { el } from './dom.js';
import { symbol as linie } from './symbol.js';

export function abschnitt({ titel, zahl, symbol, tag = 'h2', klasse = '' }) {
  return el(tag, { class: `abschnitt ${klasse}`.trim() }, [
    symbol && linie(symbol),
    el('span', { class: 'abschnitt__titel', text: titel }),
    zahl != null && el('span', { class: 'abschnitt__zahl', text: String(zahl) }),
  ]);
}
