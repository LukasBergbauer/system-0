// Hover auf einer Kugel (Kosmos und Mindmap): einmal leicht unsymmetrisch nachwabbeln.
// Läuft immer zu Ende (Web Animations), daher nie ein Sprung beim Rausgehen.
const zufall = (n, i) => { const v = Math.sin(n * 12.9898 + i * 78.233) * 43758.5453; return v - Math.floor(v); };

export function wabbeln(el, n) {
  if (el.wabbelt || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const a = 0.02 + zufall(n, 30) * 0.015;
  const r = 0.6 + zufall(n, 31);
  el.style.transformOrigin = `${35 + zufall(n, 20) * 30}% ${35 + zufall(n, 21) * 30}%`;
  el.wabbelt = el.animate([
    { transform: 'none' },
    { transform: `scale(${1 + a}, ${1 - a * 0.7}) rotate(${r}deg)` },
    { transform: `scale(${1 - a * 0.6}, ${1 + a}) rotate(${-r * 0.7}deg)` },
    { transform: `scale(${1 + a * 0.35}, ${1 - a * 0.25}) rotate(${r * 0.3}deg)` },
    { transform: 'none' },
  ], { duration: 1100, easing: 'ease-in-out' });
  el.wabbelt.onfinish = el.wabbelt.oncancel = () => { el.wabbelt = null; };
}
