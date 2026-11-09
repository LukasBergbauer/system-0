// Kleines Modal „Rückfall“: Auslöser antippen (mehrere möglich), Mini-„+“ für eine kurze Notiz, Speichern.
import { el } from '../../ui/dom.js';
import { modal } from '../../ui/modal.js';
import { button } from '../../ui/button.js';
import { AUSLOESER, rueckfallEintragen } from './data.js';

export function oeffneRueckfall(g) {
  const gewaehlt = new Set();
  const chips = AUSLOESER.map((a) => el('button', {
    class: 'chip', text: a, attrs: { type: 'button', 'aria-pressed': 'false' },
    on: { click: (e) => {
      gewaehlt.has(a) ? gewaehlt.delete(a) : gewaehlt.add(a);
      e.currentTarget.setAttribute('aria-pressed', String(gewaehlt.has(a)));
    } },
  }));
  const notiz = el('input', { class: 'field__input gewohnheit__notiz', attrs: { placeholder: 'Kurze Notiz', autocomplete: 'off', hidden: true } });
  const plus = el('button', {
    class: 'chip chip--aktion', text: '+', attrs: { type: 'button', 'aria-label': 'Notiz' },
    on: { click: () => { plus.remove(); notiz.hidden = false; notiz.focus(); } },
  });

  const m = modal({
    title: `Rückfall · ${g.name}`,
    content: [el('div', { class: 'chips chips--umbruch' }, [...chips, plus]), notiz],
    actions: [
      button({ text: 'Abbrechen', variant: 'ghost', onClick: () => m.close() }),
      button({ text: 'Speichern', variant: 'primary', onClick: async () => {
        await rueckfallEintragen(g, [...gewaehlt], notiz.value.trim());
        m.close();
      } }),
    ],
  });
  m.element.addEventListener('close', () => m.element.remove());
  m.open();
}
