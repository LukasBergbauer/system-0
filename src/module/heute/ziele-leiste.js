// Heute: „Nächster Schritt“ – je aktivem Ziel der erste offene Schritt (höchstens 3, frühestes Zieldatum zuerst).
// Antippen → '#/ziele/<id>' öffnet das Ziel. Liest nur Rohdaten (lebensziele, ziel_schritte); ohne offene Schritte nichts.
import { el } from '../../ui/dom.js';
import { symbol } from '../../ui/symbol.js';
import { go } from '../../core/router.js';

export function zieleLeiste({ ziele, schritte }) {
  const reihe = ziele.filter((z) => z.status === 'aktiv')
    .map((z) => ({ z, s: schritte.filter((s) => s.ziel_id === z.id && !s.erledigt_am).sort((a, b) => a.reihenfolge - b.reihenfolge)[0] }))
    .filter((x) => x.s)
    .sort((a, b) => (a.z.zieldatum || '9999').localeCompare(b.z.zieldatum || '9999'))
    .slice(0, 3);
  if (!reihe.length) return null;

  return el('article', { class: 'heute-karte heute-routinen' }, [
    el('div', { class: 'heute-karte__kopf' }, [el('div', {}, [el('h3', { text: 'Nächster Schritt' }), el('small', { text: 'zu deinen Zielen' })])]),
    el('div', { class: 'heute-routinen__liste' }, reihe.map(({ z, s }) => el('button', {
      class: 'heute-routine', attrs: { type: 'button' }, on: { click: () => go(`ziele/${z.id}`) },
    }, [
      el('span', { class: 'heute-kz__symbol' }, [symbol('ziele')]),
      el('span', {}, [s.text, el('small', { text: z.titel })]),
    ]))),
  ]);
}
