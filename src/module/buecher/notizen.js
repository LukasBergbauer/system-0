// Notizen eines Buchs (in der Leseansicht unter dem Buchkopf): Knöpfe „Zusammenfassung“ und „Absatz“ (Lieblingsstelle),
// Einträge nach Seite sortiert; antippen = bearbeiten/löschen. notizen(buch) → Element, zeichnet sich bei 'daten' selbst neu.
import { el } from '../../ui/dom.js';
import { input } from '../../ui/input.js';
import { button } from '../../ui/button.js';
import { modal } from '../../ui/modal.js';
import { on } from '../../core/events.js';
import { NOTIZEN, ladeNotizen, speichereNotiz, loescheNotiz } from './data.js';

const ART = { zusammenfassung: 'Zusammenfassung', absatz: 'Absatz' };

function fenster(buch, n) {
  const seite = input({ label: 'Seite', type: 'number', value: n.seite ?? buch.seite ?? '' });
  seite.querySelector('input').setAttribute('inputmode', 'numeric');
  const text = el('textarea', { class: 'field__input buch-notiz-feld', attrs: { rows: 6, placeholder: n.art === 'absatz' ? 'Die Stelle, wörtlich …' : 'In eigenen Worten …' } });
  text.value = n.text || '';
  const m = modal({
    title: ART[n.art],
    content: [seite, el('div', { class: 'field' }, [el('span', { class: 'field__label', text: n.art === 'absatz' ? 'Text' : 'Zusammenfassung' }), text])],
    actions: [
      n.id && button({ text: 'Löschen', variant: 'ghost', onClick: async () => { await loescheNotiz(n.id); m.close(); } }),
      button({ text: 'Speichern', variant: 'primary', onClick: async () => {
        const t = text.value.trim();
        if (t) {
          const s = seite.querySelector('input').value;
          await speichereNotiz({ ...n, buch_id: buch.id, text: t, seite: s === '' ? null : Math.max(0, Math.round(Number(s))) });
        }
        m.close();
      } }),
    ].filter(Boolean),
  });
  m.element.addEventListener('close', () => m.element.remove());
  m.open();
  requestAnimationFrame(() => text.focus());
}

function eintrag(buch, n) {
  return el('button', { class: `buch-notiz buch-notiz--${n.art}`, attrs: { type: 'button' }, on: { click: () => fenster(buch, n) } }, [
    el('span', { class: 'buch-notiz__seite', text: n.seite != null ? `S. ${n.seite}` : ART[n.art] }),
    el(n.art === 'absatz' ? 'blockquote' : 'p', { class: 'buch-notiz__text', text: n.text }),
  ]);
}

export function notizen(buch, signal) {
  const liste = el('div', { class: 'buch-notizen__liste' });
  const zeichne = async () => {
    const alle = await ladeNotizen(buch.id);
    liste.replaceChildren(...alle.map((n) => eintrag(buch, n)));
  };
  on('daten', ({ table }) => table === NOTIZEN && zeichne(), { signal });
  zeichne();
  return el('section', { class: 'buch-notizen' }, [
    el('div', { class: 'knopfreihe' }, Object.entries(ART).map(([art, text]) => button({ text: `+ ${text}`, onClick: () => fenster(buch, { art }) }))),
    liste,
  ]);
}
