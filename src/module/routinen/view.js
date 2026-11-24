// Ansicht „Routinen“: ein Raster aus Karten (Morgen, Abend, dann weitere; Art steht klein in der Karte); „Neue Routine“ unten.
// Leer: Morgen- und Abendroutine anlegen.
// Zusatz '#/routinen/<id>' (z. B. von Heute) startet gleich den Durchlauf dieser Routine.
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
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

const RANG = (r) => ({ morgen: 0, abend: 1 }[r.art] ?? 2); // Morgen, Abend, dann weitere (sonst Reihenfolge wie geladen)

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
        el('div', { class: 'routinen__raster' }, [...routinen].sort((a, b) => RANG(a) - RANG(b))
          .map((r) => routineKarte(r, { onStart: start, onEdit: oeffneBearbeiten }))),
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
