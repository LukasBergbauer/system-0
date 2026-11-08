// Ansicht „Heute“: Glas-Dashboard (Plan in docs/module/heute.md).
// Liest nur über core/ (To-dos, eigene Termine, Google-Termine aus dem Zwischenspeicher), speichert nichts.
// Bei jedem Ereignis 'daten' neu zeichnen – dann ohne Hochzähl-Bewegung, damit nichts zappelt.
import { el } from '../../ui/dom.js';
import { getAll } from '../../core/store.js';
import { getMeta } from '../../core/sync-local.js';
import { on } from '../../core/events.js';
import { rechne } from './rechnen.js';
import { kopf } from './kopf.js';
import { hero } from './hero.js';
import { kacheln } from './kacheln.js';

const GOOGLE = 'kalender:google'; // Zwischenspeicher des Kalenders: { termine: [...] }

async function laden() {
  const [todos, termine, google] = await Promise.all([getAll('todos'), getAll('termine'), getMeta(GOOGLE)]);
  return { todos, termine: [...termine, ...(google?.termine || [])] };
}

export function heuteAnsicht({ signal }) {
  const box = el('div', { class: 'heute' });
  let erstesMal = true;

  async function zeichne() {
    const z = rechne(await laden());
    const animiert = erstesMal;
    erstesMal = false;
    box.replaceChildren(
      kopf(z.dinge),
      el('section', { class: 'heute-raster' }, [hero(z.woche, animiert), ...kacheln(z, animiert)]),
    );
  }

  zeichne();
  on('daten', zeichne, { signal });
  return box;
}
