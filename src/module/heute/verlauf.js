// Heute: Verlauf „Erledigt“ – Fläche = erledigte To-dos je Tag, gestrichelt = fällige To-dos je Tag.
// Umschalter Woche (letzte 7 Tage) / Monat (letzte 30 Tage); die Wahl bleibt bis zum Neuladen der App.
import { el } from '../../ui/dom.js';
import { tabs } from '../../ui/tabs.js';
import { plusTage, tagISO } from './rechnen.js';

const KURZ = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
let gewaehlt = 'woche';

function daten(todos, zeit, jetzt) {
  const n = zeit === 'woche' ? 7 : 30;
  const tage = Array.from({ length: n }, (_, i) => plusTage(jetzt, i - n + 1));
  const erledigt = {}, faellig = {};
  for (const t of todos) {
    if (t.erledigt_am) { const k = tagISO(new Date(t.erledigt_am)); erledigt[k] = (erledigt[k] || 0) + 1; }
    if (t.faellig_am) faellig[t.faellig_am] = (faellig[t.faellig_am] || 0) + 1;
  }
  return {
    ist: tage.map((d) => erledigt[tagISO(d)] || 0),
    plan: tage.map((d) => faellig[tagISO(d)] || 0),
    x: tage.map((d, i) => (zeit === 'woche' ? KURZ[d.getDay()] : i % 7 === 0 || i === n - 1 ? `${d.getDate()}.` : '')),
  };
}

// weiche Linie durch alle Punkte (Hilfspunkte nie unter die Grundlinie y = 180)
function kurve(punkte) {
  const u = (y) => Math.min(y, 180);
  return punkte.reduce((d, [x, y], i, p) => {
    if (!i) return `M${x} ${y}`;
    const [x0, y0] = p[i - 1], [xm1, ym1] = p[i - 2] || p[i - 1], [x2, y2] = p[i + 1] || [x, y];
    return `${d} C${x0 + (x - xm1) / 6} ${u(y0 + (y - ym1) / 6)} ${x - (x2 - x0) / 6} ${u(y - (y2 - y0) / 6)} ${x} ${y}`;
  }, '');
}

function svg(d, animiert) {
  const n = d.ist.length, max = Math.max(...d.ist, ...d.plan, 1) * 1.15;
  const px = (i) => 20 + (i * 560) / (n - 1), py = (v) => 180 - (v / max) * 165;
  const ist = kurve(d.ist.map((v, i) => [px(i), py(v)]));
  const gitter = [0, 1, 2, 3].map((k) => `<line class="gitter" x1="0" x2="600" y1="${15 + k * 55}" y2="${15 + k * 55}"/>`).join('');
  const xs = d.x.map((t, i) => (t ? `<text x="${px(i)}" y="204" text-anchor="middle">${t}</text>` : '')).join('');
  return `<svg class="heute-verlauf${animiert ? '' : ' heute-verlauf--fertig'}" viewBox="0 0 600 210" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="heute-fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--accent);stop-opacity:.38"/>
    <stop offset="1" style="stop-color:var(--accent);stop-opacity:0"/></linearGradient></defs>${gitter}${xs}
    <path class="geplant" d="${kurve(d.plan.map((v, i) => [px(i), py(v)]))}"/>
    <path class="flaeche" d="${ist} L${px(n - 1)} 180 L${px(0)} 180Z"/><path class="linie" pathLength="1" d="${ist}"/></svg>`;
}

export function verlauf(todos, animiert, jetzt = new Date()) {
  const zeile = el('small');
  const bild = el('div', { class: 'heute-verlauf-box' });
  function zeichne(zeit, bewegt) {
    gewaehlt = zeit;
    const d = daten(todos, zeit, jetzt);
    const summe = d.ist.reduce((a, b) => a + b, 0);
    zeile.textContent = `${summe} erledigt in den letzten ${d.ist.length} Tagen`;
    bild.innerHTML = svg(d, bewegt);
  }
  zeichne(gewaehlt, animiert);
  return el('article', { class: 'heute-karte' }, [
    el('div', { class: 'heute-karte__kopf' }, [
      el('div', {}, [el('h3', { text: 'Erledigt' }), zeile]),
      tabs({ items: [{ id: 'woche', label: 'Woche' }, { id: 'monat', label: 'Monat' }], active: gewaehlt, onChange: (z) => zeichne(z, true) }),
    ]),
    el('div', { class: 'heute-legende' }, [el('span', {}, [el('i'), 'erledigt']), el('span', {}, [el('i', { class: 'heute-legende--plan' }), 'fällig'])]),
    bild,
  ]);
}
