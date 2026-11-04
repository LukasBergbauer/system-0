// Ansicht „Heute“ – vorläufig ein Platzhalter, bis das Modul gebaut wird (siehe docs/module/heute.md).
import { el } from '../../ui/dom.js';
import { card } from '../../ui/card.js';

export function heuteAnsicht() {
  return card({
    children: el('p', {
      class: 'app__note',
      text: 'Kommt bald: Termine und To-dos von heute auf einen Blick.',
    }),
  });
}
