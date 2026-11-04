// Rahmen der App nach dem Login: Navigation + Inhalt des aktiven Bereichs.
// const s = shell(); app.append(s.element); … s.destroy() beim Abmelden.
import { el } from '../ui/dom.js';
import { kopfbild } from '../ui/kopfbild.js';
import { spruchDesTages, desTages } from '../core/sprueche.js';
import { on } from '../core/events.js';
import { alleBereiche, aktuelleRoute } from '../core/router.js';
import { navPlan } from './nav-plan.js';
import { renderSide, renderTabs } from './nav.js';

export function shell() {
  const rahmen = new AbortController(); // endet, wenn der Rahmen verschwindet
  let ansicht = null; // endet, wenn der Bereich gewechselt wird

  const side = el('nav', { class: 'nav-side', attrs: { 'aria-label': 'Bereiche' } });
  const tabs = el('nav', { class: 'nav-tabs', attrs: { 'aria-label': 'Bereiche' } });
  const inhalt = el('div', { class: 'app' });
  // Markenzeile oben (nur iPhone; auf dem Mac steht sie in der Seitenleiste)
  const marke = el('p', { class: 'marke shell__marke', text: 'System 0' });
  const element = el('div', { class: 'shell' }, [
    side,
    el('main', { class: 'shell__main' }, [marke, inhalt]),
    tabs,
  ]);

  function zeigeNav() {
    const plan = navPlan(alleBereiche());
    const id = aktuelleRoute()?.id;
    renderSide(side, plan, id);
    renderTabs(tabs, plan, id);
  }

  function zeigeBereich() {
    const bereich = aktuelleRoute();
    if (!bereich) return;
    ansicht?.abort();
    ansicht = new AbortController();
    document.title = `${bereich.titel} · System 0`;
    // Bereichsfarbe für den Schimmer (Token --farbe-<id>, sonst Standard).
    element.style.setProperty('--bereich', `var(--farbe-${bereich.id}, var(--farbe-standard))`);
    // Kopf: großer Titel, Strich, Spruch des Tages (je Bereich ein anderer), optional Bild und Zeile darüber
    const versatz = Math.max(0, alleBereiche().indexOf(bereich));
    inhalt.replaceChildren(
      kopfbild({
        titel: bereich.titel,
        // bild darf eine Liste sein: dann täglich eine andere Variante
        bild: Array.isArray(bereich.bild) ? desTages(bereich.bild) : bereich.bild,
        ueber: bereich.ueber?.(),
        spruch: spruchDesTages(versatz),
      }),
      bereich.ansicht({ signal: ansicht.signal }),
    );
    window.scrollTo(0, 0);
    zeigeNav();
  }

  on('route', zeigeBereich, { signal: rahmen.signal });
  on('bereiche', zeigeNav, { signal: rahmen.signal });
  zeigeBereich();
  zeigeNav();

  function destroy() {
    ansicht?.abort();
    rahmen.abort();
    document.title = 'System 0';
  }

  return { element, destroy };
}
