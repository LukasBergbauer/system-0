// Ansicht „Ziele“: eine Karte je Bereich (Vision + Ziele), „+ Bereich“ unten. Start leer.
// Zusatz '#/ziele/<id>' (Suche, Heute) öffnet dieses Ziel bzw. diesen Bereich.
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { on } from '../../core/events.js';
import { zusatzNehmen } from '../../core/router.js';
import { TABELLEN, ladeAlles, neuesZiel } from './data.js';
import { bereichKarte } from './karte.js';
import { oeffneBereich } from './bereich.js';
import { oeffneZiel } from './ziel.js';

export function zieleAnsicht({ signal }) {
  const box = el('div', { class: 'ziele' });
  let zusatz = zusatzNehmen();
  let stand = 0;

  const neu = async (b) => oeffneZiel((await neuesZiel(b.id, '')).id, { neu: true });

  async function zeichne() {
    const nr = ++stand;
    const bereiche = await ladeAlles();
    if (nr !== stand || signal.aborted) return;
    if (zusatz) {
      const b = bereiche.find((x) => x.id === zusatz);
      if (b) oeffneBereich(b);
      else if (bereiche.some((x) => x.ziele.some((z) => z.id === zusatz))) oeffneZiel(zusatz);
      zusatz = null;
    }
    box.replaceChildren(...(bereiche.length
      ? [
        el('div', { class: 'ziele__raster' }, bereiche.map((b) => bereichKarte(b, { onBereich: oeffneBereich, onZiel: (z) => oeffneZiel(z.id), onNeu: neu }))),
        button({ text: '+ Bereich', variant: 'ghost', onClick: () => oeffneBereich() }),
      ]
      : [
        el('p', { class: 'app__note', text: 'Noch keine Bereiche. Ein Bereich sammelt Ziele, z. B. Gesundheit oder Beruf, und hat eine Vision.' }),
        button({ text: '+ Ersten Bereich anlegen', variant: 'primary', onClick: () => oeffneBereich() }),
      ]));
  }

  on('daten', ({ table }) => TABELLEN.includes(table) && zeichne(), { signal });
  zeichne();
  return box;
}
