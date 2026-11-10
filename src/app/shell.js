// Rahmen der App nach dem Login: Navigation + Inhalt des aktiven Bereichs.
// const s = shell(); app.append(s.element); … s.destroy() beim Abmelden.
import { el } from '../ui/dom.js';
import { kopfbild } from '../ui/kopfbild.js';
import { spruchDesTages } from '../core/sprueche.js';
import { on } from '../core/events.js';
import { getAll } from '../core/store.js';
import { syncStatus } from '../core/sync.js';
import { alleBereiche, aktuelleRoute } from '../core/router.js';
import { navPlan } from './nav-plan.js';
import { renderSide, renderTabs, leisteKlappen } from './nav.js';
import { sucheTaste, oeffneSuche } from './suche.js';

export function shell() {
  const rahmen = new AbortController(); // endet, wenn der Rahmen verschwindet
  let ansicht = null; // endet, wenn der Bereich gewechselt wird

  const side = el('nav', { class: 'nav-side', attrs: { 'aria-label': 'Bereiche' } });
  const tabs = el('nav', { class: 'nav-tabs', attrs: { 'aria-label': 'Bereiche' } });
  const inhalt = el('div', { class: 'app' });
  const element = el('div', { class: 'shell' }, [
    side,
    el('main', { class: 'shell__main' }, [inhalt]),
    tabs,
  ]);
  leisteKlappen(side, element, rahmen.signal);

  let zahlen = {}; // kleine Zahlen in der Seitenleiste: offene To-dos

  function zeigeNav() {
    const plan = navPlan(alleBereiche());
    const id = aktuelleRoute()?.id;
    renderSide(side, plan, id, { zahlen, sync: syncStatus() });
    renderTabs(tabs, plan, id);
  }

  function zeigeBereich() {
    const bereich = aktuelleRoute();
    if (!bereich) return;
    ansicht?.abort();
    ansicht = new AbortController();
    document.title = `${bereich.titel} · System 0`;
    // Kopf: großer Titel, Zeile darüber und Spruch des Tages. Kopfbilder (Steine) sind pausiert.
    // dashboard: true (Heute) = eigener Kopf und breite Fläche statt der schmalen Spalte
    const versatz = Math.max(0, alleBereiche().indexOf(bereich));
    inhalt.classList.toggle('app--breit', Boolean(bereich.dashboard));
    element.classList.toggle('shell--schieben', Boolean(bereich.dashboard)); // Heute: offene Leiste schiebt den Inhalt
    inhalt.dataset.bereich = bereich.id; // Bereichsfarbe (--bereich, tokens.css) für Titel und Akzente der Seite
    const kopf = bereich.dashboard ? [] : [kopfbild({
      titel: bereich.titel,
      symbol: bereich.symbol,
      ueber: bereich.ueber?.(),
      spruch: bereich.spruch ? spruchDesTages(versatz) : null, // nur wo gewünscht
    })];
    inhalt.replaceChildren(...kopf, bereich.ansicht({ signal: ansicht.signal }));
    window.scrollTo(0, 0);
    zeigeNav();
  }

  async function zaehlen(detail) {
    if (detail?.table && detail.table !== 'todos') return;
    zahlen = { todos: (await getAll('todos')).filter((t) => !t.erledigt_am).length };
    zeigeNav();
  }

  on('route', zeigeBereich, { signal: rahmen.signal });
  sucheTaste(rahmen.signal);
  on('suche', oeffneSuche, { signal: rahmen.signal }); // z. B. Lupe auf Heute (iPhone)
  on('bereiche', zeigeNav, { signal: rahmen.signal });
  on('sync', zeigeNav, { signal: rahmen.signal });
  on('daten', zaehlen, { signal: rahmen.signal });
  zeigeBereich();
  zaehlen();

  function destroy() {
    ansicht?.abort();
    rahmen.abort();
    document.title = 'System 0';
  }

  return { element, destroy };
}
