// Heute: „Visionen“ – je aktivem Schritt (lebensziele) ein Balken, darin der nächste offene Teilschritt und der Stand.
// Höchstens 3, frühestes „Bis wann“ zuerst. Antippen → '#/ziele/<id>'. Liest nur Rohdaten (lebensziele, ziel_schritte).
import { el } from '../../ui/dom.js';
import { symbol } from '../../ui/symbol.js';
import { go } from '../../core/router.js';

export function zieleLeiste({ ziele, schritte }) {
  const reihe = ziele.filter((z) => z.status === 'aktiv')
    .sort((a, b) => (a.zieldatum || '9999').localeCompare(b.zieldatum || '9999'))
    .slice(0, 3);
  if (!reihe.length) return null;

  return el('article', { class: 'heute-karte heute-routinen' }, [
    el('div', { class: 'heute-karte__kopf' }, [el('div', {}, [el('h3', { text: 'Visionen' }), el('small', { text: 'deine nächsten Schritte' })])]),
    el('div', { class: 'heute-routinen__liste' }, reihe.map((z) => {
      const teile = schritte.filter((s) => s.ziel_id === z.id).sort((a, b) => a.reihenfolge - b.reihenfolge);
      const offen = teile.find((s) => !s.erledigt_am);
      const erledigt = teile.length - teile.filter((s) => !s.erledigt_am).length;
      const sub = !teile.length ? 'noch keine Teilschritte'
        : offen ? `Nächster: ${offen.text} · ${erledigt} / ${teile.length}` : `Alle ${teile.length} Teilschritte erledigt ✓`;
      return el('button', { class: 'heute-routine', attrs: { type: 'button' }, on: { click: () => go(`ziele/${z.id}`) } }, [
        el('span', { class: 'heute-kz__symbol' }, [symbol('ziele')]),
        el('span', {}, [z.titel || 'Schritt', el('small', { text: sub })]),
      ]);
    })),
  ]);
}
