// Eine To-do-Zeile: runder Haken links, Titel (hohe Priorität mit „!!“ davor wie in Erinnerungen), darunter Datum/Bereich.
// Checkbox = abhaken, Rest der Zeile antippen = Bearbeiten öffnen.
import { el } from '../../ui/dom.js';
import { listItem } from '../../ui/list.js';
import { checkbox } from '../../ui/checkbox.js';
import { datumText, istUeberfaellig } from './sortierung.js';

// So lange darf der Haken animieren, bevor die Zeile in die andere Liste wandert.
const HAKEN_MS = 350;

function unterzeile(todo, bereichName) {
  const teile = [];
  const datum = todo.faellig_am && datumText(todo.faellig_am);
  // „Heute“/„Morgen“ steht schon als Gruppe darüber
  if (datum && (todo.erledigt_am || !['Heute', 'Morgen'].includes(datum))) {
    teile.push(el('span', { class: istUeberfaellig(todo) ? 'todo-zeile__warn' : '', text: datum }));
  }
  if (bereichName) teile.push(el('span', { text: bereichName }));
  if (!teile.length) return null;
  const mitPunkten = teile.flatMap((t, i) => (i ? [' · ', t] : [t]));
  return el('span', { class: 'list__sub' }, mitPunkten);
}

export function todoZeile(todo, { bereichName, onToggle, onOpen }) {
  const erledigt = Boolean(todo.erledigt_am);
  const haken = checkbox({
    checked: erledigt,
    onChange: (an) => setTimeout(() => onToggle(todo, an), HAKEN_MS),
  });
  haken.querySelector('input').setAttribute('aria-label', `${todo.titel} ${erledigt ? 'wieder öffnen' : 'abhaken'}`);

  const text = el(
    'button',
    { class: 'list__inner list__inner--tap', attrs: { type: 'button' }, on: { click: () => onOpen(todo) } },
    [
      el('span', { class: 'list__text' }, [
        el('span', { class: 'list__title' }, [
          !erledigt && todo.prio === 1 && el('span', { class: 'todo-prio', text: '!!', attrs: { 'aria-label': 'Priorität hoch' } }),
          todo.titel,
        ]),
        unterzeile(todo, bereichName),
      ]),
    ]
  );

  return listItem(el('div', { class: `todo-zeile${erledigt ? ' todo-zeile--erledigt' : ''}` }, [haken, text]));
}
