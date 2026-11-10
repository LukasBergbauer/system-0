// Ansicht „Routinen“: Abschnitte Morgen · Abend · Weitere, je ein festes Raster aus Karten; „Neue Routine“ unten. Leer: Morgen- und Abendroutine anlegen.
// Zusatz '#/routinen/<id>' (z. B. von Heute) startet gleich den Durchlauf dieser Routine.
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { abschnitt } from '../../ui/abschnitt.js';
import { on } from '../../core/events.js';
import { zusatzNehmen } from '../../core/router.js';
import { TABELLEN, ladeAlles, neueRoutine } from './data.js';
import { routineKarte } from './karte.js';
import { oeffneBearbeiten } from './bearbeiten.js';
import { starteDurchlauf } from './durchlauf.js';

async function grundRoutinen() {
  await neueRoutine({ name: 'Morgenroutine', art: 'morgen' });
  await neueRoutine({ name: 'Abendroutine', art: 'abend' });
}

export function routinenAnsicht({ signal }) {
  const box = el('div', { class: 'routinen' });
  let zusatz = zusatzNehmen();
  let stand = 0;

  const start = (r) => (r.schritte.length ? starteDurchlauf(r, { signal }) : oeffneBearbeiten(r));

  async function zeichne() {
    const nr = ++stand;
    const routinen = await ladeAlles();
    if (nr !== stand || signal.aborted) return;
    if (zusatz) {
      const r = routinen.find((x) => x.id === zusatz);
      zusatz = null;
      if (r) start(r);
    }
    box.replaceChildren(...(routinen.length
      ? [
        ...[['morgen', 'Morgen'], ['abend', 'Abend'], ['frei', 'Weitere']].map(([art, titel]) => {
          const liste = routinen.filter((r) => (r.art === art) || (art === 'frei' && r.art !== 'morgen' && r.art !== 'abend'));
          return liste.length && el('section', { class: 'routinen__abschnitt' }, [
            abschnitt({ titel, zahl: liste.length, symbol: 'routinen' }),
            el('div', { class: 'routinen__raster' }, liste.map((r) => routineKarte(r, { onStart: start, onEdit: oeffneBearbeiten }))),
          ]);
        }).filter(Boolean),
        button({ text: '+ Neue Routine', variant: 'ghost', onClick: () => oeffneBearbeiten() }),
      ]
      : [
        el('p', { class: 'app__note', text: 'Noch keine Routinen.' }),
        button({ text: 'Morgen- und Abendroutine anlegen', variant: 'primary', onClick: grundRoutinen }),
        button({ text: '+ Eigene Routine', variant: 'ghost', onClick: () => oeffneBearbeiten() }),
      ]));
  }

  on('daten', ({ table }) => TABELLEN.includes(table) && zeichne(), { signal });
  zeichne();
  return box;
}
