// Seiten-Kreis am Cover: Ring = Seite ÷ Seiten, Zahl = aktuelle Seite. Antippen → Fenster „Seite“ + „von“ (manuell setzen).
// seitenKreis(buch) → Knopf. Speichert über data.js; die Ansicht zeichnet bei 'daten' neu.
import { el } from '../../ui/dom.js';
import { input } from '../../ui/input.js';
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

const zahl = (v) => (v === '' ? null : Math.max(0, Math.round(Number(v))) || null);

export function seitenEingabe(buch) {
  const seite = input({ label: 'Seite', type: 'number', value: buch.seite ?? '' });
  const von = input({ label: 'von', type: 'number', value: buch.seiten ?? '' });
  for (const f of [seite, von]) f.querySelector('input').setAttribute('inputmode', 'numeric');
  const m = modal({
    title: buch.titel || 'Seite',
    content: [el('div', { class: 'buch-seiten-form' }, [seite, von])],
    actions: [button({ text: 'Abbrechen', variant: 'ghost', onClick: () => m.close() }), button({ text: 'Speichern', variant: 'primary', onClick: sichern })],
  });
  async function sichern() {
    const s = zahl(seite.querySelector('input').value);
    const v = zahl(von.querySelector('input').value);
    await speichereBuch(buch, { seite: s, seiten: v });
    Object.assign(buch, { seite: s, seiten: v });
    m.close();
  }
  m.element.addEventListener('close', () => m.element.remove());
  m.element.addEventListener('keydown', (e) => e.key === 'Enter' && sichern());
  m.open();
  seite.querySelector('input').select();
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
