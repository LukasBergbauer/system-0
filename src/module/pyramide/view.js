// Ansicht „Pyramide“: Segment zum Wechseln (+ neue), darunter die gewählte Pyramide als Stufen.
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { segment } from '../../ui/segment.js';
import { on } from '../../core/events.js';
import { TABELLE, ladeAlle, name, datumKurz } from './data.js';
import { stufen } from './stufen.js';
import { oeffnePyramide } from './bearbeiten.js';

let gewaehlt = null; // bleibt beim Wechseln der Bereiche erhalten

export function pyramideAnsicht({ signal }) {
  const box = el('div', { class: 'pyr' });
  let stand = 0;

  async function zeichne() {
    const nr = ++stand;
    const liste = await ladeAlle();
    if (nr !== stand || signal.aborted) return;
    if (!liste.some((p) => p.id === gewaehlt)) gewaehlt = liste[0]?.id ?? null;
    const p = liste.find((x) => x.id === gewaehlt);
    const waehle = (id) => { gewaehlt = id; zeichne(); };
    const neu = button({ text: '+ Neue Pyramide', variant: p ? 'ghost' : 'primary', onClick: () => oeffnePyramide(null, (id) => id && waehle(id)) });

    box.replaceChildren(
      ...(liste.length > 1 ? [segment({ items: liste.map((x) => ({ id: x.id, label: name(x) })), active: gewaehlt, onChange: waehle })] : []),
      ...(p ? [
        el('article', { class: 'pyr-karte' }, [
          el('div', { class: 'pyr-kopf' }, [
            el('div', {}, [
              el('h2', { class: 'routine__name', text: name(p) }),
              p.art === 'tag' && el('small', { text: datumKurz(p.tag) }),
            ]),
            button({ text: 'Bearbeiten', variant: 'ghost', onClick: () => oeffnePyramide(p, (id) => (id ? zeichne() : waehle(null))) }),
          ]),
          stufen(p.ebenen),
        ]),
      ] : [el('p', { class: 'app__note', text: 'Noch keine Pyramide. Unten groß und wichtig, oben klein.' })]),
      neu,
    );
  }

  on('daten', ({ table }) => table === TABELLE && zeichne(), { signal });
  zeichne();
  return box;
}
