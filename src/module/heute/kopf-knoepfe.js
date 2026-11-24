// Heute: Knöpfe rechts im Kopf – „Bearbeiten“ (Raster anpassen; dann „Standard“ + „Fertig“) und „Neu“.
// Das Neu-Menü ist ein HTML-Popover: Tipp daneben oder Esc schließt sie von selbst.
// Lupe (nur iPhone, am Mac gibt es das Suchfeld in der Seitenleiste) meldet emit('suche'); die App-Hülle öffnet die Suche.
// „Neu“ geht über den Router-Zusatz (#/todos/neu …); der Zielbereich öffnet dann sein Anlegen.
import { el } from '../../ui/dom.js';
import { symbol } from '../../ui/symbol.js';
import { go } from '../../core/router.js';
import { emit } from '../../core/events.js';

const NEU = [['todos', 'To-do'], ['kalender', 'Termin'], ['physio', 'Physio-Punkt']];

// Fenster unter seinem Knopf, rechtsbündig, aber nie über den Bildschirmrand
function popover(knopf, klasse, kinder) {
  const box = el('div', { class: `heute-pop ${klasse}`, attrs: { popover: true } }, kinder);
  knopf.popoverTargetElement = box;
  box.addEventListener('toggle', (e) => {
    if (e.newState !== 'open') return;
    const r = knopf.getBoundingClientRect();
    const b = box.offsetWidth;
    box.style.top = `${r.bottom + 8}px`;
    box.style.left = `${Math.max(12, Math.min(r.right - b, innerWidth - b - 12))}px`;
  });
  return box;
}

function neuMenue(knopf) {
  const box = popover(knopf, 'heute-neu', NEU.map(([id, text]) => el('button', {
    attrs: { type: 'button' },
    on: { click: () => { box.hidePopover(); go(`${id}/neu`); } },
  }, [symbol(id), text])));
  return box;
}

export function kopfKnoepfe({ bearbeiten, umschalten, standard }) {
  if (bearbeiten) {
    return el('div', { class: 'heute-kopf__knoepfe' }, [
      el('button', { class: 'heute-pille heute-pille--glas', text: 'Standard', attrs: { type: 'button' }, on: { click: standard } }),
      el('button', { class: 'heute-pille heute-pille--dunkel', text: 'Fertig', attrs: { type: 'button' }, on: { click: umschalten } }),
    ]);
  }
  const anpassen = el('button', { class: 'heute-pille heute-pille--glas', attrs: { type: 'button', 'aria-label': 'Heute bearbeiten' }, on: { click: umschalten } },
    [symbol('mehr'), el('span', { class: 'heute-pille__text', text: 'Bearbeiten' })]);
  const neu = el('button', { class: 'heute-pille heute-pille--dunkel', attrs: { type: 'button' } }, [symbol('plus'), 'Neu']);
  const suche = el('button', { class: 'heute-pille heute-pille--glas heute-pille--suche', attrs: { type: 'button', 'aria-label': 'Suchen' }, on: { click: () => emit('suche') } }, [symbol('suche')]);
  return el('div', { class: 'heute-kopf__knoepfe' }, [suche, anpassen, neu, neuMenue(neu)]);
}
