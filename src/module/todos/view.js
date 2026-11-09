// Ansicht „To-dos“: Bereichs-Chips oben, Schnelleingabe, offene To-dos nach Zeit gruppiert
// (Überfällig · Heute · Diese Woche · Später · Ohne Datum), ganz unten „Erledigt“ (eingeklappt).
// Keine Kästen: jede Gruppe ist eine kleine Überschrift mit Zeilen darunter.
// Zeichnet sich neu, sobald sich To-dos oder Bereiche ändern (auch durch das andere Gerät).
import { el } from '../../ui/dom.js';
import { list } from '../../ui/list.js';
import { on } from '../../core/events.js';
import { zusatzNehmen } from '../../core/router.js';
import { TODOS, BEREICHE, ladeTodos, ladeBereiche, setzeErledigt } from './data.js';
import { sortiereOffene, sortiereErledigte } from './sortierung.js';
import { gruppiereNachZeit } from './gruppen.js';
import { ALLE, OHNE, gemerkterFilter, gueltigerFilter, passt, filterLeiste } from './filter.js';
import { todoZeile } from './zeile.js';
import { schnelleingabe } from './schnelleingabe.js';
import { oeffneBearbeiten } from './bearbeiten.js';
import { erledigtAbschnitt } from './erledigt.js';

function gruppe({ titel, todos }, zeile) {
  return el('section', { class: 'todo-gruppe' }, [
    el('h2', { class: 'todo-gruppe__titel label', text: `${titel} · ${todos.length}` }),
    list(todos.map(zeile)),
  ]);
}

export function todosAnsicht({ signal }) {
  const leiste = el('div');
  const inhalt = el('div', { class: 'todo-liste' });
  let filter = gemerkterFilter();
  let erledigtOffen = false;
  let stand = 0; // nur das Ergebnis des neuesten Zeichnens zählt

  async function zeichne() {
    const nr = ++stand;
    const [todos, bereiche] = await Promise.all([ladeTodos(), ladeBereiche()]);
    if (nr !== stand || signal.aborted) return;

    filter = gueltigerFilter(filter, bereiche);
    const bekannt = new Set(bereiche.map((b) => b.id));
    const namen = new Map(bereiche.map((b) => [b.id, b.name]));
    const sichtbar = todos.filter((t) => passt(t, filter, bekannt));

    const zeile = (todo) =>
      todoZeile(todo, {
        // Bereichsname nur, wenn „Alle“ gewählt ist; sonst steht er schon im Chip.
        bereichName: filter === ALLE ? namen.get(todo.bereich_id) : null,
        onToggle: (t, an) => setzeErledigt(t.id, an),
        onOpen: (t) => oeffneBearbeiten(t, bereiche),
      });

    leiste.replaceChildren(filterLeiste({
      bereiche,
      aktiv: filter,
      onChange: (id) => {
        filter = id;
        zeichne();
      },
    }));

    const gruppen = gruppiereNachZeit(sortiereOffene(sichtbar));
    const erledigt = erledigtAbschnitt({
      zeilen: sortiereErledigte(sichtbar).map(zeile),
      offen: erledigtOffen,
      umschalten: () => {
        erledigtOffen = !erledigtOffen;
        zeichne();
      },
    });
    inhalt.replaceChildren(
      ...(gruppen.length
        ? gruppen.map((g) => gruppe(g, zeile))
        : [el('p', { class: 'app__note', text: 'Nichts offen. Schön.' })]),
      ...(erledigt ? [erledigt] : [])
    );
  }

  on('daten', ({ table }) => {
    if (table === TODOS || table === BEREICHE) zeichne();
  }, { signal });
  zeichne();

  // Neues To-do landet im gerade gefilterten Bereich (sonst wäre es nach Enter sofort unsichtbar).
  const zielBereich = () => (filter === ALLE || filter === OHNE ? null : filter);

  const eingabe = schnelleingabe({ zielBereich });
  // „Neu → To-do“ (z. B. von Heute): gleich ins Eingabefeld
  if (zusatzNehmen() === 'neu') requestAnimationFrame(() => eingabe.querySelector('input').focus());

  return el('div', { class: 'app__stack' }, [leiste, eingabe, inhalt]);
}
