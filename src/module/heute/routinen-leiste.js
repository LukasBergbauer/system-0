// Heute: Leiste mit allen Routinen und ihrem Stand heute. Antippen → '#/routinen/<id>' startet den Durchlauf.
// Bekommt die Rohdaten (routinen, routine_schritte, routine_logs) aus view.js; ohne Routinen nichts.
import { el } from '../../ui/dom.js';
import { symbol } from '../../ui/symbol.js';
import { go } from '../../core/router.js';
import { tagISO } from './rechnen.js';

const RANG = { morgen: 0, abend: 1, frei: 2 };

export function routinenLeiste({ routinen, schritte, logs }) {
  if (!routinen.length) return null;
  const heute = tagISO(new Date());
  const reihe = [...routinen].sort((a, b) => RANG[a.art] - RANG[b.art] || a.reihenfolge - b.reihenfolge);

  return el('article', { class: 'heute-karte heute-routinen' }, [
    el('div', { class: 'heute-karte__kopf' }, [el('div', {}, [el('h3', { text: 'Routinen' }), el('small', { text: 'heute' })])]),
    el('div', { class: 'heute-routinen__liste' }, reihe.map((r) => {
      const n = schritte.filter((s) => s.routine_id === r.id).length;
      const amTag = logs.filter((l) => l.routine_id === r.id && l.tag === heute);
      const fertig = amTag.some((l) => l.fertig_am);
      const geschafft = fertig ? n : Math.min(Math.max(0, ...amTag.map((l) => l.geschafft)), n);
      return el('button', {
        class: `heute-routine${fertig ? ' heute-routine--fertig' : ''}`,
        attrs: { type: 'button', style: `--anteil:${n ? geschafft / n : 0}` },
        on: { click: () => go(fertig || !n ? 'routinen' : `routinen/${r.id}`) },
      }, [
        el('span', { class: 'heute-kz__symbol' }, [symbol('routinen')]),
        el('span', {}, [r.name, el('small', { text: fertig ? 'Erledigt ✓' : n ? `${geschafft} / ${n}` : 'ohne Schritte' })]),
      ]);
    })),
  ]);
}
