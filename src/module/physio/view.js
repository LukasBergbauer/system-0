// Ansicht „PhysioZentrum“: große Kachel „Mindmap“ (Einstieg), darunter Kacheln mit der Anzahl je Art.
// Antippen der Mindmap-Kachel öffnet das helle Overlay (overlay.js) aus der Kachel heraus.
// Zeichnet sich neu, sobald sich Einträge oder Verknüpfungen ändern (auch durch das andere Gerät).
import { el } from '../../ui/dom.js';
import { kachel, kacheln } from '../../ui/kachel.js';
import { on } from '../../core/events.js';
import { ARTEN } from './arten.js';
import { oeffneMindmap } from './overlay.js';
import { EINTRAEGE, LINKS, ladeEintraege, ladeLinks, zaehleLinks } from './daten.js';

const zahl = (n, eins, viele) => `${n} ${n === 1 ? eins : viele}`;

function mindmapKachel(anzahl, signal) {
  const k = kachel({
    symbol: 'physio',
    titel: 'Mindmap',
    wert: 'Öffnen',
    text: anzahl ? 'Suchen, verknüpfen, hinzufügen' : 'Noch leer – hier legst du den ersten Punkt an',
    gross: true,
    onClick: () => oeffneMindmap({ ausKnopf: k, signal }),
  });
  k.dataset.mmStart = ''; // Overlay findet die Kachel so auch nach dem Neuzeichnen wieder
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
        mindmapKachel(eintraege.length, signal),
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
