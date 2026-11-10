// Heute: Einzel-Felder aus den Leisten (eine Gewohnheit, eine Routine, ein Schritt) als Ring-Feld,
// dazu die To-do-Liste für große To-do-Felder. Gelöschte Einträge → null (Feld verschwindet).
import { el } from '../../ui/dom.js';
import { go } from '../../core/router.js';
import { gewohnheitStand } from './gewohnheiten-leiste.js';
import { routineStand } from './routinen-leiste.js';
import { zielStand } from './ziele-leiste.js';
import { tagISO } from './rechnen.js';

export function einzelGewohnheit({ d }, id) {
  const g = d.gewohnheiten.gewohnheiten.find((x) => x.id === id);
  if (!g) return null;
  const s = gewohnheitStand(g, d.gewohnheiten);
  return { titel: g.name, anteil: s.anteil, wert: s.fertig ? '✓' : s.wert, text: s.unten, klick: s.klick, fertig: s.fertig };
}

export function einzelRoutine({ d }, id) {
  const r = d.routinen.routinen.find((x) => x.id === id);
  if (!r) return null;
  const { n, fertig, geschafft } = routineStand(r, d.routinen);
  return { titel: r.name, anteil: n ? geschafft / n : 0, wert: fertig ? '✓' : `${geschafft}/${n}`, fertig,
    text: fertig ? 'erledigt' : 'heute', klick: () => go(fertig || !n ? 'routinen' : `routinen/${r.id}`) };
}

export function einzelZiel({ d }, id) {
  const z = d.ziele.ziele.find((x) => x.id === id);
  if (!z) return null;
  const s = zielStand(z, d.ziele.schritte);
  return { titel: z.titel || 'Schritt', anteil: s.n ? s.erledigt / s.n : 0, wert: `${s.erledigt}/${s.n}`,
    text: s.n && s.erledigt === s.n ? 'alles erledigt' : 'Teilschritte', klick: () => go(`ziele/${z.id}`) };
}

// Große To-do-Fläche: überfällige und heutige zuerst, dann nach Fälligkeit (höchstens 8)
export function todoListe(todos) {
  const h = tagISO(new Date());
  const offen = todos.filter((t) => !t.erledigt_am)
    .sort((a, b) => (a.faellig_am || '9999').localeCompare(b.faellig_am || '9999')).slice(0, 8);
  return el('article', { class: 'heute-karte heute-liste' }, [
    el('div', { class: 'heute-karte__kopf' }, [el('div', {}, [el('h3', { text: 'To-dos' }), el('small', { text: `${offen.length ? 'als Nächstes' : 'alles erledigt'}` })])]),
    ...offen.map((t) => el('button', { class: 'heute-liste__zeile', attrs: { type: 'button' }, on: { click: () => go(`todos/${t.id}`) } }, [
      el('i', { class: t.faellig_am && t.faellig_am < h ? 'heute-liste__punkt heute-liste__punkt--warn' : 'heute-liste__punkt' }),
      el('span', { text: t.titel || 'To-do' }),
      t.faellig_am && el('small', { text: t.faellig_am === h ? 'heute' : t.faellig_am < h ? 'überfällig' : t.faellig_am.slice(8, 10) + '.' + t.faellig_am.slice(5, 7) + '.' }),
    ])),
  ]);
}
