// Ansicht „Mehr“ (iPhone): Liste aller Bereiche, die nicht in die Tab-Leiste passen.
// Eigene Adresse #/mehr, damit Zurück-Wischen klappt. Nicht in der Navigation selbst.
import { el } from '../ui/dom.js';
import { list, listRow } from '../ui/list.js';
import { card } from '../ui/card.js';
import { symbol } from '../ui/symbol.js';
import { alleBereiche, go } from '../core/router.js';
import { navPlan, MEHR } from './nav-plan.js';
import { oeffneSuche } from './suche.js';

function ansicht() {
  const { mehr } = navPlan(alleBereiche());
  const suchen = listRow({ title: 'Suchen …', start: symbol('suche'), onClick: oeffneSuche });
  return card({
    children: list([suchen, ...mehr.map((b) => listRow({
      title: b.titel,
      start: symbol(b.symbol),
      end: '›',
      onClick: () => go(b.id),
    }))]),
  });
}

export const mehrBereich = { ...MEHR, nav: false, ansicht };
