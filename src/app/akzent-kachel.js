// Einstellungen: große Kachel „Akzentfarbe“ mit Farbkreisen und freiem Farbwähler.
import { el } from '../ui/dom.js';
import { kachel } from '../ui/kachel.js';
import { AKZENT_FARBEN, akzentSetzen, aktuellerAkzent } from '../core/akzent.js';

export function akzentKachel() {
  const kreise = AKZENT_FARBEN.map(([farbe, name]) => el('button', {
    class: 'farbkreis',
    attrs: { type: 'button', 'aria-label': name, 'data-farbe': farbe },
  }));
  const eigen = el('input', { class: 'farbkreis__eingabe', attrs: { type: 'color', 'aria-label': 'Eigene Farbe' } });

  function markieren() {
    const jetzt = aktuellerAkzent().toLowerCase();
    kreise.forEach((k) => k.setAttribute('aria-pressed', String(k.dataset.farbe.toLowerCase() === jetzt)));
    eigen.value = /^#[0-9a-f]{6}$/i.test(jetzt) ? jetzt : '#e8664f';
  }
  function waehlen(farbe) {
    akzentSetzen(farbe).catch((err) => console.warn(err));
    markieren();
  }

  kreise.forEach((k) => {
    k.style.setProperty('--f', k.dataset.farbe);
    k.addEventListener('click', () => waehlen(k.dataset.farbe));
  });
  eigen.addEventListener('change', () => waehlen(eigen.value));
  markieren();

  return kachel({
    symbol: 'farbe',
    titel: 'Akzentfarbe',
    text: 'Eine Farbe für die ganze App',
    gross: true,
    children: el('div', { class: 'farbkreise' }, [
      ...kreise,
      el('label', { class: 'farbkreis farbkreis--eigen', attrs: { title: 'Eigene Farbe' } }, [eigen]),
    ]),
  });
}
