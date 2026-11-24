// Ansicht „Mehr“ (iPhone): Liste aller Bereiche, die nicht in die Tab-Leiste passen.
// Eigene Adresse #/mehr, damit Zurück-Wischen klappt. Nicht in der Navigation selbst.
import { el } from '../ui/dom.js';
import { list, listRow } from '../ui/list.js';
import { card } from '../ui/card.js';
import { abschnitt } from '../ui/abschnitt.js';
import { symbol } from '../ui/symbol.js';
import { alleBereiche, go } from '../core/router.js';
import { navPlan, MEHR } from './nav-plan.js';
import { oeffneSuche } from './suche.js';

// Gruppiert wie die Seitenleiste am Mac (Alltag · Körper & Kopf · System), Suche oben.
function ansicht() {
  const plan = navPlan(alleBereiche());
  const zeile = (b) => listRow({ title: b.titel, start: symbol(b.symbol), end: '›', onClick: () => go(b.id) });
  const gruppen = plan.abschnitte.map((a) => ({ titel: a.titel, bereiche: a.bereiche.filter((b) => plan.mehr.includes(b)) }))
    .filter((a) => a.bereiche.length);
  return el('div', { class: 'app__stack' }, [
    card({ children: list([listRow({ title: 'Suchen …', start: symbol('suche'), onClick: oeffneSuche })]) }),
    ...gruppen.map((a) => el('section', { class: 'app__stack mehr-gruppe' }, [
      abschnitt({ titel: a.titel.charAt(0) + a.titel.slice(1).toLowerCase(), tag: 'h2' }),
      card({ children: list(a.bereiche.map(zeile)) }),
    ])),
  ]);
}

export const mehrBereich = { ...MEHR, nav: false, ansicht };
