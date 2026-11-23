// Eine To-do-Zeile: Checkbox links, daneben Titel und darunter das Datum (überfällig in --warn).
// Checkbox = abhaken, Rest der Zeile antippen = Bearbeiten öffnen.
import { el } from '../../ui/dom.js';
import { listItem } from '../../ui/list.js';
import { checkbox } from '../../ui/checkbox.js';
import { datumText, istUeberfaellig } from './sortierung.js';

// So lange darf der Haken animieren, bevor die Zeile in die andere Liste wandert.
const HAKEN_MS = 350;

function unterzeile(todo) {
  if (!todo.faellig_am) return null;
  return el('span', { class: 'list__sub' }, [el('span', { class: istUeberfaellig(todo) ? 'todo-zeile__warn' : '', text: datumText(todo.faellig_am) })]);
}

export function todoZeile(todo, { onToggle, onOpen }) {
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
        unterzeile(todo),
      ]),
    ]
  );

  return listItem(el('div', { class: `todo-zeile${erledigt ? ' todo-zeile--erledigt' : ''}` }, [haken, text]));
}
