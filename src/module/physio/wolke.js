// Wolken-Bubbles (Kosmos und Mindmap): Kreis mit wenigen, ganz flachen Dellen, je Bubble eigene Form.
// wolke(style, n): setzt --wolke (Maske der Glas-Haut), --wolke-rand (feiner Rand) und --ursprung (Wabbel-Punkt).
// wabbeln(el, n): einmal leicht unsymmetrisch nachwabbeln (beim Hovern); läuft immer zu Ende, nie ein Sprung.

const zufall = (n, i) => { const v = Math.sin(n * 12.9898 + i * 78.233) * 43758.5453; return v - Math.floor(v); };

function pfad(n) {
  const k = 6 + (n % 3); // Anzahl Dellen
  const dreh = zufall(n, 1) * Math.PI * 2;
  const lappen = Array.from({ length: k }, (_, i) => 1 + (zufall(n, i + 2) - 0.5) * 0.04);
  const punkte = [];
  for (let s = 0; s < 96; s++) {
    const w = (s / 96) * Math.PI * 2;
    const t = (((w - dreh) / (Math.PI * 2)) * k % k + k) % k; // Lage zwischen zwei Dellen
    const i = Math.floor(t);
    const abstand = Math.min(t - i, i + 1 - t); // 0 = in der Delle
    const r = 46 * lappen[i] * (1 - 0.04 * Math.exp(-((abstand / 0.13) ** 2)));
    punkte.push(`${(50 + Math.cos(w) * r).toFixed(1)} ${(50 + Math.sin(w) * r).toFixed(1)}`);
  }
  return `M${punkte.join('L')}Z`;
}

const url = (inhalt) => `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>${inhalt}</svg>`)}")`;

export function wolke(st, n) {
  const d = pfad(n);
  st.setProperty('--wolke', url(`<path d='${d}'/>`));
  st.setProperty('--wolke-rand', url(`<path d='${d}' fill='none' stroke='white' stroke-opacity='.85' stroke-width='1.2' vector-effect='non-scaling-stroke'/>`));
  st.setProperty('--ursprung', `${35 + zufall(n, 20) * 30}% ${35 + zufall(n, 21) * 30}%`);
}

export function wabbeln(el, n) {
  if (el.wabbelt || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const a = 0.02 + zufall(n, 30) * 0.015;
  const r = 0.6 + zufall(n, 31);
  el.wabbelt = el.animate([
    { transform: 'none' },
    { transform: `scale(${1 + a}, ${1 - a * 0.7}) rotate(${r}deg)` },
    { transform: `scale(${1 - a * 0.6}, ${1 + a}) rotate(${-r * 0.7}deg)` },
    { transform: `scale(${1 + a * 0.35}, ${1 - a * 0.25}) rotate(${r * 0.3}deg)` },
    { transform: 'none' },
  ], { duration: 1100, easing: 'ease-in-out' });
  el.wabbelt.onfinish = el.wabbelt.oncancel = () => { el.wabbelt = null; };
}
