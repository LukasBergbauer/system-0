// Heute: Einzel-Felder aus den Leisten (eine Gewohnheit, eine Routine, ein Schritt) als Ring-Feld,
// dazu die To-do-Liste zum Abhaken. Gelöschte Einträge → null (Feld verschwindet).
import { el } from '../../ui/dom.js';
import { go } from '../../core/router.js';
import { gewohnheitStand } from './gewohnheiten-leiste.js';
import { routineStand } from './routinen-leiste.js';
import { zielStand } from './ziele-leiste.js';
import { tagISO } from './rechnen.js';
import { checkbox } from '../../ui/checkbox.js';
import { save } from '../../core/store.js';

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

// To-do-Feld: Überfälliges und Heutiges zuerst, dann die nächsten nach Datum (höchstens 6), direkt abhakbar.
// Abhaken speichert über core/store.js (wie das To-do-Modul: erledigt_am = jetzt).
const KURZ = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'short' });
export function todoListe(todos) {
  const h = tagISO(new Date());
  const offen = todos.filter((t) => !t.erledigt_am)
    .sort((a, b) => (a.faellig_am || '9999').localeCompare(b.faellig_am || '9999') || (a.prio ?? 2) - (b.prio ?? 2));
  const faellig = offen.filter((t) => t.faellig_am && t.faellig_am <= h).length;
  const zeilen = offen.slice(0, Math.max(6, faellig));
  const wann = (f) => !f ? '' : f < h ? 'überfällig' : f === h ? 'heute' : KURZ.format(new Date(`${f}T12:00`));
  return el('article', { class: 'heute-karte heute-liste' }, [
    el('div', { class: 'heute-karte__kopf' }, [el('small', { text: faellig ? `${faellig} fällig` : offen.length ? 'als Nächstes' : 'alles erledigt' })]),
    ...zeilen.map((t) => el('div', { class: 'heute-liste__zeile' }, [
      checkbox({ onChange: (an) => save('todos', { id: t.id, erledigt_am: an ? new Date().toISOString() : null }) }),
      el('button', { class: 'heute-liste__titel', attrs: { type: 'button' }, on: { click: () => go(`todos/${t.id}`) } }, [
        el('span', { text: t.titel || 'To-do' }),
        t.faellig_am && el('small', { class: t.faellig_am < h ? 'heute-liste__warn' : '', text: wann(t.faellig_am) }),
      ]),
    ])),
  ]);
}
