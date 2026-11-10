// Ansicht „Gewohnheiten“: oben Aufbauen, darunter Abbauen, „Neue Gewohnheit“ unten.
import { abschnitt as kasten } from '../../ui/abschnitt.js';
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { on } from '../../core/events.js';
import { TABELLEN, ladeAlles } from './data.js';
import { karteAuf } from './karte-auf.js';
import { karteAb } from './karte-ab.js';
import { oeffneBearbeiten } from './bearbeiten.js';

const abschnitt = (titel, karten) => karten.length > 0 && el('section', { class: 'gewohnheiten__abschnitt' }, [
  kasten({ titel, zahl: karten.length, symbol: 'gewohnheiten' }),
  el('div', { class: 'routinen__raster' }, karten),
]);

export function gewohnheitenAnsicht({ signal }) {
  const box = el('div', { class: 'routinen gewohnheiten' });
  let stand = 0;

  async function zeichne() {
    const nr = ++stand;
    const alle = await ladeAlles();
    if (nr !== stand || signal.aborted) return;
    const neu = button({ text: '+ Neue Gewohnheit', variant: alle.length ? 'ghost' : 'primary', onClick: () => oeffneBearbeiten() });
    box.replaceChildren(...[
      !alle.length && el('p', { class: 'app__note', text: 'Noch keine Gewohnheiten.' }),
      abschnitt('Aufbauen', alle.filter((g) => g.art === 'auf').map((g) => karteAuf(g, { onEdit: oeffneBearbeiten }))),
      abschnitt('Abbauen', alle.filter((g) => g.art === 'ab').map((g) => karteAb(g, { onEdit: oeffneBearbeiten }))),
      neu,
    ].filter(Boolean));
  }

  on('daten', ({ table }) => TABELLEN.includes(table) && zeichne(), { signal });
  zeichne();
  return box;
}
