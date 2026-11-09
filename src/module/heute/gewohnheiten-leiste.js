// Heute: Leiste mit allen Gewohnheiten. Aufbauen: Antippen zählt direkt hoch (abhaken, +1, +5 Min; abgehakt → zurück).
// Abbauen: „Tage ohne“, Antippen → '#/gewohnheiten'. Schreibt nur über core/store.js.
import { el } from '../../ui/dom.js';
import { symbol } from '../../ui/symbol.js';
import { save } from '../../core/store.js';
import { go } from '../../core/router.js';
import { tagISO } from './rechnen.js';

const SCHRITT = { haken: 1, anzahl: 1, zeit: 5 };
const tage = (a, b) => Math.max(0, Math.round((new Date(`${b}T12:00`) - new Date(`${a}T12:00`)) / 864e5));

export function gewohnheitenLeiste({ gewohnheiten, logs, rueckfaelle }) {
  if (!gewohnheiten.length) return null;
  const heute = tagISO(new Date());
  const reihe = [...gewohnheiten].sort((a, b) => (a.art === 'ab') - (b.art === 'ab') || a.reihenfolge - b.reihenfolge);

  return el('article', { class: 'heute-karte heute-routinen heute-gewohnheiten' }, [
    el('div', { class: 'heute-karte__kopf' }, [el('div', {}, [el('h3', { text: 'Gewohnheiten' }), el('small', { text: 'heute' })])]),
    el('div', { class: 'heute-routinen__liste' }, reihe.map((g) => (g.art === 'ab' ? ab(g) : auf(g)))),
  ]);

  function auf(g) {
    const log = logs.filter((l) => l.gewohnheit_id === g.id && l.tag === heute).sort((a, b) => b.wert - a.wert)[0];
    const w = log?.wert || 0;
    const fertig = w >= g.ziel;
    const neu = g.messart === 'haken' ? (fertig ? 0 : 1) : w + SCHRITT[g.messart];
    const e = (x) => (g.messart === 'zeit' ? `${x} Min` : x);
    return knopf(g, fertig, Math.min(1, w / g.ziel), fertig ? 'Erledigt ✓' : g.messart === 'haken' ? 'offen' : `${e(w)} / ${e(g.ziel)}`,
      () => save('gewohnheit_logs', { ...(log ? { id: log.id } : {}), gewohnheit_id: g.id, tag: heute, wert: neu }));
  }

  function ab(g) {
    const letzter = rueckfaelle.filter((r) => r.gewohnheit_id === g.id).map((r) => r.tag).sort().at(-1);
    const n = tage(letzter && letzter > g.seit ? letzter : g.seit, heute);
    return knopf(g, false, 0, el('strong', { text: `${n} ${n === 1 ? 'Tag' : 'Tage'} ohne` }), () => go('gewohnheiten'));
  }

  function knopf(g, fertig, anteil, unten, klick) {
    return el('button', {
      class: `heute-routine heute-gewohnheit${fertig ? ' heute-routine--fertig' : ''}`,
      attrs: { type: 'button', style: `--anteil:${anteil}` },
      on: { click: klick },
    }, [
      el('span', { class: 'heute-kz__symbol' }, [symbol('gewohnheiten')]),
      el('span', {}, [g.name, el('small', {}, [unten])]),
    ]);
  }
}
