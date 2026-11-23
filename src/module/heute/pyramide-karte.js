// Heute: Pyramide des Tages – Tages-Pyramide von heute, sonst die dauerhafte. Liest nur über die Tabelle pyramiden.
import { el } from '../../ui/dom.js';
import { go } from '../../core/router.js';
import { tagISO } from './rechnen.js';

export function pyramideKarte(liste) {
  const heute = tagISO(new Date());
  const p = liste.find((x) => x.art === 'tag' && x.tag === heute && x.ebenen?.length)
    || liste.find((x) => x.art === 'dauerhaft' && x.ebenen?.length);
  if (!p) return null;
  const n = p.ebenen.length;
  const oben = [...p.ebenen].reverse();
  return el('button', { class: 'heute-karte heute-pyr', attrs: { type: 'button', 'aria-label': 'Pyramide öffnen' }, on: { click: () => go('pyramide') } }, [
    el('div', { class: 'heute-karte__kopf' }, [el('div', {}, [el('h3', { text: 'Pyramide' }), el('small', { text: p.titel || (p.art === 'tag' ? 'Heute' : 'Dauerhaft') })])]),
    el('div', { class: 'pyr-stufen' }, oben.map((t, i) => el('div', {
      class: 'pyr-stufe', text: t, attrs: { style: `--b:${30 + (70 * (i + 1)) / n}%;--k:${20 + (80 * (i + 1)) / n}%` },
    }))),
  ]);
}
