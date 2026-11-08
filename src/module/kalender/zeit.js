// Datum und Uhrzeit für den Kalender: Umrechnen, Gruppen der Liste, Texte.
// Alles in der Zeitzone des Geräts. Ganztägig: ende = 0:00 Uhr des Tags nach dem letzten Tag.

const zwei = (n) => String(n).padStart(2, '0');

// Date → 'JJJJ-MM-TT'
export function tagISO(d) {
  return `${d.getFullYear()}-${zwei(d.getMonth() + 1)}-${zwei(d.getDate())}`;
}

// Date → 'HH:MM'
export function zeitHM(d) {
  return `${zwei(d.getHours())}:${zwei(d.getMinutes())}`;
}

// 'JJJJ-MM-TT' + 'HH:MM' → Date
export function ausTagZeit(tag, zeit = '00:00') {
  const [j, m, t] = tag.split('-').map(Number);
  const [h, min] = zeit.split(':').map(Number);
  return new Date(j, m - 1, t, h, min);
}

export function plusTage(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export const mitternacht = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// Date → 'Heute', 'Morgen' oder 'Do., 13. Nov.' (Jahr nur, wenn nicht dieses Jahr)
export function tagText(d) {
  const heute = mitternacht(new Date());
  const tag = mitternacht(d);
  if (+tag === +heute) return 'Heute';
  if (+tag === +plusTage(heute, 1)) return 'Morgen';
  const optionen = { weekday: 'short', day: 'numeric', month: 'short' };
  if (d.getFullYear() !== heute.getFullYear()) optionen.year = 'numeric';
  return d.toLocaleDateString('de-DE', optionen);
}

// Letzter Tag eines Termins (bei ganztägig ist ende schon der Folgetag).
export function letzterTag(t) {
  const ende = new Date(t.ende);
  return t.ganztaegig ? plusTage(ende, -1) : ende;
}

const GRUPPEN = [
  { id: 'heute', titel: 'Heute' }, // auch Termine, die schon vor heute begonnen haben und noch laufen
  { id: 'morgen', titel: 'Morgen' },
  { id: 'woche', titel: 'Diese Woche' }, // die nächsten 7 Tage nach morgen
  { id: 'spaeter', titel: 'Später' },
];

// Nur Termine, die noch nicht vorbei sind, nach Beginn sortiert → [{ id, titel, termine }]
export function gruppiere(termine) {
  const jetzt = Date.now();
  const heute = mitternacht(new Date());
  const grenzen = { morgen: plusTage(heute, 1), woche: plusTage(heute, 2), spaeter: plusTage(heute, 9) };
  const fach = new Map(GRUPPEN.map((g) => [g.id, []]));
  termine
    .filter((t) => Date.parse(t.ende) > jetzt)
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start))
    .forEach((t) => {
      const s = new Date(t.start);
      const id = s >= grenzen.spaeter ? 'spaeter' : s >= grenzen.woche ? 'woche' : s >= grenzen.morgen ? 'morgen' : 'heute';
      fach.get(id).push(t);
    });
  return GRUPPEN.map((g) => ({ ...g, termine: fach.get(g.id) })).filter((g) => g.termine.length);
}
