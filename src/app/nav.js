// Die beiden Navigationen: Seitenleiste (Mac, ab 768 px) und Tab-Leiste (iPhone).
// Beide sind normale Links auf #/<id>, der aktive Eintrag hat aria-current="page" (Neon-Akzent per CSS).
import { el } from '../ui/dom.js';
import { symbol } from '../ui/symbol.js';
import { MEHR } from './nav-plan.js';

function link(bereich, klasse, aktiv) {
  return el('a', {
    class: klasse,
    attrs: { href: `#/${bereich.id}`, 'aria-current': aktiv ? 'page' : false },
  }, [
    symbol(bereich.symbol),
    el('span', { text: bereich.titel }),
  ]);
}

export function renderSide(nav, plan, aktivId) {
  const oben = plan.alle.filter((b) => !b.ende);
  const unten = plan.alle.filter((b) => b.ende);
  nav.replaceChildren(
    el('p', { class: 'nav-side__brand', text: 'System 0' }),
    ...oben.map((b) => link(b, 'nav-side__link', b.id === aktivId)),
    unten.length > 0 && el('div', { class: 'nav-side__ende' },
      unten.map((b) => link(b, 'nav-side__link', b.id === aktivId))),
  );
}

export function renderTabs(nav, plan, aktivId) {
  const imMehr = aktivId === MEHR.id || plan.mehr.some((b) => b.id === aktivId);
  const eintraege = plan.tabs.map((b) => link(b, 'nav-tabs__link', b.id === aktivId));
  if (plan.mehr.length > 0) eintraege.push(link(MEHR, 'nav-tabs__link', imMehr));
  nav.replaceChildren(...eintraege);
}
