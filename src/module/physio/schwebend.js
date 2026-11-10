// Schwebende Notiz (Notizen-Fenster → „Im Kosmos“): klein über dem Kosmos, am Griff verschiebbar,
// Text direkt bearbeitbar, × schließt. Liegt über Kosmos und Glas-Flächen (z. B. Verknüpfen),
// damit man mit der Notiz weiterarbeiten kann. Immer nur eine; Notiz + Platz merkt sich das Gerät.
import { el } from '../../ui/dom.js';
import { save } from '../../core/store.js';
import { NOTIZEN, ladeNotizen } from './notizen.js';
import { textfeld } from './textfeld.js';

const MERKEN = 'physio-schwebend';
let aktiv = null;

const lies = () => { try { return JSON.parse(localStorage.getItem(MERKEN)); } catch { return null; } };
const schreib = (w) => { try { w ? localStorage.setItem(MERKEN, JSON.stringify(w)) : localStorage.removeItem(MERKEN); } catch { /* egal */ } };

// Start: rechts oben unter der Suche
export function schwebeNotiz(n, signal, platz = { x: innerWidth - 256, y: 150 }) {
  aktiv?.remove();
  const t = textfeld({ wert: n.text });
  t.feld.addEventListener('change', () => {
    const text = t.feld.value.trim();
    if (text && text !== n.text) save(NOTIZEN, { id: n.id, text }).then(() => { n.text = text; });
  });
  const zu = el('button', { class: 'schwebend__zu', text: '×', attrs: { type: 'button', 'aria-label': 'Notiz schließen' } });
  const griff = el('div', { class: 'schwebend__griff' }, [el('span', { text: '✎ Notiz' }), zu]);
  const karte = el('div', { class: 'schwebend', attrs: { role: 'note' } }, [griff, t]);
  aktiv = karte;

  const setze = (x, y) => {
    platz = {
      x: Math.max(4, Math.min(innerWidth - karte.offsetWidth - 4, x)),
      y: Math.max(4, Math.min(innerHeight - griff.offsetHeight - 4, y)),
    };
    karte.style.transform = `translate(${platz.x}px, ${platz.y}px)`;
  };

  griff.addEventListener('pointerdown', (e) => {
    if (e.target === zu) return;
    const dx = e.clientX - platz.x; const dy = e.clientY - platz.y;
    griff.setPointerCapture(e.pointerId);
    const zieh = (m) => setze(m.clientX - dx, m.clientY - dy);
    griff.addEventListener('pointermove', zieh);
    griff.addEventListener('pointerup', () => {
      griff.removeEventListener('pointermove', zieh);
      schreib({ id: n.id, platz });
    }, { once: true });
  });

  const weg = () => { karte.remove(); if (aktiv === karte) aktiv = null; };
  zu.addEventListener('click', () => { schreib(null); weg(); });
  signal?.addEventListener('abort', weg);

  document.body.append(karte);
  setze(platz.x, platz.y);
  schreib({ id: n.id, platz });
}

// Beim Öffnen des Kosmos: zuletzt schwebende Notiz wieder zeigen (falls noch da).
export async function schwebeGemerkte(signal) {
  const w = lies();
  if (!w) return;
  const n = (await ladeNotizen()).find((x) => x.id === w.id);
  if (n && !signal?.aborted) schwebeNotiz(n, signal, w.platz);
  else if (!n) schreib(null);
}
