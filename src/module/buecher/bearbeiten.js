// Bearbeiten eines Buchs (im Vollbild von buch.js): Titel, Autor, Status, Bewertung, Daten, Cover, Zusammenfassung.
// Speichert sofort; die Zusammenfassung kurz nach dem Tippen. bearbeiten({ buch, holeBuch }) → { element, sichern(), fokus() }
import { el } from '../../ui/dom.js';
import { input } from '../../ui/input.js';
import { tabs } from '../../ui/tabs.js';
import { STATUS, speichereBuch } from './data.js';
import { coverWahl } from './cover-wahl.js';
import { editor } from './editor.js';

function sterne(wert, onWahl) {
  const box = el('div', { class: 'buch-sterne', attrs: { role: 'group', 'aria-label': 'Bewertung' } });
  const zeichne = () => box.replaceChildren(...[1, 2, 3, 4, 5].map((n) => el('button', {
    class: `buch-sterne__stern${n <= (wert || 0) ? ' an' : ''}`, text: '★',
    attrs: { type: 'button', 'aria-label': `${n} von 5`, 'aria-pressed': String(n === wert) },
    on: { click: () => { wert = wert === n ? null : n; zeichne(); onWahl(wert); } },
  })));
  zeichne();
  return box;
}

const feldMit = (label, kind) => el('div', { class: 'field' }, [el('span', { class: 'field__label', text: label }), kind]);

export function bearbeiten({ buch, holeBuch }) {
  const setze = async (felder) => { buch = await speichereBuch(await holeBuch(), felder); };

  const titelFeld = input({ label: 'Titel', value: buch.titel, placeholder: 'Titel des Buchs' });
  const titel = titelFeld.querySelector('input');
  titel.addEventListener('change', () => setze({ titel: titel.value.trim() }));
  const autorFeld = input({ label: 'Autor:in', value: buch.autor || '' });
  const autor = autorFeld.querySelector('input');
  autor.addEventListener('change', () => setze({ autor: autor.value.trim() || null }));

  const datum = (label, schluessel) => {
    const f = input({ label, type: 'date', value: buch[schluessel] || '' });
    f.querySelector('input').addEventListener('change', (e) => setze({ [schluessel]: e.target.value || null }));
    return f;
  };

  let warte = null;
  let text = buch.zusammenfassung || '';
  const sichereText = () => {
    clearTimeout(warte);
    warte = null;
    if (text !== (buch.zusammenfassung || '')) return setze({ zusammenfassung: text || null });
  };
  const ed = editor({ wert: text, onAenderung: (t) => { text = t; clearTimeout(warte); warte = setTimeout(sichereText, 700); } });

  const element = el('div', { class: 'buch-form' }, [
    el('div', { class: 'buch-form__felder' }, [
      titelFeld, autorFeld,
      feldMit('Status', tabs({ items: STATUS, active: buch.status, onChange: (s) => setze({ status: s }) })),
      feldMit('Bewertung', sterne(buch.bewertung, (n) => setze({ bewertung: n }))),
      el('div', { class: 'buch-form__daten' }, [datum('Begonnen', 'begonnen'), datum('Beendet', 'beendet')]),
      coverWahl({ buch, holeBuch, suchwort: () => ({ titel: titel.value.trim(), autor: autor.value.trim() }) }),
    ]),
    feldMit('Zusammenfassung', ed.element),
  ]);

  // Beim Verlassen: offene Eingaben speichern (z. B. Titel ohne „change“, weil direkt geschlossen).
  async function sichern() {
    const t = titel.value.trim();
    const a = autor.value.trim() || null;
    const b = await holeBuch();
    if (b && (t !== b.titel || a !== (b.autor || null))) await setze({ titel: t, autor: a });
    await sichereText();
  }
  return { element, sichern, fokus: () => titel.focus() };
}
