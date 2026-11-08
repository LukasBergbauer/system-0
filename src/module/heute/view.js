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
import { kalenderKarte } from './kalender-karte.js';
import { verlauf } from './verlauf.js';
import { donut } from './donut.js';

const GOOGLE = 'kalender:google'; // Zwischenspeicher des Kalenders: { termine: [...] }

async function laden() {
  const [todos, termine, bereiche, google] = await Promise.all([
    getAll('todos'), getAll('termine'), getAll('todo_bereiche'), getMeta(GOOGLE),
  ]);
  return { todos, bereiche, termine: [...termine, ...(google?.termine || [])] };
}

export function heuteAnsicht({ signal }) {
  const box = el('div', { class: 'heute' });
  let erstesMal = true;

  async function zeichne() {
    const d = await laden();
    const z = rechne(d);
    const animiert = erstesMal;
    erstesMal = false;
    box.classList.toggle('heute--ruhig', !animiert); // beim Neuzeichnen nicht noch einmal einblenden
    box.replaceChildren(
      kopf(z.dinge),
      el('section', { class: 'heute-raster' }, [
        hero(z.woche, animiert),
        kalenderKarte(d.termine),
        ...kacheln(z, animiert),
        verlauf(d.todos, animiert),
        donut(d.todos, d.bereiche, animiert),
      ]),
    );
  }

  zeichne();
  on('daten', zeichne, { signal });
  return box;
}
