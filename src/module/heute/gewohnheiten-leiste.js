// Heute: Leiste mit allen Gewohnheiten. Aufbauen: Antippen zählt direkt hoch (abhaken, +1, +5 Min; abgehakt → zurück).
// Abbauen: „Tage ohne“, Antippen → '#/gewohnheiten'. Schreibt nur über core/store.js.
// gewohnheitStand() liefert dasselbe für eine einzelne Gewohnheit (Einzel-Feld auf Heute, einzeln.js).
import { el } from '../../ui/dom.js';
import { symbol } from '../../ui/symbol.js';
import { save, remove } from '../../core/store.js';
import { go } from '../../core/router.js';
import { tagISO } from './rechnen.js';

const SCHRITT = { haken: 1, anzahl: 1, zeit: 5 };
const tage = (a, b) => Math.max(0, Math.round((new Date(`${b}T12:00`) - new Date(`${a}T12:00`)) / 864e5));

// { fertig, anteil, unten (Text), klick } für eine Gewohnheit heute
export function gewohnheitStand(g, { logs, rueckfaelle }) {
  const heute = tagISO(new Date());
  if (g.art === 'ab') {
    const letzter = rueckfaelle.filter((r) => r.gewohnheit_id === g.id).map((r) => r.tag).sort().at(-1);
    const n = tage(letzter && letzter > g.seit ? letzter : g.seit, heute);
    return { fertig: false, anteil: null, wert: n, unten: `${n} ${n === 1 ? 'Tag' : 'Tage'} ohne`, klick: () => go('gewohnheiten') };
  }
  const amTag = logs.filter((l) => l.gewohnheit_id === g.id && l.tag === heute).sort((a, b) => b.wert - a.wert);
  const log = amTag[0];
  const w = log?.wert || 0;
  const fertig = w >= g.ziel;
  const neu = g.messart === 'haken' ? (fertig ? 0 : 1) : w + SCHRITT[g.messart];
  const e = (x) => (g.messart === 'zeit' ? `${x} Min` : x);
  return {
    fertig, anteil: Math.min(1, w / g.ziel), wert: g.messart === 'haken' ? null : w,
    unten: fertig ? 'Erledigt ✓' : g.messart === 'haken' ? 'offen' : `${e(w)} / ${e(g.ziel)}`,
    klick: async () => {
      for (const l of amTag.slice(1)) await remove('gewohnheit_logs', l.id); // sonst bliebe der höhere stehen
      await save('gewohnheit_logs', { ...(log ? { id: log.id } : {}), gewohnheit_id: g.id, tag: heute, wert: neu });
    },
  };
}

export function gewohnheitenLeiste(daten) {
  const { gewohnheiten } = daten;
  if (!gewohnheiten.length) return null;
  const reihe = [...gewohnheiten].sort((a, b) => (a.art === 'ab') - (b.art === 'ab') || a.reihenfolge - b.reihenfolge);

  return el('article', { class: 'heute-karte heute-routinen heute-gewohnheiten' }, [
    el('div', { class: 'heute-karte__kopf' }, [el('div', {}, [el('h3', { text: 'Gewohnheiten' }), el('small', { text: 'heute' })])]),
    el('div', { class: 'heute-routinen__liste' }, reihe.map((g) => {
      const s = gewohnheitStand(g, daten);
      return el('button', {
        class: `heute-routine heute-gewohnheit${s.fertig ? ' heute-routine--fertig' : ''}`,
        attrs: { type: 'button', style: `--anteil:${s.anteil || 0}` },
        on: { click: s.klick },
      }, [
        el('span', { class: 'heute-kz__symbol' }, [symbol('gewohnheiten')]),
        el('span', {}, [g.name, el('small', {}, [g.art === 'ab' ? el('strong', { text: s.unten }) : s.unten])]),
      ]);
    })),
  ]);
}
