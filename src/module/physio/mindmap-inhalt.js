// Inhalt des Mindmap-Overlays: drei Ansichten und der Verlauf.
//   suche – Suchfeld, Treffer, Anlegen (suche.js)
//   karte – Fokus-Karte um den gewählten Punkt (fokus.js)
//   liste – alle Verknüpfungen der Mitte, wenn nicht alle auf die Karte passen
// Verlauf: jeder Wechsel der Mitte merkt sich den vorigen Punkt; „‹ Zurück“ geht dorthin.
// const m = mindmapInhalt({ zurueckKnopf, sucheKnopf }); m.daten(eintraege, links);
import { el } from '../../ui/dom.js';
import { list } from '../../ui/list.js';
import { nachbarn } from './daten.js';
import { suchAnsicht, trefferZeile } from './suche.js';
import { fokusKarte } from './fokus.js';

const MAX_VERLAUF = 50;

export function mindmapInhalt({ zurueckKnopf, sucheKnopf }) {
  // stand wird mit suche.js geteilt (eintraege, suchtext)
  const stand = { eintraege: [], links: [], suchtext: '' };
  let mitteId = null;
  let ansicht = 'suche';
  let verlauf = [];
  const element = el('div', { class: 'mm__inhalt' });
  const karte = fokusKarte({ waehle, zeigeAlle: () => wechsle('liste') });

  function waehle(id) {
    if (mitteId && mitteId !== id) verlauf = [...verlauf, mitteId].slice(-MAX_VERLAUF);
    mitteId = id;
    wechsle('karte');
  }

  function wechsle(neu) {
    ansicht = neu;
    zeige();
  }

  function zurueck() {
    if (ansicht === 'suche' || ansicht === 'liste') return wechsle('karte');
    if (verlauf.length) {
      mitteId = verlauf.at(-1);
      verlauf = verlauf.slice(0, -1);
      return wechsle('karte');
    }
    mitteId = null;
    wechsle('suche');
  }

  function leiste() {
    // unsichtbar statt entfernt, damit „Mindmap“ in der Leiste mittig bleibt
    const zurueckDa = ansicht !== 'suche' || mitteId;
    zurueckKnopf.style.visibility = zurueckDa ? '' : 'hidden';
    zurueckKnopf.textContent = ansicht === 'karte' && !verlauf.length ? 'Suche' : 'Zurück';
    sucheKnopf.style.visibility = ansicht === 'suche' ? 'hidden' : '';
  }

  function liste() {
    const mitte = stand.eintraege.find((e) => e.id === mitteId);
    return el('div', { class: 'mm-suche' }, [
      el('p', { class: 'label', text: `Verknüpft mit ${mitte.titel}` }),
      list(nachbarn(mitteId, stand.eintraege, stand.links).map((e) => trefferZeile(e, waehle))),
    ]);
  }

  function zeige() {
    // Punkte, die es nicht mehr gibt (z. B. auf dem anderen Gerät gelöscht), fallen raus.
    const da = new Set(stand.eintraege.map((e) => e.id));
    verlauf = verlauf.filter((id) => da.has(id));
    if (mitteId && !da.has(mitteId)) {
      mitteId = verlauf.pop() ?? null;
      if (!mitteId && ansicht !== 'suche') ansicht = 'suche';
    }
    if (!mitteId && ansicht !== 'suche') ansicht = 'suche';
    leiste();
    element.classList.toggle('mm__inhalt--karte', ansicht === 'karte');

    if (ansicht === 'karte') {
      if (element.firstChild !== karte.element) element.replaceChildren(karte.element);
      karte.zeige(stand.eintraege, stand.links, mitteId);
    } else if (ansicht === 'liste') {
      element.replaceChildren(liste());
    } else if (element.firstChild?.classList.contains('mm-suche--feld')) {
      element.firstChild.aktualisiere(); // Suche neu zeichnen, Fokus und Text bleiben
    } else {
      element.replaceChildren(suchAnsicht({ stand, waehle }));
    }
  }

  zurueckKnopf.addEventListener('click', zurueck);
  sucheKnopf.addEventListener('click', () => wechsle('suche'));

  function daten(eintraege, links) {
    Object.assign(stand, { eintraege, links });
    zeige();
  }

  return { element, daten };
}
