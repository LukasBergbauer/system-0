// Modal „Pyramide“: Titel, Art (dauerhaft / Tag mit Datum), Ebenen (eine je Zeile, oben = Spitze), Löschen.
// p = undefined → neue Pyramide.
import { el } from '../../ui/dom.js';
import { modal } from '../../ui/modal.js';
import { button } from '../../ui/button.js';
import { input } from '../../ui/input.js';
import { segment } from '../../ui/segment.js';
import { speichere, loesche, morgenDatum } from './data.js';

export function oeffnePyramide(p, fertig) {
  let art = p?.art || 'tag';
  const titel = input({ label: 'Titel (optional)', value: p?.titel || '' });
  const tag = input({ label: 'Tag', type: 'date', value: p?.tag || morgenDatum() });
  tag.hidden = art !== 'tag';
  const ebenen = el('textarea', { class: 'field__input pyr-text', attrs: { id: 'pyr-ebenen', rows: 7, placeholder: 'Spitze\n…\nFundament' } });
  ebenen.value = [...(p?.ebenen || [])].reverse().join('\n');

  const m = modal({
    title: p ? 'Pyramide' : 'Neue Pyramide',
    content: [
      segment({ items: [{ id: 'tag', label: 'Für einen Tag' }, { id: 'dauerhaft', label: 'Dauerhaft' }], active: art,
        onChange: (id) => { art = id; tag.hidden = id !== 'tag'; } }),
      titel, tag,
      el('div', { class: 'field' }, [
        el('label', { class: 'field__label', text: 'Ebenen: eine je Zeile, oben = klein, unten = Fundament', attrs: { for: 'pyr-ebenen' } }),
        ebenen,
      ]),
    ],
    actions: [
      p && button({ text: 'Löschen', variant: 'ghost', onClick: async () => { await loesche(p); m.close(); fertig?.(null); } }),
      button({ text: 'Abbrechen', variant: 'ghost', onClick: () => m.close() }),
      button({ text: 'Speichern', variant: 'primary', onClick: speichern }),
    ].filter(Boolean),
  });

  async function speichern() {
    const liste = ebenen.value.split('\n').map((t) => t.trim()).filter(Boolean).reverse();
    if (!liste.length) return ebenen.focus();
    const tagWert = tag.querySelector('input').value;
    const neu = await speichere({
      ...(p ? { id: p.id } : {}), titel: titel.querySelector('input').value.trim(),
      art, tag: art === 'tag' ? tagWert || morgenDatum() : null, ebenen: liste,
    });
    m.close();
    fertig?.(neu?.id ?? p?.id);
  }

  m.element.addEventListener('close', () => m.element.remove());
  m.open();
}
