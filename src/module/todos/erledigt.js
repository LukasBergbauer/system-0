// Abschnitt „Erledigt“ unten: eingeklappt, auf Knopfdruck aufklappbar.
// Haken entfernen = To-do ist wieder offen. Erledigte älter als 30 Tage erst nach „Ältere zeigen“.
import { el } from '../../ui/dom.js';
import { list } from '../../ui/list.js';

// zeilen: fertige Listenzeilen; offen/umschalten: Zustand liegt in der Ansicht,
// damit er beim Neuzeichnen erhalten bleibt.
export function erledigtAbschnitt({ zeilen, gesamt, aeltere, aeltereZeigen, offen, umschalten }) {
  if (!gesamt) return null;
  const knopf = el('button', { class: 'todo-mehr', attrs: { type: 'button' }, on: { click: umschalten } }, [
    el('span', { text: offen ? 'Erledigt ausblenden' : 'Erledigt anzeigen' }), el('span', { text: `${gesamt} ${offen ? '⌄' : '›'}` }),
  ]);
  knopf.setAttribute('aria-expanded', String(offen));
  return el('div', { class: 'todo-gruppe' }, [
    el('div', { class: 'todo-karte' }, [knopf]),
    offen && zeilen.length > 0 && el('div', { class: 'todo-karte' }, list(zeilen)),
    offen && aeltere > 0 && el('div', { class: 'todo-karte' }, [el('button', { class: 'todo-mehr', attrs: { type: 'button' }, on: { click: aeltereZeigen } },
      [el('span', { text: 'Ältere zeigen' }), el('span', { text: `${aeltere} ›` })])]),
  ]);
}
