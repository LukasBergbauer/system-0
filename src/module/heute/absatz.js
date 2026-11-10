// Heute: „Zitat“ – ein Zitat aus Bücher (buch_notizen, art 'absatz'). Ohne ref: Absatz des Tages, antippen = nächster;
// mit ref: genau dieser Absatz. „Zum Buch“ öffnet es (#/buecher/<id>). Liest nur Rohdaten (buch_notizen, buecher).
import { el } from '../../ui/dom.js';
import { go } from '../../core/router.js';

let weiter = 0;
const tagesZahl = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5);

export const absaetze = ({ notizen }) => notizen.filter((n) => n.art === 'absatz').sort((a, b) => a.created_at.localeCompare(b.created_at));

export function absatzKarte(d, ref) {
  const pool = absaetze(d);
  const a = ref ? pool.find((n) => n.id === ref) : pool[(tagesZahl() + weiter) % pool.length];
  if (!a) return null;
  const buch = d.buecher.find((b) => b.id === a.buch_id);
  const karte = el('div', { class: 'heute-karte heute-absatz' }, [
    el('div', { class: 'heute-karte__kopf' }, [el('div', {}, [el('h3', { text: 'Zitat' }),
      el('small', { text: !ref && pool.length > 1 ? 'Antippen für die nächste' : '' })])]),
    el('blockquote', { class: 'heute-absatz__text', text: a.text }),
    el('button', { class: 'heute-absatz__quelle', text: [buch?.titel, a.seite != null && `S. ${a.seite}`].filter(Boolean).join(' · ') || 'Zum Buch',
      attrs: { type: 'button' }, on: { click: (e) => { e.stopPropagation(); go(`buecher/${a.buch_id}`); } } }),
  ]);
  if (!ref && pool.length > 1) karte.addEventListener('click', () => { weiter++; karte.replaceWith(absatzKarte(d, ref)); });
  return karte;
}
