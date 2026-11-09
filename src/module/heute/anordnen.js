// Heute: Kacheln per Ziehen umordnen. Lange drücken (0,45 s) hebt eine Kachel an, dann ziehen; die anderen
// gleiten weich an ihren neuen Platz (nur transform). Reihenfolge gilt nur für dieses Gerät (localStorage).
// Jede Kachel braucht data-kachel (fester Name); neue Kacheln ohne gemerkten Platz kommen ans Ende ihrer Stelle.
const MERKER = 'system0-heute-reihenfolge';
const HALTEN = 450;

function gemerkt() {
  try {
    return JSON.parse(localStorage.getItem(MERKER)) || [];
  } catch {
    return [];
  }
}

function merke(raster) {
  try {
    localStorage.setItem(MERKER, JSON.stringify([...raster.children].map((k) => k.dataset.kachel)));
  } catch { /* privater Modus: dann eben nicht merken */ }
}

// Kinder in der gemerkten Reihenfolge einsortieren (unbekannte behalten ihre Code-Reihenfolge dahinter).
export function ordnen(kacheln) {
  const reihe = gemerkt();
  const rang = (k) => {
    const i = reihe.indexOf(k.dataset.kachel);
    return i === -1 ? reihe.length : i;
  };
  return kacheln.map((k, i) => ({ k, i })).sort((a, b) => rang(a.k) - rang(b.k) || a.i - b.i).map((x) => x.k);
}

// FLIP: Plätze vorher merken, DOM ändern, Unterschied per transform zurück auf 0 animieren.
function gleiten(raster, ausser, aendern) {
  const vorher = new Map([...raster.children].map((k) => [k, k.getBoundingClientRect()]));
  aendern();
  for (const k of raster.children) {
    if (k === ausser) continue;
    const a = vorher.get(k);
    const b = k.getBoundingClientRect();
    const dx = a.left - b.left;
    const dy = a.top - b.top;
    if (!dx && !dy) continue;
    k.style.transition = 'none';
    k.style.transform = `translate(${dx}px, ${dy}px)`;
    requestAnimationFrame(() => {
      k.style.transition = 'transform 380ms var(--feder)';
      k.style.transform = '';
    });
  }
}

// box = feste Hülle der Ansicht (das Raster darin wird beim Neuzeichnen ersetzt)
export function ziehbar(box, signal) {
  let raster = null;
  let timer = null;
  let kachel = null;
  let start = null; // Finger-Startpunkt
  let basis = null; // Platz der Kachel beim letzten Umsortieren
  let zieht = false;

  const halt = (e) => { if (zieht) e.preventDefault(); };
  document.addEventListener('touchmove', halt, { passive: false, signal });

  box.addEventListener('pointerdown', (e) => {
    const k = e.target.closest('.heute-raster > [data-kachel]');
    if (!k || e.button > 0) return;
    raster = k.parentElement;
    start = { x: e.clientX, y: e.clientY };
    timer = setTimeout(() => {
      kachel = k;
      zieht = true;
      basis = { left: k.offsetLeft, top: k.offsetTop };
      k.style.transition = 'none';
      k.classList.add('heute-zieht');
      raster.classList.add('heute-raster--ordnen');
      navigator.vibrate?.(10);
      try { raster.setPointerCapture(e.pointerId); } catch { /* geht auch ohne */ }
    }, HALTEN);
  });

  box.addEventListener('pointermove', (e) => {
    if (!zieht) {
      if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 8) { clearTimeout(timer); start = null; }
      return;
    }
    // Kachel unter dem Finger finden und davor bzw. dahinter einsortieren
    const ziel = [...raster.children].find((k) => {
      if (k === kachel) return false;
      const r = k.getBoundingClientRect();
      return e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom;
    });
    if (ziel) {
      const vor = [...raster.children].indexOf(ziel) < [...raster.children].indexOf(kachel);
      gleiten(raster, kachel, () => ziel[vor ? 'before' : 'after'](kachel));
    }
    if (ziel) { // Platz im Raster hat sich geändert: Versatz so anpassen, dass die Kachel unter dem Finger bleibt
      const neu = { left: kachel.offsetLeft, top: kachel.offsetTop };
      start.x += neu.left - basis.left;
      start.y += neu.top - basis.top;
      basis = neu;
    }
    kachel.style.transform = `translate(${e.clientX - start.x}px, ${e.clientY - start.y}px) scale(1.03)`;
  });

  const ende = () => {
    clearTimeout(timer);
    start = null;
    if (!zieht) return;
    zieht = false;
    const k = kachel;
    kachel = null;
    k.style.transition = 'transform 380ms var(--feder)';
    k.style.transform = '';
    k.classList.remove('heute-zieht');
    raster.classList.remove('heute-raster--ordnen');
    merke(raster);
    // Klick nach dem Loslassen nicht als Antippen werten
    const schlucken = (e) => { e.stopPropagation(); e.preventDefault(); };
    box.addEventListener('click', schlucken, { capture: true, once: true });
    setTimeout(() => box.removeEventListener('click', schlucken, { capture: true }), 300);
    setTimeout(() => { k.style.transition = ''; }, 400);
  };
  box.addEventListener('pointerup', ende);
  box.addEventListener('pointercancel', ende);
  box.addEventListener('contextmenu', (e) => { if (zieht) e.preventDefault(); });
}
