// Heute: kleine Bausteine mit Bewegung – Zahl zählt hoch, Ring füllt sich, Mini-Kurve.
// animiert = false (z. B. beim Neuzeichnen nach einem Abgleich): Endwert sofort, ohne Bewegung.
import { el } from '../../ui/dom.js';

const ruhig = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const UMFANG = 440; // Ring: 2 · π · 70

// <b> mit Zahl, die von 0 hochzählt (Endung z. B. ' %' oder ' Tage')
export function zahl(wert, { nach = '', animiert = true, klasse } = {}) {
  const b = el('b', { class: klasse, text: wert + nach });
  if (!animiert || ruhig() || typeof wert !== 'number') return b;
  const start = performance.now() + 250, dauer = 1100;
  const schritt = (t) => {
    const p = Math.min(Math.max((t - start) / dauer, 0), 1);
    b.textContent = Math.round(wert * (1 - (1 - p) ** 3)) + nach;
    if (p < 1) requestAnimationFrame(schritt);
  };
  b.textContent = 0 + nach;
  requestAnimationFrame(schritt);
  return b;
}

// Fortschrittsring (0…1); mitte = Inhalt in der Mitte
export function ring(anteil, mitte, animiert = true) {
  const box = el('div', { class: 'heute-ring' }, [mitte]);
  box.insertAdjacentHTML('afterbegin',
    '<svg viewBox="0 0 168 168" aria-hidden="true"><circle class="bahn" cx="84" cy="84" r="70"/><circle class="wert" cx="84" cy="84" r="70"/></svg>');
  const kreis = box.querySelector('.wert');
  const ziel = UMFANG * (1 - (anteil ?? 0));
  if (!(anteil > 0)) kreis.style.visibility = 'hidden'; // runde Linienenden malen in Safari sonst bei 0 einen Punkt
  if (!animiert || ruhig()) {
    kreis.style.transition = 'none';
    kreis.style.strokeDashoffset = ziel;
  } else {
    requestAnimationFrame(() => requestAnimationFrame(() => (kreis.style.strokeDashoffset = ziel)));
  }
  return box;
}

// Mini-Kurve aus Werten (64 × 24), zeichnet sich beim Erscheinen
export function spur(werte, animiert = true) {
  const max = Math.max(...werte, 1), n = werte.length;
  const punkte = werte.map((w, i) => `${2 + (i * 60) / (n - 1)} ${21 - (w / max) * 18}`).join(' ');
  const box = el('span', { class: `heute-spur${animiert ? '' : ' heute-spur--fertig'}`, attrs: { 'aria-hidden': 'true' } });
  box.innerHTML = `<svg viewBox="0 0 64 24"><path pathLength="1" d="M${punkte}"/></svg>`;
  return box;
}
