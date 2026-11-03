// Tabs: Umschalter zwischen Ansichten. Der aktive Tab bekommt eine Neon-Linie.
// items: [{ id: 'heute', label: 'Heute' }, …]
import { el } from './dom.js';

export function tabs({ items = [], active, onChange } = {}) {
  let current = active ?? items[0]?.id;
  const bar = el('div', { class: 'tabs', attrs: { role: 'tablist' } });

  const buttons = items.map((item) =>
    el('button', {
      class: 'tabs__tab',
      text: item.label,
      attrs: { type: 'button', role: 'tab' },
      on: { click: () => select(item.id) },
    })
  );
  bar.append(...buttons);

  function render() {
    items.forEach((item, i) => {
      buttons[i].setAttribute('aria-selected', String(item.id === current));
    });
  }

  function select(id) {
    if (id === current) return;
    current = id;
    render();
    if (onChange) onChange(id);
  }

  render();
  bar.select = select; // von außen umschalten: tabsElement.select('id')
  return bar;
}
