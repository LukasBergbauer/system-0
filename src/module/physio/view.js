// Ansicht „Physio“: Kosmos mit Kern „Physio“ und schwebenden Bubbles je Pfad (kosmos.js),
// darunter eine leise Zeile mit Punkten und Verknüpfungen. Zeichnet Zahlen neu, sobald sich Daten ändern.
import { el } from '../../ui/dom.js';
import { on } from '../../core/events.js';
import { zusatzNehmen } from '../../core/router.js';
import { kosmos } from './kosmos.js';
import { oeffneMindmap } from './overlay.js';
import { EINTRAEGE, LINKS, ladeEintraege, ladeLinks, zaehleLinks } from './daten.js';

const zahl = (n, eins, viele) => `${n} ${n === 1 ? eins : viele}`;

export function physioAnsicht({ signal }) {
  const k = kosmos({ signal });
  const zeile = el('p', { class: 'kos__zeile' });
  const inhalt = el('div', { class: 'app__stack' }, [k.element, zeile]);
  let stand = 0; // nur das Ergebnis des neuesten Zeichnens zählt
  // Zusatz von außen (z. B. Heute): 'mindmap' oder 'neu' öffnet die Mindmap (dort „+ Neuer Punkt“),
  // sonst die id eines Punkts (Suche): Mindmap gleich mit seiner Fokus-Karte
  const zusatz = zusatzNehmen();
  if (zusatz) {
    const mitteId = ['mindmap', 'neu'].includes(zusatz) ? null : zusatz;
    requestAnimationFrame(() => oeffneMindmap({ signal, mitteId }));
  }

  async function zeichne() {
    const nr = ++stand;
    const [eintraege, links] = await Promise.all([ladeEintraege(), ladeLinks()]);
    if (nr !== stand || signal.aborted) return;

    k.daten(eintraege);
    const n = zaehleLinks(eintraege, links);
    zeile.textContent = `${zahl(eintraege.length, 'Punkt', 'Punkte')} · ${zahl(n, 'Verknüpfung', 'Verknüpfungen')}`;
  }

  on('daten', ({ table }) => {
    if (table === EINTRAEGE || table === LINKS) zeichne();
  }, { signal });
  zeichne();
  return inhalt;
}
