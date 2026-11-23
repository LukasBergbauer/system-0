// Bereichs-Filter oben: iOS-Segment „Alle · <Bereiche> · Ohne“ und rechts Textknopf „Bearbeiten“.
// Der gewählte Filter wird nur auf diesem Gerät gemerkt (localStorage).
import { el } from '../../ui/dom.js';
import { segment } from '../../ui/segment.js';
import { oeffneBereicheVerwalten } from './bereiche-verwalten.js';

const MERKER = 'system0-todos-filter';
export const ALLE = 'alle';
export const OHNE = 'ohne';

export function gemerkterFilter() {
  try {
    return localStorage.getItem(MERKER) || ALLE;
  } catch {
    return ALLE;
  }
}

function merke(wert) {
  try {
    localStorage.setItem(MERKER, wert);
  } catch {
    // Speichern nicht möglich (z. B. privater Modus): dann eben „Alle“ beim nächsten Mal.
  }
}

// Gibt es den gemerkten Bereich nicht mehr, gilt wieder „Alle“.
export function gueltigerFilter(filter, bereiche) {
  if (filter === ALLE || filter === OHNE) return filter;
  return bereiche.some((b) => b.id === filter) ? filter : ALLE;
}

// Passt ein To-do zum Filter? Ein To-do mit unbekanntem Bereich zählt als „ohne Bereich“.
export function passt(todo, filter, bekannteIds) {
  if (filter === ALLE) return true;
  if (filter === OHNE) return !bekannteIds.has(todo.bereich_id);
  return todo.bereich_id === filter;
}

export function filterLeiste({ bereiche, aktiv, onChange }) {
  const items = [
    { id: ALLE, label: 'Alle' },
    ...bereiche.map((b) => ({ id: b.id, label: b.name })),
    { id: OHNE, label: 'Ohne' },
  ];
  return el('div', { class: 'todo-filter' }, [
    segment({ items, active: aktiv, onChange: (id) => { merke(id); onChange(id); } }),
    el('button', { class: 'textknopf', text: 'Bearbeiten', attrs: { type: 'button', 'aria-label': 'Bereiche bearbeiten' }, on: { click: oeffneBereicheVerwalten } }),
  ]);
}
