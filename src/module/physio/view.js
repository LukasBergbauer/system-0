// Ansicht „Physio“: Kosmos mit Kern „Physio“, Bällen je Bereich und Weiterhangeln (kosmos.js).
// Zeichnet neu, sobald sich Einträge, Verknüpfungen, Bilder oder Bereiche (Einstellungen) ändern.
import { el } from '../../ui/dom.js';
import { on } from '../../core/events.js';
import { zusatzNehmen } from '../../core/router.js';
import { kosmos } from './kosmos.js';
import { oeffneMindmap } from './overlay.js';
import { EINTRAEGE, LINKS, ladeEintraege, ladeLinks } from './daten.js';
import { ladeArten } from './arten.js';
import { BILDER, ladeBilder } from './bilder.js';
import { oeffneDatenbank } from './datenbank.js';

export function physioAnsicht({ signal }) {
  const k = kosmos({ signal });
  // Unter dem Kosmos: Knopf „Datenbank“ → Lernzettel-Vault (datenbank.js)
  const db = el('button', { class: 'physio-db', attrs: { type: 'button' } }, [
    el('span', { class: 'physio-db__titel', text: 'Datenbank' }),
    el('span', { class: 'physio-db__text', text: 'Lernzettel' }),
  ]);
  db.addEventListener('click', () => oeffneDatenbank({ ausBubble: db, signal }));
  const inhalt = el('div', { class: 'app__stack' }, [k.element, db]);
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
    const [eintraege, links, bilder] = await Promise.all([ladeEintraege(), ladeLinks(), ladeBilder(), ladeArten()]);
    if (nr !== stand || signal.aborted) return;

    k.daten(eintraege, links, bilder);
  }

  on('daten', ({ table }) => {
    if ([EINTRAEGE, LINKS, BILDER, 'einstellungen'].includes(table)) zeichne();
  }, { signal });
  zeichne();
  return inhalt;
}
