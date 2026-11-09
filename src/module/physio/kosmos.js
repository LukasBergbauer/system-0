// Kosmos: Startseite von Physio. In der Mitte der Kern „Physio“ (öffnet die Mindmap), drumherum
// je Pfad eine Wolken-Bubble auf festem Ring, mit Lichtlinie zum Kern. Nichts schwebt.
// Hover = Bubble wird minimal größer und wabbelt einmal (wolke.js). Klick = Bubble gleitet in die Mitte,
// dann öffnet sich ihre Innenansicht (tiefe.js); danach steht alles wieder an seinem Platz.
import { el } from '../../ui/dom.js';
import { art } from './arten.js';
import { oeffneTiefe } from './tiefe.js';
import { oeffneMindmap } from './overlay.js';
import { wolke, wabbeln } from './wolke.js';

const SVG = 'http://www.w3.org/2000/svg';
const PFADE = ['krankheitsbild', 'trainingsform', 'uebung', 'technik', 'muskel', 'region']; // im Uhrzeigersinn ab oben
const MITTE_MS = 480;
const ruhig = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function kosmos({ signal }) {
  let eintraege = [];
  let besetzt = false;

  const kern = el('button', { class: 'kos__kern', attrs: { type: 'button', 'data-mm-start': '' } }, [
    el('span', { class: 'kos__kern-licht' }),
    el('span', { class: 'kos__kern-name', text: 'Physio' }),
    el('span', { class: 'kos__kern-text', text: 'Mindmap' }),
  ]);
  kern.addEventListener('click', () => oeffneMindmap({ ausKnopf: kern, signal }));

  const linien = document.createElementNS(SVG, 'svg');
  linien.setAttribute('class', 'kos__linien');
  linien.setAttribute('aria-hidden', 'true');

  const bubbles = PFADE.map((id, i) => {
    const a = art(id);
    const zahl = el('span', { class: 'kos__zahl', text: '0' });
    const haut = el('span', { class: 'kos__haut' });
    const b = el('button', { class: 'kos__bubble', attrs: { type: 'button', 'aria-label': a.mehrzahl } }, [
      el('span', { class: 'kos__form' }, [haut, zahl, el('span', { class: 'kos__name', text: a.mehrzahl })]),
    ]);
    wolke(b.style, i * 7 + 3);
    b.art = id; b.zahl = zahl;
    b.addEventListener('mouseenter', () => wabbeln(haut, i));
    b.addEventListener('click', () => inDieMitte(b));
    return b;
  });

  const buehne = el('div', { class: 'kos' }, [el('span', { class: 'kos__staub' }), linien, kern, ...bubbles]);

  // Feste Plätze auf einem Ring (Ellipse), Linien vom Rand des Kerns zum Rand der Bubble
  function ordne() {
    const w = buehne.clientWidth; const h = buehne.clientHeight;
    if (!w || !h) return;
    const s = bubbles[0].offsetWidth; const rk = kern.offsetWidth / 2;
    const ry = h / 2 - s / 2 - 12;
    const rx = Math.min(w / 2 - s / 2 - 12, ry * 1.25);
    const striche = [];
    bubbles.forEach((b, i) => {
      const winkel = (-90 + i * 60) * (Math.PI / 180);
      const x = Math.cos(winkel) * rx; const y = Math.sin(winkel) * ry;
      b.platz = { x, y };
      b.style.setProperty('--x', `${x}px`); b.style.setProperty('--y', `${y}px`);
      const l = Math.hypot(x, y); const ux = x / l; const uy = y / l;
      const r = (v) => v.toFixed(1);
      striche.push(`<line x1="${r(ux * (rk + 4))}" y1="${r(uy * (rk + 4))}" x2="${r(x - ux * (s / 2 - 2))}" y2="${r(y - uy * (s / 2 - 2))}"/>`);
    });
    linien.setAttribute('viewBox', `${-w / 2} ${-h / 2} ${w} ${h}`);
    linien.innerHTML = striche.join('');
  }
  new ResizeObserver(ordne).observe(buehne);

  function inDieMitte(b) {
    if (besetzt) return;
    besetzt = true;
    const auf = () => oeffneTiefe({ art: b.art, ausBubble: b, eintraege: () => eintraege, signal });
    if (ruhig()) { auf(); besetzt = false; return; }
    b.classList.add('kos__bubble--mitte');
    buehne.classList.add('kos--wahl');
    setTimeout(() => {
      auf();
      // unter der Innenansicht wieder an den Platz
      setTimeout(() => { b.classList.remove('kos__bubble--mitte'); buehne.classList.remove('kos--wahl'); besetzt = false; }, 700);
    }, MITTE_MS);
  }

  return {
    element: buehne,
    daten(neu) {
      eintraege = neu;
      for (const b of bubbles) b.zahl.textContent = String(neu.filter((e) => e.art === b.art).length);
    },
  };
}
