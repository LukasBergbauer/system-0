// Seiten-Kreis am Cover: Ring = Seite ÷ Seiten, Zahl = aktuelle Seite. Antippen → Fenster „Seite“ + „von“ (manuell setzen).
// seitenKreis(buch) → Knopf. Speichert über data.js; die Ansicht zeichnet bei 'daten' neu.
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { modal } from '../../ui/modal.js';
import { speichereBuch } from './data.js';

const NS = 'http://www.w3.org/2000/svg';
const R = 16;
const U = 2 * Math.PI * R;

function kreis(klasse, anteil) {
  const c = document.createElementNS(NS, 'circle');
  for (const [k, v] of Object.entries({ class: klasse, cx: 20, cy: 20, r: R })) c.setAttribute(k, v);
  if (anteil !== undefined) c.setAttribute('stroke-dasharray', `${U * anteil} ${U}`);
  return c;
}

const zahl = (v) => Math.max(0, parseInt(v, 10)) || null;

export function seitenEingabe(buch) {
  // Eine Zeile: „Seite [ ] von [ ]“, Zifferntastatur, ohne Pfeile
  const feld = (wert, label) => {
    const f = el('input', { class: 'field__input buch-seiten-feld', attrs: { inputmode: 'numeric', pattern: '[0-9]*', 'aria-label': label, autocomplete: 'off' } });
    f.value = wert ?? '';
    return f;
  };
  const s1 = feld(buch.seite, 'Seite');
  const s2 = feld(buch.seiten, 'Seiten gesamt');
  const m = modal({
    title: buch.titel || 'Seite',
    content: [el('div', { class: 'buch-seiten-form' }, ['Seite', s1, 'von', s2])],
    actions: [button({ text: 'Abbrechen', variant: 'ghost', onClick: () => m.close() }), button({ text: 'Speichern', variant: 'primary', onClick: sichern })],
  });
  async function sichern() {
    const s = zahl(s1.value);
    const v = zahl(s2.value);
    await speichereBuch(buch, { seite: s, seiten: v });
    Object.assign(buch, { seite: s, seiten: v });
    m.close();
  }
  m.element.addEventListener('close', () => m.element.remove());
  m.element.addEventListener('keydown', (e) => e.key === 'Enter' && sichern());
  m.open();
  s1.select();
}

export function seitenKreis(buch) {
  const anteil = buch.seiten ? Math.min(1, (buch.seite || 0) / buch.seiten) : 0;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 40 40');
  svg.append(kreis('buch-kreis__grund'), kreis('buch-kreis__wert', anteil));
  const text = buch.seiten ? `Seite ${buch.seite || 0} von ${buch.seiten}` : 'Seite setzen';
  return el('button', { class: `buch-kreis${anteil >= 1 ? ' buch-kreis--fertig' : ''}`, attrs: { type: 'button', 'aria-label': text, title: text },
    on: { click: (e) => { e.stopPropagation(); seitenEingabe(buch); } } }, [svg, el('span', { text: buch.seite ? String(buch.seite) : '+' })]);
}
