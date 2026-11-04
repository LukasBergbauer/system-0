// Abschnitt „Erledigt“ unten: eingeklappt, auf Knopfdruck aufklappbar.
// Haken entfernen = To-do ist wieder offen.
import { el } from '../../ui/dom.js';
import { card } from '../../ui/card.js';
import { list } from '../../ui/list.js';
import { button } from '../../ui/button.js';

// zeilen: fertige Listenzeilen; offen/umschalten: Zustand liegt in der Ansicht,
// damit er beim Neuzeichnen erhalten bleibt.
export function erledigtAbschnitt({ zeilen, offen, umschalten }) {
  if (!zeilen.length) return null;
  const knopf = button({
    text: `${offen ? 'Erledigt ausblenden' : 'Erledigt anzeigen'} (${zeilen.length})`,
    variant: 'ghost',
    onClick: umschalten,
  });
  knopf.setAttribute('aria-expanded', String(offen));
  return el('div', { class: 'app__stack' }, [
    el('div', { class: 'app__row' }, knopf),
    offen && card({ children: list(zeilen) }),
  ]);
}
