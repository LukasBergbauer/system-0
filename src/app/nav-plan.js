// Welche Bereiche wo stehen.
// Reihenfolge: Heute, To-dos, Kalender, Training, dann alle übrigen, „ende“-Bereiche (Einstellungen) ganz hinten.
// iPhone: bis zu 5 Bereiche passen direkt in die Tab-Leiste. Sind es mehr,
// zeigt sie die ersten 4 und „Mehr“ mit dem Rest. Fehlt ein Modul noch, rücken die anderen nach.
const TAB_REIHENFOLGE = ['heute', 'todos', 'kalender', 'training'];
const TAB_PLAETZE = 5;

export const MEHR = { id: 'mehr', titel: 'Mehr', symbol: 'mehr' };

export function navPlan(bereiche) {
  const sichtbar = bereiche.filter((b) => b.nav !== false);
  const vorne = TAB_REIHENFOLGE.map((id) => sichtbar.find((b) => b.id === id)).filter(Boolean);
  const rest = sichtbar.filter((b) => !TAB_REIHENFOLGE.includes(b.id));
  const alle = [...vorne, ...rest.filter((b) => !b.ende), ...rest.filter((b) => b.ende)];

  if (alle.length <= TAB_PLAETZE) return { alle, tabs: alle, mehr: [] };
  return { alle, tabs: alle.slice(0, TAB_PLAETZE - 1), mehr: alle.slice(TAB_PLAETZE - 1) };
}
