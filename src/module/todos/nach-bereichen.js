// Ansicht „Nach Bereichen“: je Bereich eine Karte mit seinen offenen To-dos
// (sortiert nach Priorität und Datum), „Ohne Bereich“ zuletzt.
import { el } from '../../ui/dom.js';
import { card } from '../../ui/card.js';
import { list } from '../../ui/list.js';
import { button } from '../../ui/button.js';
import { oeffneBereicheVerwalten } from './bereiche-verwalten.js';

// offene: schon sortiert; zeile: baut eine Listenzeile aus einem To-do.
export function nachBereichen({ offene, bereiche, zeile }) {
  const bekannt = new Set(bereiche.map((b) => b.id));
  const karte = (title, todos, leer) =>
    card({
      title,
      children: todos.length ? list(todos.map(zeile)) : el('p', { class: 'app__note', text: leer }),
    });

  const karten = bereiche.map((b) =>
    karte(b.name, offene.filter((t) => t.bereich_id === b.id), 'Nichts offen.')
  );
  // Ohne Bereich = leer oder ein Bereich, den es nicht (mehr) gibt.
  const ohne = offene.filter((t) => !bekannt.has(t.bereich_id));
  if (ohne.length || !bereiche.length) karten.push(karte('Ohne Bereich', ohne, 'Keine offenen To-dos.'));

  return el('div', { class: 'app__stack' }, [
    karten,
    el('div', { class: 'app__row' }, button({ text: 'Bereiche bearbeiten', variant: 'ghost', onClick: oeffneBereicheVerwalten })),
  ]);
}
