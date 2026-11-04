// Sortieren und Datums-Texte für die To-do-Listen.

// Heutiges Datum als 'JJJJ-MM-TT' in der Zeitzone des Geräts.
export function heuteISO(tageDazu = 0) {
  const d = new Date();
  d.setDate(d.getDate() + tageDazu);
  const zwei = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${zwei(d.getMonth() + 1)}-${zwei(d.getDate())}`;
}

export const istOffen = (t) => !t.erledigt_am;

export function istUeberfaellig(todo) {
  return istOffen(todo) && Boolean(todo.faellig_am) && todo.faellig_am < heuteISO();
}

// Offene: erst Priorität (1 hoch zuerst), dann Fälligkeit (ohne Datum zuletzt), dann älteste zuerst.
export function sortiereOffene(todos) {
  return todos.filter(istOffen).sort((a, b) => {
    if (a.prio !== b.prio) return a.prio - b.prio;
    if (a.faellig_am !== b.faellig_am) {
      if (!a.faellig_am) return 1;
      if (!b.faellig_am) return -1;
      return a.faellig_am < b.faellig_am ? -1 : 1;
    }
    return Date.parse(a.created_at) - Date.parse(b.created_at);
  });
}

// Erledigte: zuletzt erledigte zuerst.
export function sortiereErledigte(todos) {
  return todos
    .filter((t) => !istOffen(t))
    .sort((a, b) => Date.parse(b.erledigt_am) - Date.parse(a.erledigt_am));
}

// '2026-11-05' → 'Morgen', 'Heute', 'Gestern' oder 'Do., 5. Nov.'
export function datumText(iso) {
  if (!iso) return '';
  if (iso === heuteISO()) return 'Heute';
  if (iso === heuteISO(1)) return 'Morgen';
  if (iso === heuteISO(-1)) return 'Gestern';
  const [j, m, t] = iso.split('-').map(Number);
  const datum = new Date(j, m - 1, t);
  const optionen = { weekday: 'short', day: 'numeric', month: 'short' };
  if (j !== new Date().getFullYear()) optionen.year = 'numeric';
  return datum.toLocaleDateString('de-DE', optionen);
}
