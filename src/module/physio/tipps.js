// Dezente Hinweise in der Fokus-Karte, je einer, bis man es einmal getan hat (pro Gerät, localStorage):
// „Mitte antippen zum Öffnen“, danach „Lange drücken zum Lösen“ (Mac: Rechtsklick). Kleine Glas-Pille, blendet weich ein.
import { el } from '../../ui/dom.js';

const MERKER = 'system0-physio-tipps';

function gelernt() {
  try {
    return JSON.parse(localStorage.getItem(MERKER)) || {};
  } catch {
    return {};
  }
}

export function tipps({ loesbar = true } = {}) {
  const element = el('p', { class: 'mm-tipp', attrs: { role: 'note' } });
  let stand = { n: 0, unten: 0 };

  function zeige(n = stand.n, unten = stand.unten) {
    stand = { n, unten };
    const g = gelernt();
    const finger = window.matchMedia('(pointer: coarse)').matches;
    const text = !g.mitte ? 'Mitte antippen zum Öffnen'
      : loesbar && !g.loesen && n ? (finger ? 'Punkt lange drücken zum Lösen' : 'Rechtsklick auf einen Punkt zum Lösen')
        : '';
    if (text) element.textContent = text;
    element.style.bottom = `${unten}px`;
    element.classList.toggle('mm-tipp--an', !!text);
  }

  function lerne(art) {
    const g = gelernt();
    if (g[art]) return;
    g[art] = 1;
    try { localStorage.setItem(MERKER, JSON.stringify(g)); } catch { /* dann eben nochmal zeigen */ }
    zeige();
  }

  return { element, zeige, lerne };
}
