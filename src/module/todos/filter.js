// Bereichs-Filter oben: Chips „Alle · <Bereiche> · Ohne Bereich“ und ein Aktions-Chip „Bereiche bearbeiten“.
// Der gewählte Filter wird nur auf diesem Gerät gemerkt (localStorage).
import { chips } from '../../ui/chips.js';
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
    { id: OHNE, label: 'Ohne Bereich' },
  ];
  return chips({
    items,
    active: aktiv,
    onChange: (id) => {
      merke(id);
      onChange(id);
    },
    aktionen: [{ label: 'Bereiche bearbeiten', onClick: oeffneBereicheVerwalten }],
  });
}
