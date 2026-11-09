// Kosmos: Startseite von Physio, gebaut aus derselben Fokus-Karte wie die Mindmap (fokus.js).
// Gedachte Punkte: Kern „Physio“ ↔ je Art ein Ball ↔ alle Einträge dieser Art; dazu die echten Verknüpfungen.
// So kann man sich weiterhangeln: Ball außen antippen → schwebt in die Mitte, seine Verknüpfungen tauchen auf.
// Mitte antippen → anderes Interface, immer das Mindmap-Overlay: Kern = Suche, Art = Liste der Art, Eintrag = sein Text.
import { el } from '../../ui/dom.js';
import { ARTEN } from './arten.js';
import { fokusKarte } from './fokus.js';
import { oeffneMindmap } from './overlay.js';

const KERN = 'physio';
const artId = (a) => `art:${a}`;
const zahl = (n) => (n === 1 ? '1 Eintrag' : `${n} Einträge`);

export function kosmos({ signal }) {
  let mitteId = KERN;
  let daten = { eintraege: [], links: [], bilder: [] };

  const karte = fokusKarte({
    waehle: (id) => { mitteId = id; zeige(); },
    zeigeAlle: () => (mitteId.startsWith('art:') ? oeffneMindmap({ signal, art: mitteId.slice(4) }) : oeffneMindmap({ signal, mitteId })),
    mitteTippen: (id, knopf) => {
      if (id === KERN) oeffneMindmap({ ausKnopf: knopf, signal });
      else if (id.startsWith('art:')) oeffneMindmap({ ausKnopf: knopf, signal, art: id.slice(4) });
      else oeffneMindmap({ ausKnopf: knopf, signal, mitteId: id, ansicht: 'eintrag' });
    },
    verknuepfen() {}, oeffnen() {}, loesen() {},
  });
  karte.element.dataset.mmStart = ''; // Mindmap schrumpft beim Schließen hierhin zurück
  const buehne = el('div', { class: 'kos' }, [el('span', { class: 'kos__staub' }), karte.element]);

  function zeige() {
    if (mitteId !== KERN && !daten.eintraege.some((e) => e.id === mitteId)) mitteId = KERN; // gelöscht
    karte.zeige(daten.eintraege, daten.links, mitteId, daten.bilder);
  }

  return {
    element: buehne,
    daten(eintraege, links, bilder) {
      const kern = { id: KERN, art: 'kern', titel: 'Physio', label: 'Mindmap', kurz: '' };
      const arten = ARTEN.map((a) => ({
        id: artId(a.id), art: 'pfad', titel: a.mehrzahl, label: zahl(eintraege.filter((e) => e.art === a.id).length), kurz: '',
      }));
      daten = {
        eintraege: [kern, ...arten, ...eintraege],
        links: [
          ...arten.map((a) => ({ a_id: KERN, b_id: a.id })),
          ...eintraege.map((e) => ({ a_id: artId(e.art), b_id: e.id })),
          ...links,
        ],
        bilder,
      };
      zeige();
    },
  };
}
