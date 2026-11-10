// Einstellungen: große Kachel „Verlauf“ – aufklappbar, Stichpunkte aus verlauf.js (wie System 0 entstanden ist).
import { el } from '../ui/dom.js';
import { kachel } from '../ui/kachel.js';
import { VERLAUF } from './verlauf.js';

export function verlaufKachel() {
  const inhalt = VERLAUF.flatMap(({ datum, punkte }) => [
    el('h3', { class: 'verlauf__datum label', text: datum }),
    el('ul', { class: 'verlauf__liste' }, punkte.map((p) => el('li', { text: p }))),
  ]);
  return kachel({
    symbol: 'verlauf',
    titel: 'Verlauf',
    text: 'Wie System 0 entstanden ist',
    gross: true,
    children: el('details', { class: 'verlauf' }, [el('summary', { class: 'verlauf__auf' }), ...inhalt]),
  });
}
