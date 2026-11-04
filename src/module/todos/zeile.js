// Eine To-do-Zeile: Checkbox links, daneben Titel und darunter Datum/Bereich, rechts ein Punkt für die Priorität
// (hoch = Elfenbein, mittel = grau, niedrig = kein Punkt).
// Checkbox = abhaken, Rest der Zeile antippen = Bearbeiten öffnen.
import { el } from '../../ui/dom.js';
import { listItem } from '../../ui/list.js';
import { checkbox } from '../../ui/checkbox.js';
import { datumText, istUeberfaellig } from './sortierung.js';

// So lange darf der Haken animieren, bevor die Zeile in die andere Liste wandert.
const HAKEN_MS = 350;

function unterzeile(todo, bereichName) {
  const teile = [];
  if (todo.faellig_am) {
    const warn = istUeberfaellig(todo);
    teile.push(el('span', { class: warn ? 'todo-zeile__warn' : '', text: datumText(todo.faellig_am) }));
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
        el('span', { class: 'list__title', text: todo.titel }),
        unterzeile(todo, bereichName),
      ]),
      !erledigt && todo.prio !== 3 && el('span', {
        class: `todo-prio todo-prio--${todo.prio === 1 ? 'hoch' : 'mittel'}`,
        attrs: { title: todo.prio === 1 ? 'Priorität hoch' : 'Priorität mittel' },
      }),
    ]
  );

  return listItem(el('div', { class: `todo-zeile${erledigt ? ' todo-zeile--erledigt' : ''}` }, [haken, text]));
}
