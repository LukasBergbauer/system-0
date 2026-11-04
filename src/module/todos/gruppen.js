// Offene To-dos nach Zeit gruppieren: Überfällig · Heute · Diese Woche · Später · Ohne Datum.
// Innerhalb jeder Gruppe bleibt die Reihenfolge aus sortiereOffene (Priorität, dann Datum).
import { heuteISO } from './sortierung.js';

const GRUPPEN = [
  { id: 'ueberfaellig', titel: 'Überfällig' },
  { id: 'heute', titel: 'Heute' },
  { id: 'woche', titel: 'Diese Woche' }, // die nächsten 7 Tage ab morgen
  { id: 'spaeter', titel: 'Später' },
  { id: 'ohne', titel: 'Ohne Datum' },
];

function gruppeVon(todo, heute, inSiebenTagen) {
  const d = todo.faellig_am;
  if (!d) return 'ohne';
  if (d < heute) return 'ueberfaellig';
  if (d === heute) return 'heute';
  if (d <= inSiebenTagen) return 'woche';
  return 'spaeter';
}

// offene: schon sortiert → [{ id, titel, todos }], nur Gruppen mit Inhalt
export function gruppiereNachZeit(offene) {
  const heute = heuteISO();
  const inSiebenTagen = heuteISO(7);
  const fach = new Map(GRUPPEN.map((g) => [g.id, []]));
  for (const t of offene) fach.get(gruppeVon(t, heute, inSiebenTagen)).push(t);
  return GRUPPEN.map((g) => ({ ...g, todos: fach.get(g.id) })).filter((g) => g.todos.length);
}
