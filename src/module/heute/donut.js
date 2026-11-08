// Heute: Donut „To-dos nach Bereich“ – offene To-dos je Bereich (todo_bereiche), höchstens 4 + „Sonst“.
import { el } from '../../ui/dom.js';
import { go } from '../../core/router.js';

const FARBEN = ['var(--accent)', 'var(--akzent-hell)', 'var(--akzent-tief)', 'var(--text-3)', 'var(--line)'];
const U = 2 * Math.PI * 68;

function anteile(todos, bereiche) {
  const namen = new Map(bereiche.map((b) => [b.id, b.name]));
  const zahl = new Map();
  for (const t of todos) {
    if (t.erledigt_am) continue;
    const name = namen.get(t.bereich_id) || 'Ohne Bereich';
    zahl.set(name, (zahl.get(name) || 0) + 1);
  }
  const liste = [...zahl].sort((a, b) => b[1] - a[1]);
  if (liste.length <= 5) return liste;
  return [...liste.slice(0, 4), ['Sonst', liste.slice(4).reduce((s, [, n]) => s + n, 0)]];
}

export function donut(todos, bereiche, animiert) {
  const liste = anteile(todos, bereiche);
  const gesamt = liste.reduce((s, [, n]) => s + n, 0);
  let lauf = 0;
  const kreise = liste.map(([, n], i) => {
    const laenge = Math.max((n / gesamt) * U - (liste.length > 1 ? 3 : 0), 0.1);
    const c = `<circle cx="85" cy="85" r="68" style="stroke:${FARBEN[i]}" stroke-dasharray="${animiert ? 0 : laenge} ${U}"
      stroke-dashoffset="${-lauf}" data-l="${laenge}"/>`;
    lauf += (n / gesamt) * U;
    return c;
  }).join('');
  const ring = el('div', { class: 'heute-donut' }, [el('div', {}, [el('b', { text: String(gesamt) }), el('small', { text: 'offen' })])]);
  ring.insertAdjacentHTML('afterbegin', `<svg viewBox="0 0 170 170" aria-hidden="true"><circle class="bahn" cx="85" cy="85" r="68"/>${kreise}</svg>`);
  if (animiert) {
    requestAnimationFrame(() => requestAnimationFrame(() => ring.querySelectorAll('circle[data-l]').forEach((c, i) =>
      setTimeout(() => c.setAttribute('stroke-dasharray', `${c.dataset.l} ${U}`), 400 + i * 120))));
  }
  return el('article', { class: 'heute-karte heute-s4', on: { click: () => go('todos') } }, [
    el('div', { class: 'heute-karte__kopf' }, [el('div', {}, [el('h3', { text: 'To-dos nach Bereich' }), el('small', { text: 'offene To-dos' })])]),
    ring,
    gesamt ? el('div', { class: 'heute-anteile' }, liste.map(([name, n], i) => el('span', {}, [
      el('i', { attrs: { style: `background:${FARBEN[i]}` } }), name, el('b', { text: `${Math.round((n / gesamt) * 100)} %` }),
    ]))) : el('p', { class: 'heute-leer', text: 'Alles erledigt.' }),
  ]);
}
