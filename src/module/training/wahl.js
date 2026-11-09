// Modal „Übung wählen“: Suche über eigene Übungen, Übungen aus dem PhysioZentrum und Hyrox-Vorlagen.
// Physio-Übung oder Vorlage wählen legt die eigene Übung (Verweis) erst dann an.
// const u = await waehleUebung(daten) → Übung oder null (geschlossen).
import { el } from '../../ui/dom.js';
import { modal } from '../../ui/modal.js';
import { input } from '../../ui/input.js';
import { list, listRow } from '../../ui/list.js';
import { HYROX, neueUebung, uebungZuPhysio } from './daten.js';

const norm = (t) => (t || '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const MAX = 40;

export function waehleUebung({ uebungen, physioUebungen }) {
  return new Promise((fertig) => {
    let ergebnis = null;
    const feld = input({ placeholder: 'Übung suchen oder neu …', onInput: zeige });
    const suche = feld.querySelector('input');
    const treffer = el('div', { class: 'training-wahl' });
    const m = modal({ title: 'Übung hinzufügen', content: [feld, treffer] });

    const eigene = [...uebungen.values()].sort((a, b) => a.name.localeCompare(b.name, 'de'));
    const verknuepft = new Set(eigene.map((u) => u.physio_id).filter(Boolean));
    const namen = new Set(eigene.map((u) => norm(u.name)));

    async function nimm(machen) {
      ergebnis = await machen();
      m.close();
    }

    function gruppe(titel, zeilen) {
      return zeilen.length ? [el('h3', { class: 'label training-wahl__titel', text: titel }), list(zeilen.slice(0, MAX))] : [];
    }

    function zeige() {
      const q = norm(suche.value.trim());
      const passt = (t) => !q || norm(t).includes(q);
      treffer.replaceChildren(
        ...gruppe('Meine Übungen', eigene.filter((u) => passt(u.name)).map((u) =>
          listRow({ title: u.name, sub: u.physio ? 'PhysioZentrum' : '', onClick: () => nimm(() => u) }))),
        ...gruppe('PhysioZentrum', physioUebungen.filter((p) => !verknuepft.has(p.id) && passt(p.titel)).map((p) =>
          listRow({ title: p.titel, sub: p.kurz || '', onClick: () => nimm(() => uebungZuPhysio(p.id, uebungen)) }))),
        ...gruppe('Hyrox', HYROX.filter((h) => !namen.has(norm(h.name)) && passt(h.name)).map((h) =>
          listRow({ title: h.name, onClick: () => nimm(() => neueUebung(h)) }))),
        q && !namen.has(q) && list([listRow({ title: `+ „${suche.value.trim()}“ als neue Übung`,
          onClick: () => nimm(() => neueUebung({ name: suche.value.trim() })) })]),
      );
    }

    suche.addEventListener('keydown', (e) => e.key === 'Enter' && treffer.querySelector('button')?.click());
    m.element.addEventListener('close', () => { m.element.remove(); fertig(ergebnis); });
    zeige();
    m.open();
    requestAnimationFrame(() => suche.focus());
  });
}
