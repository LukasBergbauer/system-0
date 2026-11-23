// Wischen auf dem iPhone (nur Finger): nach rechts = abhaken / wieder öffnen, nach links = löschen.
// Nur transform: Zeile folgt dem Finger, dahinter fährt eine Fläche mit Symbol mit. Ab 35 % Breite löst es aus.
import { el } from '../../ui/dom.js';

const SCHWELLE = 0.35;

export function wischbar(li, { erledigt, onHaken, onLoeschen }) {
  const zeile = li.firstElementChild;
  const rechts = el('span', { class: 'wisch wisch--haken', attrs: { 'aria-hidden': 'true' } }, [el('b', { text: erledigt ? '↺ Öffnen' : '✓ Erledigt' })]);
  const links = el('span', { class: 'wisch wisch--loeschen', attrs: { 'aria-hidden': 'true' } }, [el('b', { text: 'Löschen' })]);
  li.classList.add('wisch-zeile');
  li.prepend(rechts, links);

  let x0 = null;
  let y0 = 0;
  let dx = 0;
  let aktiv = false;

  const setze = (wert, weich) => {
    const t = weich ? 'transform 320ms var(--feder)' : 'none';
    for (const n of [zeile, rechts, links]) n.style.transition = t;
    zeile.style.transform = wert ? `translateX(${wert}px)` : '';
    rechts.style.transform = `translateX(calc(${Math.max(wert, 0)}px - 100%))`;
    links.style.transform = `translateX(calc(100% + ${Math.min(wert, 0)}px))`;
  };

  li.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch') return;
    x0 = e.clientX;
    y0 = e.clientY;
    dx = 0;
    aktiv = false;
  });
  li.addEventListener('pointermove', (e) => {
    if (x0 === null) return;
    const mx = e.clientX - x0;
    if (!aktiv) {
      if (Math.abs(e.clientY - y0) > 10) { x0 = null; return; } // Scrollen
      if (Math.abs(mx) < 10) return;
      aktiv = true;
      try { li.setPointerCapture(e.pointerId); } catch { /* ohne Capture geht es auch */ }
    }
    dx = mx;
    const breite = li.offsetWidth;
    li.classList.toggle('wisch--bereit', Math.abs(dx) > breite * SCHWELLE);
    setze(dx, false);
  });
  const ende = () => {
    if (x0 === null) return;
    x0 = null;
    if (!aktiv) return;
    const breite = li.offsetWidth;
    li.classList.remove('wisch--bereit');
    if (dx > breite * SCHWELLE) { setze(0, true); onHaken(); }
    else if (dx < -breite * SCHWELLE) { setze(-breite, true); setTimeout(onLoeschen, 220); }
    else setze(0, true);
  };
  li.addEventListener('pointerup', ende);
  li.addEventListener('pointercancel', ende);
  // Nach dem Wischen keinen Klick auf die Zeile auslösen
  li.addEventListener('click', (e) => { if (aktiv) { e.stopPropagation(); e.preventDefault(); aktiv = false; } }, true);
  setze(0, false);
  return li;
}

// Kleine Glas-Pille unten: „Gelöscht · Rückgängig“, verschwindet nach 4 s.
export function rueckgaengig(text, onUndo) {
  document.querySelector('.todo-undo')?.remove();
  const pille = el('div', { class: 'todo-undo', attrs: { role: 'status' } }, [
    el('span', { text }),
    el('button', { class: 'btn btn--ghost', text: 'Rückgängig', attrs: { type: 'button' }, on: { click: () => { onUndo(); pille.remove(); } } }),
  ]);
  document.body.append(pille);
  setTimeout(() => pille.classList.add('todo-undo--weg'), 4000);
  setTimeout(() => pille.remove(), 4400);
}
