// Ansicht „PhysioZentrum“: große Kachel „Mindmap“ (Einstieg), darunter Kacheln mit der Anzahl je Art.
// Die Mindmap selbst (Overlay mit Suche) kommt in Teil b; bis dahin ist die Kachel noch nicht antippbar.
// Zeichnet sich neu, sobald sich Einträge oder Verknüpfungen ändern (auch durch das andere Gerät).
import { el } from '../../ui/dom.js';
import { kachel, kacheln } from '../../ui/kachel.js';
import { on } from '../../core/events.js';
import { ARTEN } from './arten.js';
import { EINTRAEGE, LINKS, ladeEintraege, ladeLinks, zaehleLinks } from './daten.js';

const zahl = (n, eins, viele) => `${n} ${n === 1 ? eins : viele}`;

function mindmapKachel(anzahl) {
  const k = kachel({
    symbol: 'physio',
    titel: 'Mindmap',
    wert: 'Öffnen',
    text: anzahl ? 'Suchen, verknüpfen, hinzufügen' : 'Noch leer – hier legst du den ersten Punkt an',
    gross: true,
    onClick: () => {}, // Teil b: Overlay öffnen
  });
  k.disabled = true; // bis Teil b gebaut ist
  return k;
}

export function physioAnsicht({ signal }) {
  const inhalt = el('div', { class: 'app__stack' });
  let stand = 0; // nur das Ergebnis des neuesten Zeichnens zählt

  async function zeichne() {
    const nr = ++stand;
    const [eintraege, links] = await Promise.all([ladeEintraege(), ladeLinks()]);
    if (nr !== stand || signal.aborted) return;

    const proArt = ARTEN.map((a) => {
      const n = eintraege.filter((e) => e.art === a.id).length;
      return kachel({ titel: a.mehrzahl, wert: String(n) });
    });
    const n = zaehleLinks(eintraege, links);
    inhalt.replaceChildren(
      kacheln([
        mindmapKachel(eintraege.length),
        ...proArt,
        kachel({ titel: 'Verknüpfungen', wert: String(n), text: zahl(eintraege.length, 'Punkt', 'Punkte') + ' gesamt' }),
      ]),
    );
  }

  on('daten', ({ table }) => {
    if (table === EINTRAEGE || table === LINKS) zeichne();
  }, { signal });
  zeichne();
  return inhalt;
}
