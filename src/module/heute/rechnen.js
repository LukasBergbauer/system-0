// Heute: alle Zahlen für das Dashboard aus den Rohdaten (reine Rechnungen, nichts wird gespeichert).
// rechne({ todos, termine, jetzt }) → { ueberfaellig, heuteFaellig, termineHeute, offen }. termine = eigene + Google.
const zwei = (n) => String(n).padStart(2, '0');
export const tagISO = (d) => `${d.getFullYear()}-${zwei(d.getMonth() + 1)}-${zwei(d.getDate())}`;
export const plusTage = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const zaehle = (liste, test) => liste.filter(test).length;

// liegt der Termin (auch teilweise) am Tag, der um 0:00 Uhr „tag“ beginnt?
export function amTag(t, tag) {
  const s = new Date(t.start);
  const e = Math.max(+new Date(t.ende || t.start), +s + 1);
  return s < plusTage(tag, 1) && e > tag;
}

// Zahlen für Kopf und kleine Felder: was heute ansteht.
export function rechne({ todos, termine, jetzt = new Date() }) {
  const heute = plusTage(jetzt, 0); // 0:00 Uhr
  const h = tagISO(heute);
  const offen = todos.filter((t) => !t.erledigt_am);
  const ueberfaellig = zaehle(offen, (t) => t.faellig_am && t.faellig_am < h);
  const heuteFaellig = zaehle(offen, (t) => t.faellig_am === h);
  const termineHeute = zaehle(termine, (t) => amTag(t, heute));
  return { ueberfaellig, heuteFaellig, termineHeute, offen: offen.length };
}
