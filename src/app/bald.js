// Platzhalter für Bereiche, die noch kommen (bald: true): stehen schon in der Seitenleiste,
// zeigen eine Seite „Kommt bald“. Meldet sich ein echtes Modul mit derselben id an, ersetzt es den Platzhalter
// (der Router merkt sich pro id nur einen Bereich). Nicht in der Tab-Leiste des iPhones (nav-plan.js).
import { el } from '../ui/dom.js';
import { card } from '../ui/card.js';
import { register, alleBereiche } from '../core/router.js';

const BALD = [
  { id: 'ziele', titel: 'Ziele', symbol: 'ziele' },
];

const ansicht = () => card({
  children: [el('p', { class: 'app__note', text: 'Kommt bald. Dieser Bereich wird gerade gebaut.' })],
});

for (const b of BALD) {
  if (!alleBereiche().some((x) => x.id === b.id)) register({ ...b, bald: true, ansicht });
}
