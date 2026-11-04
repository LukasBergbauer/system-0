// Gewählter Punkt in der Mitte des Overlays.
// Teil b: nur der Punkt selbst (Art, Titel, Kurzbeschreibung, Anzahl Verknüpfungen).
// Teil c ersetzt das durch die Fokus-Karte mit den Nachbarn ringsum.
import { el } from '../../ui/dom.js';
import { art } from './arten.js';
import { nachbarn } from './daten.js';

export function mitteAnsicht({ eintrag, eintraege, links }) {
  const n = nachbarn(eintrag.id, eintraege, links).length;
  return el('div', { class: 'mm-mitte' }, [
    el('div', { class: 'mm-punkt mm-punkt--mitte' }, [
      el('span', { class: 'label', text: art(eintrag.art).name }),
      el('span', { class: 'mm-punkt__titel', text: eintrag.titel }),
    ]),
    eintrag.kurz && el('p', { class: 'mm-mitte__kurz', text: eintrag.kurz }),
    el('p', { class: 'app__note', text: n === 1 ? '1 Verknüpfung' : `${n} Verknüpfungen` }),
  ]);
}
