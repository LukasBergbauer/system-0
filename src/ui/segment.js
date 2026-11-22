// iOS-Segment: graue Spur, gewählter Teil = weißer „Daumen“. Viele Einträge → waagrecht wischbar.
// segment({ items: [{ id, label }], active, onChange })
import { el } from './dom.js';

export function segment({ items = [], active, onChange } = {}) {
  let aktiv = active ?? items[0]?.id;
  const knoepfe = items.map((it) => el('button', {
    class: 'segment__teil', text: it.label, attrs: { type: 'button' },
    on: { click: () => { aktiv = it.id; zeige(); onChange?.(it.id); } },
  }));
  function zeige() { items.forEach((it, i) => knoepfe[i].setAttribute('aria-pressed', String(it.id === aktiv))); }
  zeige();
  const box = el('div', { class: 'segment', attrs: { role: 'group' } }, knoepfe);
  requestAnimationFrame(() => { // gewählten Teil sichtbar machen (nur waagrecht, Seite springt nicht)
    const k = knoepfe[items.findIndex((it) => it.id === aktiv)];
    if (k && box.scrollWidth > box.clientWidth) box.scrollLeft = k.offsetLeft - 8;
  });
  return box;
}
