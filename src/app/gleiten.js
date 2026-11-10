// Inhalt weicht der Seitenleiste flüssig aus („FLIP“, wie physio/gleiten.js):
// vorher messen → neuen Zustand sofort setzen → Teile per Verschieben + Skalieren vom alten Platz auf null gleiten.
// So rechnet das Gerät pro Bild kein Layout neu, nur die Grafikeinheit bewegt. Teile = Kinder von .app;
// enthält ein Teil ein Raster ([data-raster], z. B. Heute), gleiten dessen Felder einzeln (rutschen um, wenn nötig).
// Web Animations statt Inline-Übergang: liegt über laufenden CSS-Animationen (Einblenden) und lässt sich abbrechen.
export const DAUER = 260; // gleich wie die Breite der Leiste in nav.css

const ruhig = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const teile = (e) => (e.matches('[data-raster]') || e.querySelector('[data-raster]') ? [...e.children].flatMap(teile) : [e]);
const sichtbar = (r) => r.bottom > 0 && r.top < innerHeight;

export function gleiten(main, aendern) {
  const app = main.querySelector('.app');
  if (!app || ruhig()) return aendern();
  const liste = [...app.children].flatMap(teile);
  const vorher = liste.map((e) => e.getBoundingClientRect()); // mitten im Gleiten: der sichtbare Platz
  aendern();
  liste.forEach((e) => e.gleiten?.cancel());
  const nachher = liste.map((e) => e.getBoundingClientRect()); // ein Layout für alle
  const ease = getComputedStyle(main).getPropertyValue('--ease').trim() || 'ease-out';
  liste.forEach((e, i) => {
    const a = vorher[i], n = nachher[i];
    if (!sichtbar(a) && !sichtbar(n)) return;
    const dx = a.left - n.left, dy = a.top - n.top, sx = a.width / n.width || 1, sy = a.height / n.height || 1;
    if (Math.abs(dx) + Math.abs(dy) < 0.5 && Math.abs(sx - 1) + Math.abs(sy - 1) < 0.005) return;
    e.gleiten = e.animate([
      { transformOrigin: '0 0', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
      { transformOrigin: '0 0', transform: 'none' },
    ], { duration: DAUER, easing: ease });
  });
}
