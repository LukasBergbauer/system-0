// Eingabe-Leiste mit eingebautem Hauptknopf (System A, Stil leiste.css).
// leiste(eingabe, onSenden): vorhandenes <input> bekommt rechts einen dunklen „+“-Knopf; Enter oder Knopf → onSenden().
import { el } from './dom.js';
import { symbol } from './symbol.js';

export function leiste(eingabe, onSenden, label = 'Anlegen') {
  eingabe.className = 'leiste__feld';
  eingabe.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.isComposing) return;
    e.preventDefault();
    onSenden();
  });
  const knopf = el('button', { class: 'leiste__knopf', attrs: { type: 'button', 'aria-label': label },
    on: { click: onSenden, mousedown: (e) => e.preventDefault() } }, [symbol('plus')]);
  return el('div', { class: 'leiste' }, [eingabe, knopf]);
}
