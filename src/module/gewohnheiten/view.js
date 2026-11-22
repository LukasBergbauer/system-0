// Ansicht „Gewohnheiten“ (Bento am Farbkopf): erst Aufbauen, dann Abbauen als verbundene Karten, unten „+ Gewohnheit“.
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { on } from '../../core/events.js';
import { TABELLEN, ladeAlles } from './data.js';
import { karte } from './karte.js';
import { oeffneBearbeiten } from './bearbeiten.js';

export function gewohnheitenAnsicht({ signal }) {
  const box = el('div', { class: 'bento gewohnheiten' });
  let stand = 0;

  async function zeichne() {
    const nr = ++stand;
    const alle = await ladeAlles();
    if (nr !== stand || signal.aborted) return;
    const karten = alle.map((g, i) => [g, i]).sort(([a], [b]) => (a.art === b.art ? 0 : a.art === 'auf' ? -1 : 1))
      .map(([g, i]) => karte(g, i, { onEdit: oeffneBearbeiten }));
    box.replaceChildren(...karten, el('div', { class: 'bento__feld bento__fuss' }, [
      !alle.length && el('span', { class: 'app__note', text: 'Noch keine Gewohnheiten.' }),
      button({ text: '+ Gewohnheit', variant: 'primary', onClick: () => oeffneBearbeiten() }),
    ].filter(Boolean)));
  }

  on('daten', ({ table }) => TABELLEN.includes(table) && zeichne(), { signal });
  zeichne();
  return box;
}
