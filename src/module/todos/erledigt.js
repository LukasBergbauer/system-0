// Abschnitt „Erledigt“ unten: eingeklappt, auf Knopfdruck aufklappbar.
// Haken entfernen = To-do ist wieder offen. Erledigte älter als 30 Tage erst nach „Ältere zeigen“.
import { el } from '../../ui/dom.js';
import { list } from '../../ui/list.js';
import { button } from '../../ui/button.js';

// zeilen: fertige Listenzeilen; offen/umschalten: Zustand liegt in der Ansicht,
// damit er beim Neuzeichnen erhalten bleibt.
export function erledigtAbschnitt({ zeilen, gesamt, aeltere, aeltereZeigen, offen, umschalten }) {
  if (!gesamt) return null;
  const knopf = button({
    text: `${offen ? 'Erledigt ausblenden' : 'Erledigt anzeigen'} (${gesamt})`,
    variant: 'ghost',
    onClick: umschalten,
  });
  knopf.setAttribute('aria-expanded', String(offen));
  return el('div', { class: 'app__stack' }, [
    el('div', { class: 'app__row' }, knopf),
    offen && zeilen.length > 0 && el('section', { class: 'todo-gruppe todo-gruppe--erledigt' }, list(zeilen)),
    offen && aeltere > 0 && el('div', { class: 'app__row' }, button({ text: `Ältere zeigen (${aeltere})`, variant: 'ghost', onClick: aeltereZeigen })),
  ]);
}
