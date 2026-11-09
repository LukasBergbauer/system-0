// Ansicht „Bücher“: Umschalter Lese gerade / Will lesen / Gelesen, darunter Cover-Raster, „+ Buch“.
// Zusatz '#/buecher/<id>' (Suche) öffnet dieses Buch.
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { tabs } from '../../ui/tabs.js';
import { on } from '../../core/events.js';
import { zusatzNehmen } from '../../core/router.js';
import { BUECHER, STATUS, ladeBuecher, ladeBuch, neuesBuch, coverUrl } from './data.js';
import { coverBild } from './cover-wahl.js';
import { oeffneBuch } from './buch.js';

const LEER = {
  lese: 'Gerade kein Buch in Arbeit.',
  will: 'Noch nichts auf der Liste.',
  gelesen: 'Noch kein Buch fertig. Nach dem Lesen hier eine Zusammenfassung schreiben.',
};

async function kachel(b) {
  return el('button', { class: 'buch-kachel', attrs: { type: 'button', 'aria-label': b.titel || 'Ohne Titel' }, on: { click: () => oeffneBuch(b.id) } }, [
    coverBild(b, await coverUrl(b)),
    el('span', { class: 'buch-kachel__titel', text: b.titel || 'Ohne Titel' }),
    el('small', { text: [b.autor, b.bewertung && '★'.repeat(b.bewertung)].filter(Boolean).join(' · ') }),
  ]);
}

export function buecherAnsicht({ signal }) {
  let status = 'lese';
  const liste = el('div', { class: 'buecher__liste' });
  const umschalter = tabs({ items: STATUS, active: status, onChange: (s) => { status = s; zeichne(); } });
  let stand = 0;

  async function zeichne() {
    const nr = ++stand;
    const buecher = await ladeBuecher(status);
    const kacheln = await Promise.all(buecher.map(kachel));
    if (nr !== stand || signal.aborted) return;
    liste.replaceChildren(kacheln.length ? el('div', { class: 'buecher__raster' }, kacheln) : el('p', { class: 'app__note', text: LEER[status] }));
  }

  const neu = async () => oeffneBuch((await neuesBuch(status)).id, { neu: true });

  const zusatz = zusatzNehmen();
  if (zusatz) ladeBuch(zusatz).then((b) => b && oeffneBuch(b.id));

  on('daten', ({ table }) => table === BUECHER && zeichne(), { signal });
  on('dateien', ({ pfad }) => pfad.startsWith('buch-cover/') && zeichne(), { signal });
  zeichne();
  return el('div', { class: 'buecher' }, [umschalter, liste, button({ text: '+ Buch', variant: 'ghost', onClick: neu })]);
}
