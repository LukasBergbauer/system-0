// Ansicht „To-dos“: Umschalter „Nach Priorität“ / „Nach Bereichen“, Schnelleingabe,
// offene To-dos, darunter „Erledigt“ (eingeklappt).
// Zeichnet sich neu, sobald sich To-dos oder Bereiche ändern (auch durch das andere Gerät).
import { el } from '../../ui/dom.js';
import { card } from '../../ui/card.js';
import { list } from '../../ui/list.js';
import { tabs } from '../../ui/tabs.js';
import { on } from '../../core/events.js';
import { TODOS, BEREICHE, ladeTodos, ladeBereiche, setzeErledigt } from './data.js';
import { sortiereOffene, sortiereErledigte } from './sortierung.js';
import { todoZeile } from './zeile.js';
import { schnelleingabe } from './schnelleingabe.js';
import { oeffneBearbeiten } from './bearbeiten.js';
import { erledigtAbschnitt } from './erledigt.js';
import { nachBereichen } from './nach-bereichen.js';

// Gewählte Ansicht nur auf diesem Gerät merken.
const MERKER = 'system0-todos-ansicht';
const ANSICHTEN = [
  { id: 'prio', label: 'Nach Priorität' },
  { id: 'bereiche', label: 'Nach Bereichen' },
];

function gemerkteAnsicht() {
  try {
    const wert = localStorage.getItem(MERKER);
    return ANSICHTEN.some((a) => a.id === wert) ? wert : 'prio';
  } catch {
    return 'prio';
  }
}

function merke(wert) {
  try {
    localStorage.setItem(MERKER, wert);
  } catch {
    // Speichern nicht möglich (z. B. privater Modus): dann eben Standard beim nächsten Mal.
  }
}

function nachPrioritaet(offene, zeile) {
  return offene.length
    ? card({ children: list(offene.map(zeile)) })
    : card({ children: el('p', { class: 'app__note', text: 'Keine offenen To-dos.' }) });
}

export function todosAnsicht({ signal }) {
  const inhalt = el('div', { class: 'app__stack' });
  let ansicht = gemerkteAnsicht();
  let erledigtOffen = false;
  let stand = 0; // nur das Ergebnis des neuesten Zeichnens zählt

  async function zeichne() {
    const nr = ++stand;
    const [todos, bereiche] = await Promise.all([ladeTodos(), ladeBereiche()]);
    if (nr !== stand || signal.aborted) return;

    const namen = new Map(bereiche.map((b) => [b.id, b.name]));
    const zeile = (todo) =>
      todoZeile(todo, {
        // In der Bereichs-Ansicht steht der Bereich schon in der Kartenüberschrift.
        bereichName: ansicht === 'prio' ? namen.get(todo.bereich_id) : null,
        onToggle: (t, an) => setzeErledigt(t.id, an),
        onOpen: (t) => oeffneBearbeiten(t, bereiche),
      });

    const offene = sortiereOffene(todos);
    inhalt.replaceChildren(
      ansicht === 'bereiche' ? nachBereichen({ offene, bereiche, zeile }) : nachPrioritaet(offene, zeile),
      erledigtAbschnitt({
        zeilen: sortiereErledigte(todos).map(zeile),
        offen: erledigtOffen,
        umschalten: () => {
          erledigtOffen = !erledigtOffen;
          zeichne();
        },
      }) ?? []
    );
  }

  const umschalter = tabs({
    items: ANSICHTEN,
    active: ansicht,
    onChange: (id) => {
      ansicht = id;
      merke(id);
      zeichne();
    },
  });

  on('daten', ({ table }) => {
    if (table === TODOS || table === BEREICHE) zeichne();
  }, { signal });
  zeichne();

  return el('div', { class: 'app__stack' }, [umschalter, schnelleingabe(), inhalt]);
}
