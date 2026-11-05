// Inhalt des Mindmap-Overlays: sechs Ansichten, gesteuert über den Verlauf (mm-verlauf.js).
//   suche       – Suchfeld, Treffer, Anlegen (suche.js)
//   karte       – Fokus-Karte um den gewählten Punkt (fokus.js)
//   liste       – alle Verknüpfungen der Mitte, wenn nicht alle auf die Karte passen
//   verknuepfen – vorhandenen Punkt suchen oder neuen anlegen, beides wird mit der Mitte verknüpft (verknuepfen.js)
//   eintrag     – die Mitte mit allen Feldern und Bildern, direkt bearbeitbar (eintrag.js)
//   bild        – ein Bild der Mitte groß, mit „Als Titelbild“ und „Löschen“ (bild-gross.js)
// Jeder Wechsel ist ein Schritt im Verlauf; „‹ Zurück“ und Zurück-Wischen gehen einen Schritt zurück.
// const m = mindmapInhalt({ zurueckKnopf, sucheKnopf }); m.start(); m.daten(eintraege, links, bilder);
import { el } from '../../ui/dom.js';
import { list } from '../../ui/list.js';
import { nachbarn, loese } from './daten.js';
import { suchAnsicht, trefferZeile } from './suche.js';
import { verknuepfenAnsicht } from './verknuepfen.js';
import { eintragAnsicht } from './eintrag.js';
import { bildGross } from './bild-gross.js';
import { bilderVon } from './bilder.js';
import { fokusKarte } from './fokus.js';
import { mmVerlauf } from './mm-verlauf.js';

const MIT_MITTE = ['karte', 'liste', 'verknuepfen', 'eintrag', 'bild'];

export function mindmapInhalt({ zurueckKnopf, sucheKnopf }) {
  // stand wird mit suche.js und verknuepfen.js geteilt (eintraege, suchtext)
  const stand = { eintraege: [], links: [], bilder: [], suchtext: '' };
  let schritt = { ansicht: 'suche', mitteId: null };
  const element = el('div', { class: 'mm__inhalt' });
  const verlauf = mmVerlauf((s) => { schritt = s; zeige(); });

  // extra: z. B. { bildId } für die Großansicht
  const geheZu = (ansicht, mitteId = schritt.mitteId, extra = {}) => {
    schritt = { ansicht, mitteId, ...extra };
    verlauf.weiter(schritt);
    zeige();
  };
  const waehle = (id) => geheZu('karte', id);

  const karte = fokusKarte({
    waehle,
    zeigeAlle: () => geheZu('liste'),
    verknuepfen: () => geheZu('verknuepfen'),
    oeffnen: () => geheZu('eintrag'),
    loesen: async (mitte, nachbar) => {
      if (confirm(`Verknüpfung lösen?\n\n${mitte.titel} – ${nachbar.titel}`)) await loese(mitte.id, nachbar.id);
    },
  });

  function leiste() {
    // unsichtbar statt entfernt, damit „Mindmap“ in der Leiste mittig bleibt
    zurueckKnopf.style.visibility = verlauf.tiefe() > 0 ? '' : 'hidden';
    zurueckKnopf.textContent = verlauf.vorher()?.ansicht === 'suche' ? 'Suche' : 'Zurück';
    sucheKnopf.style.visibility = schritt.ansicht === 'suche' ? 'hidden' : '';
  }

  function liste(mitte) {
    return el('div', { class: 'mm-suche' }, [
      el('p', { class: 'label', text: `Verknüpft mit ${mitte.titel}` }),
      list(nachbarn(mitte.id, stand.eintraege, stand.links).map((e) => trefferZeile(e, waehle))),
    ]);
  }

  function zeige() {
    const mitte = stand.eintraege.find((e) => e.id === schritt.mitteId);
    // Punkt gibt es nicht mehr (z. B. auf dem anderen Gerät gelöscht) → Suche zeigen
    let ansicht = MIT_MITTE.includes(schritt.ansicht) && !mitte ? 'suche' : schritt.ansicht;
    const bilder = mitte ? bilderVon(mitte.id, stand.bilder) : [];
    const bild = bilder.find((b) => b.id === schritt.bildId);
    if (ansicht === 'bild' && !bild) ansicht = 'eintrag'; // Bild inzwischen gelöscht
    leiste();
    element.classList.toggle('mm__inhalt--karte', ansicht === 'karte');

    if (ansicht === 'karte') {
      if (element.firstChild !== karte.element) element.replaceChildren(karte.element);
      karte.zeige(stand.eintraege, stand.links, mitte.id);
    } else if (ansicht === 'liste') {
      element.replaceChildren(liste(mitte));
    } else if (ansicht === 'verknuepfen') {
      // nicht neu bauen, solange man tippt (Daten können zwischendurch vom anderen Gerät kommen)
      if (element.firstChild?.dataset.mitte !== mitte.id) {
        element.replaceChildren(verknuepfenAnsicht({ stand, mitte, fertig: () => verlauf.zurueck() }));
      }
    } else if (ansicht === 'eintrag') {
      // nicht neu bauen, solange man schreibt (eigene Änderungen kommen ja auch als Ereignis zurück)
      if (element.firstChild?.dataset.eintrag !== mitte.id) {
        element.replaceChildren(eintragAnsicht({
          eintrag: mitte, bilder, geloescht: () => verlauf.zurueck(),
          oeffneBild: (b) => geheZu('bild', mitte.id, { bildId: b.id }),
        }));
      } else {
        element.firstChild.zeigeBilder(bilder); // nur die Bildleiste auffrischen
      }
    } else if (ansicht === 'bild') {
      element.replaceChildren(bildGross({ bild, bilder, fertig: () => verlauf.zurueck() }));
    } else if (element.firstChild?.classList.contains('mm-suche--feld')) {
      element.firstChild.aktualisiere(); // Suche neu zeichnen, Fokus und Text bleiben
    } else {
      element.replaceChildren(suchAnsicht({ stand, waehle }));
    }
  }

  zurueckKnopf.addEventListener('click', () => verlauf.zurueck());
  sucheKnopf.addEventListener('click', () => geheZu('suche'));

  return {
    element,
    start: () => verlauf.start(schritt),
    popstate: (state) => verlauf.popstate(state),
    verlassen: () => verlauf.verlassen(),
    daten(eintraege, links, bilder) {
      Object.assign(stand, { eintraege, links, bilder });
      zeige();
    },
  };
}
