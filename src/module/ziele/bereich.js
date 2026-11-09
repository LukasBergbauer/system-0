// Modal „Bereich“: Name, Vision, Löschen (mit allen Zielen). bereich = undefined → neu.
import { el } from '../../ui/dom.js';
import { modal } from '../../ui/modal.js';
import { input } from '../../ui/input.js';
import { button } from '../../ui/button.js';
import { speichereBereich, loescheBereich } from './data.js';

export function oeffneBereich(bereich) {
  const nameFeld = input({ label: 'Name', value: bereich?.name || '', placeholder: 'z. B. Gesundheit' });
  const name = nameFeld.querySelector('input');
  const vision = el('textarea', { class: 'field__input ziele-text', attrs: { id: 'ziel-vision', rows: 4, placeholder: 'Wie sieht es aus, wenn es gut ist?' } });
  vision.value = bereich?.vision || '';

  const m = modal({
    title: bereich ? 'Bereich bearbeiten' : 'Neuer Bereich',
    content: [nameFeld, el('div', { class: 'field' }, [el('label', { class: 'field__label', text: 'Vision', attrs: { for: 'ziel-vision' } }), vision])],
    actions: [
      bereich && button({ text: 'Löschen', variant: 'ghost', onClick: loeschen }),
      button({ text: 'Abbrechen', variant: 'ghost', onClick: () => m.close() }),
      button({ text: 'Speichern', variant: 'primary', onClick: speichern }),
    ].filter(Boolean),
  });

  async function speichern() {
    const n = name.value.trim();
    if (!n) return name.focus();
    await speichereBereich({ ...(bereich ? { id: bereich.id } : {}), name: n, vision: vision.value.trim() || null });
    m.close();
  }

  async function loeschen() {
    const n = bereich.ziele.length;
    if (!confirm(`„${bereich.name}“${n ? ` mit ${n} Ziel${n > 1 ? 'en' : ''}` : ''} löschen?`)) return;
    await loescheBereich(bereich);
    m.close();
  }

  m.element.addEventListener('close', () => m.element.remove());
  m.open();
  if (!bereich) requestAnimationFrame(() => name.focus());
}
