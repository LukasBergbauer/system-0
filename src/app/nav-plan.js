// Welche Bereiche wo stehen.
// Mac (Seitenleiste): Abschnitte ALLTAG / KÖRPER & KOPF / SYSTEM. Unbekannte Bereiche landen in ALLTAG,
// „ende“-Bereiche (Einstellungen) in SYSTEM. Neues Modul → seine id unten in den passenden Abschnitt.
// iPhone (Tab-Leiste): Heute, To-dos, Kalender, Training, dann der Rest, „ende“ ganz hinten.
// Bis zu 5 passen direkt hinein, sonst die ersten 4 + „Mehr“. „Kommt bald“-Bereiche (bald: true) nur in der Seitenleiste.
const TAB_REIHENFOLGE = ['heute', 'todos', 'kalender', 'training'];
const TAB_PLAETZE = 5;
const ABSCHNITTE = [
  { titel: 'ALLTAG', ids: ['heute', 'kalender', 'todos', 'routinen'] },
  { titel: 'KÖRPER & KOPF', ids: ['physio', 'training', 'ziele', 'affirmationen', 'quiz', 'buecher'] },
];

export const MEHR = { id: 'mehr', titel: 'Mehr', symbol: 'mehr' };

function abschnitte(sichtbar) {
  const nachIds = (ids) => ids.map((id) => sichtbar.find((b) => b.id === id && !b.ende)).filter(Boolean);
  const bekannt = ABSCHNITTE.flatMap((a) => a.ids);
  const liste = ABSCHNITTE.map((a) => ({ titel: a.titel, bereiche: nachIds(a.ids) }));
  liste[0].bereiche.push(...sichtbar.filter((b) => !b.ende && !bekannt.includes(b.id)));
  liste.push({ titel: 'SYSTEM', bereiche: sichtbar.filter((b) => b.ende) });
  return liste.filter((a) => a.bereiche.length > 0);
}

export function navPlan(bereiche) {
  const sichtbar = bereiche.filter((b) => b.nav !== false);
  const fuerTabs = sichtbar.filter((b) => !b.bald);
  const vorne = TAB_REIHENFOLGE.map((id) => fuerTabs.find((b) => b.id === id)).filter(Boolean);
  const rest = fuerTabs.filter((b) => !TAB_REIHENFOLGE.includes(b.id));
  const alle = [...vorne, ...rest.filter((b) => !b.ende), ...rest.filter((b) => b.ende)];
  const plan = { alle, abschnitte: abschnitte(sichtbar) };

  if (alle.length <= TAB_PLAETZE) return { ...plan, tabs: alle, mehr: [] };
  return { ...plan, tabs: alle.slice(0, TAB_PLAETZE - 1), mehr: alle.slice(TAB_PLAETZE - 1) };
}
