// Ansicht „To-dos“: Schnelleingabe, Glas-Boxen „Heute“ (Fokus, höchstens HEUTE_MAX) + „Morgen“, dann „Irgendwann“ und „Erledigt“ (eingeklappt).
// Zeichnet sich neu, sobald sich To-dos ändern (auch durch das andere Gerät).
import { abschnitt } from '../../ui/abschnitt.js';
import { el } from '../../ui/dom.js';
import { list } from '../../ui/list.js';
import { on } from '../../core/events.js';
import { zusatzNehmen } from '../../core/router.js';
import { TODOS, HEUTE_MAX, ladeTodos, setzeErledigt, loescheTodo, holeZurueck } from './data.js';
import { wischbar, rueckgaengig } from './wischen.js';
import { sortiereOffene, sortiereErledigte } from './sortierung.js';
import { gruppiereNachZeit } from './gruppen.js';
import { todoZeile } from './zeile.js';
import { schnelleingabe } from './schnelleingabe.js';
import { oeffneBearbeiten } from './bearbeiten.js';
import { erledigtAbschnitt } from './erledigt.js';

// Heute · Morgen sind hervorgehoben (eigenes Symbol, Akzent-Kopf). Heute zeigt „n/3“.
const WICHTIG = { Heute: 'heute', Morgen: 'morgen' };

function gruppe(titel, todos, zeile, leer) {
  const wichtig = WICHTIG[titel];
  return el('section', { class: `todo-gruppe${wichtig ? ' todo-gruppe--wichtig' : ''}` }, [
    abschnitt({ titel, zahl: titel === 'Heute' ? `${todos.length}/${HEUTE_MAX}` : todos.length, symbol: wichtig || 'todos' }),
    todos.length ? list(todos.map(zeile)) : el('p', { class: 'todo-leer', text: leer }),
  ]);
}

export function todosAnsicht({ signal }) {
  const inhalt = el('div', { class: 'todo-liste' });
  let erledigtOffen = false;
  let aeltereZeigen = false; // Erledigte älter als 30 Tage
  let stand = 0; // nur das Ergebnis des neuesten Zeichnens zählt
  // Zusatz von außen: 'neu' = Fokus in die Schnelleingabe, sonst die id eines To-dos (Suche) = gleich bearbeiten
  let zusatz = zusatzNehmen();

  async function zeichne() {
    const nr = ++stand;
    const sichtbar = await ladeTodos();
    if (nr !== stand || signal.aborted) return;
    if (zusatz && zusatz !== 'neu') {
      const gesucht = sichtbar.find((t) => t.id === zusatz);
      zusatz = null;
      if (gesucht) oeffneBearbeiten(gesucht);
    }

    const zeile = (todo) => wischbar(
      todoZeile(todo, {
        onToggle: (t, an) => setzeErledigt(t.id, an),
        onOpen: (t) => oeffneBearbeiten(t),
      }),
      {
        erledigt: !!todo.erledigt_am,
        onHaken: () => setzeErledigt(todo.id, !todo.erledigt_am),
        onLoeschen: async () => {
          await loescheTodo(todo.id);
          rueckgaengig(`„${todo.titel}“ gelöscht`, () => holeZurueck(todo.id));
        },
      },
    );


    const g = gruppiereNachZeit(sortiereOffene(sichtbar));
    const grenze = Date.now() - 30 * 864e5;
    const alleErledigten = sortiereErledigte(sichtbar);
    const neue = alleErledigten.filter((t) => Date.parse(t.erledigt_am) >= grenze);
    const erledigt = erledigtAbschnitt({
      zeilen: (aeltereZeigen ? alleErledigten : neue).map(zeile),
      gesamt: alleErledigten.length,
      aeltere: aeltereZeigen ? 0 : alleErledigten.length - neue.length,
      aeltereZeigen: () => { aeltereZeigen = true; zeichne(); },
      offen: erledigtOffen,
      umschalten: () => {
        erledigtOffen = !erledigtOffen;
        zeichne();
      },
    });
    inhalt.replaceChildren(...[
      el('div', { class: 'todo-oben' }, [gruppe('Heute', g.heute, zeile, 'Nichts für heute.'), gruppe('Morgen', g.morgen, zeile, 'Nichts für morgen.')]),
      g.irgendwann.length && gruppe('Irgendwann', g.irgendwann, zeile),
      erledigt,
    ].filter(Boolean));
  }

  const eingabe = schnelleingabe();
  // „Neu → To-do“ (z. B. von Heute): gleich ins Eingabefeld
  if (zusatz === 'neu') requestAnimationFrame(() => eingabe.fokus());

  on('daten', ({ table }) => {
    if (table === TODOS) zeichne();
  }, { signal });
  zeichne();

  return el('div', { class: 'app__stack' }, [eingabe, inhalt]);
}
