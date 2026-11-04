// Chips: waagrechte Leiste antippbarer Kapseln, z. B. zum Filtern nach Bereich.
// Der gewählte Chip ist weiß gefüllt. aktionen = zusätzliche Chips am Ende (umrandet), die nur etwas auslösen.
// chips({ items: [{ id: 'alle', label: 'Alle' }, …], active: 'alle', onChange, aktionen: [{ label: '+ Bereich', onClick }] })
import { el } from './dom.js';

export function chips({ items = [], active, onChange, aktionen = [] } = {}) {
  let current = active ?? items[0]?.id;
  const leiste = el('div', { class: 'chips', attrs: { role: 'group' } });

  const knoepfe = items.map((item) =>
    el('button', {
      class: 'chip',
      text: item.label,
      attrs: { type: 'button' },
      on: { click: () => select(item.id) },
    })
  );
  const extra = aktionen.map((a) =>
    el('button', {
      class: 'chip chip--aktion',
      text: a.label,
      attrs: { type: 'button' },
      on: { click: a.onClick },
    })
  );
  leiste.append(...knoepfe, ...extra);

  function render() {
    items.forEach((item, i) => knoepfe[i].setAttribute('aria-pressed', String(item.id === current)));
  }

  function select(id) {
    if (id === current) return;
    current = id;
    render();
    knoepfe[items.findIndex((i) => i.id === id)]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    if (onChange) onChange(id);
  }

  render();
  leiste.select = select; // von außen umschalten
  return leiste;
}
