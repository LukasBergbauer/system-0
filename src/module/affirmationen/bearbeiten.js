// Modal „Affirmation“: Text, Aktiv, Löschen. Über dem Text Warum und Vision als Hilfe, Knopf „Vorschlag“ füllt eine Vorlage.
// a = undefined → neue Affirmation zu Ziel z.
import { el } from '../../ui/dom.js';
import { modal } from '../../ui/modal.js';
import { button } from '../../ui/button.js';
import { checkbox } from '../../ui/checkbox.js';
import { speichere, loesche, vorschlag } from './data.js';

export function oeffneAffirmation(z, a) {
  const text = el('textarea', { class: 'field__input ziele-text', attrs: { id: 'aff-text', rows: 3, placeholder: 'Ich bin …' } });
  text.value = a?.text || '';
  let aktiv = a ? a.aktiv : true;

  const hilfe = [
    z.warum && el('p', { class: 'aff-hilfe', text: `Warum: ${z.warum}` }),
    z.bereich?.vision && el('p', { class: 'aff-hilfe', text: `Wie soll es sein: „${z.bereich.vision}“` }),
  ].filter(Boolean);

  const m = modal({
    title: a ? 'Affirmation' : 'Neue Affirmation',
    content: [
      el('p', { class: 'aff-ziel', text: z.titel || 'Schritt' }),
      ...hilfe,
      el('div', { class: 'field' }, [el('label', { class: 'field__label', text: 'Text', attrs: { for: 'aff-text' } }), text]),
      button({ text: 'Vorschlag aus dem Warum', variant: 'ghost', onClick: () => { text.value = vorschlag(z); text.focus(); } }),
      checkbox({ label: 'Auf Heute zeigen', checked: aktiv, onChange: (an) => { aktiv = an; } }),
    ],
    actions: [
      a && button({ text: 'Löschen', variant: 'ghost', onClick: async () => { await loesche(a); m.close(); } }),
      button({ text: 'Abbrechen', variant: 'ghost', onClick: () => m.close() }),
      button({ text: 'Speichern', variant: 'primary', onClick: speichern }),
    ].filter(Boolean),
  });

  async function speichern() {
    const t = text.value.trim();
    if (!t) return text.focus();
    await speichere({ ...(a ? { id: a.id } : { lebensziel_id: z.id }), text: t, aktiv });
    m.close();
  }

  m.element.addEventListener('close', () => m.element.remove());
  m.open();
  if (!a) requestAnimationFrame(() => text.focus());
}
