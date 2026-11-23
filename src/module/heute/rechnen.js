// Heute: alle Zahlen für das Dashboard aus den Rohdaten (reine Rechnungen, nichts wird gespeichert).
// rechne({ todos, jetzt }) → { dinge, woche, kacheln … }.
const zwei = (n) => String(n).padStart(2, '0');
export const tagISO = (d) => `${d.getFullYear()}-${zwei(d.getMonth() + 1)}-${zwei(d.getDate())}`;
export const plusTage = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const zaehle = (liste, test) => liste.filter(test).length;

// Kalenderwoche nach ISO (Woche mit dem ersten Donnerstag = KW 1)
function kalenderwoche(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  return Math.ceil(((t - Date.UTC(t.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7);
}

// Tage in Folge mit mindestens einem erledigten To-do: aktuelle Serie (bis heute oder gestern) und längste.
function serien(tage, heute) {
  let d = tage.has(tagISO(heute)) ? heute : plusTage(heute, -1);
  let aktuell = 0;
  while (tage.has(tagISO(d))) { aktuell++; d = plusTage(d, -1); }
  let rekord = 0, lauf = 0, vorher = null;
  for (const t of [...tage].sort()) {
    const [j, m, n] = t.split('-').map(Number);
    lauf = vorher && tagISO(plusTage(vorher, 1)) === t ? lauf + 1 : 1;
    vorher = new Date(j, m - 1, n);
    rekord = Math.max(rekord, lauf);
  }
  return { aktuell, rekord };
}

// Pfeil + Zahl für die kleine Trend-Pille; gut = Richtung ist erfreulich
function trend(diff, gutWennWeniger = false) {
  const text = diff > 0 ? `↗ ${diff}` : diff < 0 ? `↘ ${-diff}` : '→ 0';
  return { text, gut: gutWennWeniger ? diff <= 0 : diff >= 0 };
}

export function rechne({ todos, jetzt = new Date() }) {
  const heute = plusTage(jetzt, 0); // 0:00 Uhr
  const h = tagISO(heute);
  const montag = plusTage(heute, -((heute.getDay() + 6) % 7));
  const mo = tagISO(montag), so = tagISO(plusTage(montag, 6));
  const offen = todos.filter((t) => !t.erledigt_am);
  const erledigtAm = (t) => t.erledigt_am && tagISO(new Date(t.erledigt_am));

  const ueberfaellig = zaehle(offen, (t) => t.faellig_am && t.faellig_am < h);
  const heuteFaellig = zaehle(offen, (t) => t.faellig_am === h);

  // Woche: To-dos mit Fälligkeit Mo–So → Anteil erledigt
  const dieseWoche = todos.filter((t) => t.faellig_am >= mo && t.faellig_am <= so);
  const wocheErledigt = zaehle(dieseWoche, (t) => t.erledigt_am);
  const quote = dieseWoche.length ? wocheErledigt / dieseWoche.length : null;

  // letzte 7 Tage (ältester zuerst) für die Mini-Kurven
  const sieben = [6, 5, 4, 3, 2, 1, 0].map((n) => plusTage(heute, -n));
  const offenAm = (tag) => {
    const ende = +plusTage(tag, 1);
    return zaehle(todos, (t) => Date.parse(t.created_at) < ende && (!t.erledigt_am || Date.parse(t.erledigt_am) >= ende));
  };
  const tageMitErledigt = new Set(todos.map(erledigtAm).filter(Boolean));
  const serie = serien(tageMitErledigt, heute);

  return {
    dinge: ueberfaellig + heuteFaellig,
    woche: {
      kw: kalenderwoche(heute),
      quote,
      erledigt: zaehle(todos, (t) => erledigtAm(t) >= mo && erledigtAm(t) <= so),
      heuteFaellig,
      ueberfaellig,
      offenWoche: dieseWoche.length - wocheErledigt,
    },
    offen: {
      zahl: offen.length,
      heute: heuteFaellig,
      trend: trend(offen.length - offenAm(plusTage(heute, -7)), true),
      kurve: sieben.map(offenAm),
    },
    serie: {
      tage: serie.aktuell,
      rekord: serie.aktuell > 0 && serie.aktuell >= serie.rekord,
      kurve: sieben.map((tag) => zaehle(todos, (t) => erledigtAm(t) === tagISO(tag))),
    },
  };
}
