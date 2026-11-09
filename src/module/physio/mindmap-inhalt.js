// Inhalt des Mindmap-Overlays: sechs Ansichten, gesteuert über den Verlauf (mm-verlauf.js).
//   suche       – Suchfeld, Treffer, Anlegen (suche.js)
//   karte       – Fokus-Karte um den gewählten Punkt (fokus.js)
//   liste       – alle Verknüpfungen der Mitte, wenn nicht alle auf die Karte passen
//   verknuepfen – vorhandenen Punkt suchen oder neuen anlegen, beides wird mit der Mitte verknüpft (verknuepfen.js)
//   eintrag     – die Mitte mit allen Feldern und Bildern, direkt bearbeitbar (eintrag.js)
//   bild        – ein Bild der Mitte groß, mit „Als Titelbild“ und „Löschen“ (bild-gross.js)
// Jeder Wechsel ist ein Schritt im Verlauf; „‹ Zurück“ und Zurück-Wischen gehen einen Schritt zurück.
// const m = mindmapInhalt({ zurueckKnopf, sucheKnopf, mitteId }); m.start(); m.daten(eintraege, links, bilder);
// art (optional) = mit der Liste dieser Art starten (Kosmos); mitteId (optional) = mit der Fokus-Karte dieses Punkts starten (oder gleich mit ansicht, z. B. 'eintrag'); lernpfad = dabei als Lernpfad (lernpfad.js).
// Im Lernpfad trägt jeder Schritt pfad (ids bis zur Mitte); Antippen hängt den Punkt an, Suche beendet ihn.
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
import { naechste, pfadLeiste } from './lernpfad.js';

const MIT_MITTE = ['karte', 'liste', 'verknuepfen', 'eintrag', 'bild'];

export function mindmapInhalt({ zurueckKnopf, sucheKnopf, mitteId = null, lernpfad = false, ansicht = 'karte', art = null }) {
  // stand wird mit suche.js und verknuepfen.js geteilt (eintraege, suchtext)
  const stand = { eintraege: [], links: [], bilder: [], suchtext: '' };
  let schritt = mitteId ? { ansicht, mitteId, pfad: lernpfad ? [mitteId] : null } : { ansicht: 'suche', mitteId: null, art };
  const element = el('div', { class: 'mm__inhalt' });
  const verlauf = mmVerlauf((s) => { schritt = s; zeige(); });

  // extra: z. B. { bildId } für die Großansicht
  const geheZu = (ansicht, mitteId = schritt.mitteId, extra = {}) => {
    schritt = { ansicht, mitteId, pfad: schritt.pfad, ...extra };
    verlauf.weiter(schritt);
    zeige();
  };
  // Lernpfad: im Pfad hängt Antippen an; aus der Liste „Regionen“ beginnt ein neuer Pfad
  const waehle = (id) => {
    if (schritt.ansicht === 'suche') return geheZu('karte', id, { pfad: schritt.art === 'region' ? [id] : null });
    geheZu('karte', id, { pfad: schritt.pfad ? [...schritt.pfad, id] : null });
  };

  const karte = fokusKarte({
    waehle,
    zeigeAlle: () => geheZu('liste'),
    verknuepfen: () => geheZu('verknuepfen'),
    oeffnen: () => geheZu('eintrag'),
    mitteTippen: () => geheZu('eintrag'),
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
    element.classList.toggle('mm__inhalt--pfad', ansicht === 'karte' && Boolean(schritt.pfad));

    if (ansicht === 'karte') {
      const pfad = schritt.pfad;
      const nur = pfad && naechste(pfad, stand.eintraege, stand.links);
      // Karte selbst nicht neu einhängen (sonst springt das Gleiten), nur die Pfad-Leiste dahinter tauschen
      if (element.firstChild !== karte.element) element.replaceChildren(karte.element);
      if (element.lastChild !== karte.element) element.lastChild.remove();
      if (pfad) {
        element.append(pfadLeiste({
          pfad, eintraege: stand.eintraege, weiter: nur.size > 0,
          gehe: (i) => geheZu('karte', pfad[i], { pfad: pfad.slice(0, i + 1) }),
          beenden: () => geheZu('karte', mitte.id, { pfad: null }),
        }));
      }
      karte.zeige(stand.eintraege, stand.links, mitte.id, stand.bilder, nur);
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
    } else if (element.firstChild?.classList.contains('mm-suche--feld') && element.firstChild.dataset.art === (schritt.art ?? '')) {
      element.firstChild.aktualisiere(); // Suche neu zeichnen, Fokus und Text bleiben
    } else {
      element.replaceChildren(suchAnsicht({ stand, waehle, art: schritt.art }));
    }
  }

  zurueckKnopf.addEventListener('click', () => verlauf.zurueck());
  sucheKnopf.addEventListener('click', () => geheZu('suche', schritt.mitteId, { pfad: null }));

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
