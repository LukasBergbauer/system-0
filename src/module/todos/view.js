// Ansicht „To-dos“: Bereichs-Chips oben, Schnelleingabe, offene To-dos nach Zeit gruppiert
// (Überfällig · Heute · Diese Woche · Später · Ohne Datum), ganz unten „Erledigt“ (eingeklappt).
// Keine Kästen: jede Gruppe ist eine kleine Überschrift mit Zeilen darunter.
// Zeichnet sich neu, sobald sich To-dos oder Bereiche ändern (auch durch das andere Gerät).
import { abschnitt } from '../../ui/abschnitt.js';
import { el } from '../../ui/dom.js';
import { list } from '../../ui/list.js';
import { on } from '../../core/events.js';
import { zusatzNehmen } from '../../core/router.js';
import { TODOS, BEREICHE, ladeTodos, ladeBereiche, setzeErledigt, loescheTodo, holeZurueck } from './data.js';
import { wischbar, rueckgaengig } from './wischen.js';
import { sortiereOffene, sortiereErledigte } from './sortierung.js';
import { gruppiereNachZeit } from './gruppen.js';
import { ALLE, OHNE, gemerkterFilter, gueltigerFilter, passt, filterLeiste } from './filter.js';
import { todoZeile } from './zeile.js';
import { schnelleingabe } from './schnelleingabe.js';
import { oeffneBearbeiten } from './bearbeiten.js';
import { erledigtAbschnitt } from './erledigt.js';

function gruppe({ titel, todos }, zeile) {
  return el('section', { class: 'todo-gruppe' }, [
    abschnitt({ titel, zahl: todos.length, symbol: 'todos' }),
    list(todos.map(zeile)),
  ]);
}

export function todosAnsicht({ signal }) {
  const leiste = el('div');
  const inhalt = el('div', { class: 'todo-liste' });
  let filter = gemerkterFilter();
  let erledigtOffen = false;
  let aeltereZeigen = false; // Erledigte älter als 30 Tage
  let alleBereiche = [];
  let stand = 0; // nur das Ergebnis des neuesten Zeichnens zählt
  // Zusatz von außen: 'neu' = Fokus in die Schnelleingabe, sonst die id eines To-dos (Suche) = gleich bearbeiten
  let zusatz = zusatzNehmen();

  async function zeichne() {
    const nr = ++stand;
    const [todos, bereiche] = await Promise.all([ladeTodos(), ladeBereiche()]);
    if (nr !== stand || signal.aborted) return;

    alleBereiche = bereiche;
    filter = gueltigerFilter(filter, bereiche);
    eingabe.auffrischen();
    const bekannt = new Set(bereiche.map((b) => b.id));
    const namen = new Map(bereiche.map((b) => [b.id, b.name]));
    const sichtbar = todos.filter((t) => passt(t, filter, bekannt));
    if (zusatz && zusatz !== 'neu') {
      const gesucht = todos.find((t) => t.id === zusatz);
      zusatz = null;
      if (gesucht) oeffneBearbeiten(gesucht, bereiche);
    }

    const zeile = (todo) => wischbar(
      todoZeile(todo, {
        // Bereichsname nur, wenn „Alle“ gewählt ist; sonst steht er schon im Chip.
        bereichName: filter === ALLE ? namen.get(todo.bereich_id) : null,
        onToggle: (t, an) => setzeErledigt(t.id, an),
        onOpen: (t) => oeffneBearbeiten(t, bereiche),
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

    leiste.replaceChildren(filterLeiste({
      bereiche,
      aktiv: filter,
      onChange: (id) => {
        filter = id;
        zeichne();
      },
    }));

    const gruppen = gruppiereNachZeit(sortiereOffene(sichtbar));
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
    inhalt.replaceChildren(
      ...(gruppen.length
        ? gruppen.map((g) => gruppe(g, zeile))
        : [el('p', { class: 'app__note', text: 'Nichts offen. Schön.' })]),
      ...(erledigt ? [erledigt] : [])
    );
  }

  // Neues To-do landet im gerade gefilterten Bereich (sonst wäre es nach Enter sofort unsichtbar).
  const zielBereich = () => (filter === ALLE || filter === OHNE ? null : filter);
  const eingabe = schnelleingabe({ zielBereich, bereiche: () => alleBereiche });
  // „Neu → To-do“ (z. B. von Heute): gleich ins Eingabefeld
  if (zusatz === 'neu') requestAnimationFrame(() => eingabe.fokus());

  on('daten', ({ table }) => {
    if (table === TODOS || table === BEREICHE) zeichne();
  }, { signal });
  zeichne();

  return el('div', { class: 'app__stack' }, [leiste, eingabe, inhalt]);
}
