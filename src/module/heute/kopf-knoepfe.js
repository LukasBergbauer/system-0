// Heute: Knöpfe rechts im Kopf – „Akzent“ (Farbwahl) und „Neu“ (Menü: To-do, Termin, Physio-Punkt).
// Beide Fenster sind HTML-Popover: Tipp daneben oder Esc schließt sie von selbst.
// „Neu“ geht über den Router-Zusatz (#/todos/neu …); der Zielbereich öffnet dann sein Anlegen.
import { el } from '../../ui/dom.js';
import { symbol } from '../../ui/symbol.js';
import { go } from '../../core/router.js';
import { AKZENT_FARBEN, akzentSetzen, aktuellerAkzent } from '../../core/akzent.js';

const NEU = [['todos', 'To-do'], ['kalender', 'Termin'], ['physio', 'Physio-Punkt']];

// Fenster unter seinem Knopf, rechtsbündig, aber nie über den Bildschirmrand
function popover(knopf, klasse, kinder) {
  const box = el('div', { class: `heute-pop ${klasse}`, attrs: { popover: true } }, kinder);
  knopf.popoverTargetElement = box;
  box.addEventListener('toggle', (e) => {
    if (e.newState !== 'open') return;
    const r = knopf.getBoundingClientRect();
    const b = box.offsetWidth;
    box.style.top = `${r.bottom + 8}px`;
    box.style.left = `${Math.max(12, Math.min(r.right - b, innerWidth - b - 12))}px`;
  });
  return box;
}

function farbwahl(knopf) {
  const kreise = AKZENT_FARBEN.map(([farbe, name]) => el('button', {
    attrs: { type: 'button', 'aria-label': name, style: `--f:${farbe}` },
    on: { click: () => waehlen(farbe) },
  }));
  const eigen = el('input', { attrs: { type: 'color', 'aria-label': 'Eigene Farbe' }, on: { change: () => waehlen(eigen.value) } });

  function markieren() {
    const jetzt = aktuellerAkzent().toLowerCase();
    AKZENT_FARBEN.forEach(([f], i) => kreise[i].setAttribute('aria-pressed', String(f.toLowerCase() === jetzt)));
    eigen.value = /^#[0-9a-f]{6}$/.test(jetzt) ? jetzt : AKZENT_FARBEN[0][0].toLowerCase();
  }
  function waehlen(farbe) {
    akzentSetzen(farbe).catch((err) => console.warn(err));
    markieren();
  }
  markieren();
  return popover(knopf, 'heute-farbwahl', [
    el('p', { text: 'AKZENTFARBE' }),
    el('div', { class: 'heute-farben' }, [...kreise, el('label', { attrs: { title: 'Eigene Farbe' } }, [eigen])]),
  ]);
}

function neuMenue(knopf) {
  const box = popover(knopf, 'heute-neu', NEU.map(([id, text]) => el('button', {
    attrs: { type: 'button' },
    on: { click: () => { box.hidePopover(); go(`${id}/neu`); } },
  }, [symbol(id), text])));
  return box;
}

export function kopfKnoepfe() {
  const akzent = el('button', { class: 'heute-pille heute-pille--glas', attrs: { type: 'button' } },
    [el('span', { class: 'heute-punkt' }), 'Akzent']);
  const neu = el('button', { class: 'heute-pille heute-pille--dunkel', attrs: { type: 'button' } }, [symbol('plus'), 'Neu']);
  return el('div', { class: 'heute-kopf__knoepfe' }, [akzent, neu, farbwahl(akzent), neuMenue(neu)]);
}
