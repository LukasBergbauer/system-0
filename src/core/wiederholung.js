// Wiederholungsregel (RRULE) ausrechnen → Liste aller Beginn-Zeitpunkte bis „bis“ (Google-Termine und eigene).
// Kann: FREQ=DAILY/WEEKLY/MONTHLY/YEARLY, INTERVAL, COUNT, UNTIL, BYDAY bei WEEKLY (z. B. Mo + Do).
// shortcut: Seltene Regeln (z. B. „jeden 2. Dienstag im Monat“, BYSETPOS, BYMONTHDAY) → nur der erste Termin.
const plusTage = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

const TAGE = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']; // Index = getDay()
const UNTERSTUETZT = new Set(['FREQ', 'INTERVAL', 'COUNT', 'UNTIL', 'BYDAY', 'WKST']);
const GRENZE = 20000; // Schutz vor Endlosschleifen (reicht für ~50 Jahre täglich)

// '20261231T225959Z' oder '20261231' → Date
function bisDatum(wert) {
  const m = wert.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z?))?$/);
  if (!m) return null;
  const [, j, mo, t, h = '23', mi = '59', s = '59', utc] = m;
  return utc ? new Date(Date.UTC(+j, mo - 1, +t, +h, +mi, +s)) : new Date(+j, mo - 1, +t, +h, +mi, +s);
}

// Gleiche Uhrzeit, n Monate später; gibt es den Tag nicht (31. Feb.) → null
function plusMonate(d, n) {
  const x = new Date(d.getFullYear(), d.getMonth() + n, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
  return x.getDate() === d.getDate() ? x : null;
}

export function wiederhole(start, rrule, bis) {
  const regel = Object.fromEntries(rrule.split(';').map((teil) => teil.split('=')));
  const takt = Math.max(1, +regel.INTERVAL || 1);
  const anzahl = regel.COUNT ? +regel.COUNT : Infinity;
  const ende = regel.UNTIL ? bisDatum(regel.UNTIL) : null;
  const tage = regel.BYDAY ? regel.BYDAY.split(',').map((t) => TAGE.indexOf(t)) : null;

  const seltsam = Object.keys(regel).some((k) => !UNTERSTUETZT.has(k))
    || (tage && (regel.FREQ !== 'WEEKLY' || tage.includes(-1)));
  if (seltsam || !['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].includes(regel.FREQ)) return [start];

  // Kandidaten der Reihe nach erzeugen; i = Nummer des Schritts (Tag, Woche, Monat, Jahr)
  function kandidaten(i) {
    if (regel.FREQ === 'DAILY') return [plusTage(start, i * takt)];
    if (regel.FREQ === 'WEEKLY') {
      if (!tage) return [plusTage(start, i * 7 * takt)];
      const montag = plusTage(start, -((start.getDay() + 6) % 7) + i * 7 * takt);
      return tage.map((t) => plusTage(montag, (t + 6) % 7)).sort((a, b) => a - b).filter((d) => d >= start);
    }
    return [plusMonate(start, i * takt * (regel.FREQ === 'YEARLY' ? 12 : 1))].filter(Boolean);
  }

  const starts = [];
  for (let i = 0; i < GRENZE; i++) {
    for (const d of kandidaten(i)) {
      if (d >= bis || (ende && d > ende) || starts.length >= anzahl) return starts;
      starts.push(d);
    }
  }
  return starts;
}

// Eigene Termine mit Regel `wiederholung` in einzelne Vorkommen aufklappen (120 Tage zurück bis 400 Tage voraus).
// Jedes Vorkommen behält die id und zeigt mit `serie` auf den gespeicherten Termin (zum Bearbeiten).
export function aufklappen(termine) {
  const von = Date.now() - 120 * 864e5;
  const bis = new Date(Date.now() + 400 * 864e5);
  return termine.flatMap((t) => {
    if (!t.wiederholung) return [t];
    const s = new Date(t.start);
    const dauer = Date.parse(t.ende) - +s;
    const tage = Math.round(dauer / 864e5); // ganztägig: über Zeitumstellung hinweg in Tagen rechnen
    return wiederhole(s, t.wiederholung, bis)
      .map((d) => ({ d, e: t.ganztaegig ? plusTage(d, tage) : new Date(+d + dauer) }))
      .filter(({ e }) => +e > von)
      .map(({ d, e }) => ({ ...t, start: d.toISOString(), ende: e.toISOString(), serie: t }));
  });
}
