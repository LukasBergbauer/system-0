// Daten der Gewohnheiten: Lesen und Schreiben nur über core/store.js.
// Tabellen: gewohnheiten (name, art auf/ab, messart, ziel, seit, reihenfolge),
//           gewohnheit_logs (gewohnheit_id, tag, wert), rueckfaelle (gewohnheit_id, tag, ausloeser[], notiz).
import { getAll, save, remove } from '../../core/store.js';

export const GEWOHNHEITEN = 'gewohnheiten';
export const LOGS = 'gewohnheit_logs';
export const RUECKFAELLE = 'rueckfaelle';
export const TABELLEN = [GEWOHNHEITEN, LOGS, RUECKFAELLE];

export const ARTEN = [{ id: 'auf', label: 'Aufbauen' }, { id: 'ab', label: 'Abbauen' }];
export const MESSARTEN = [{ id: 'haken', label: 'Abhaken' }, { id: 'anzahl', label: 'Anzahl' }, { id: 'zeit', label: 'Zeit' }];
export const AUSLOESER = ['Stress', 'Langeweile', 'Müde', 'Gesellschaft', 'Gewohnheit', 'Belohnung'];
export const SCHRITT = { haken: 1, anzahl: 1, zeit: 5 }; // ein Tipp = so viel mehr

const zwei = (n) => String(n).padStart(2, '0');
export const tagISO = (d = new Date()) => `${d.getFullYear()}-${zwei(d.getMonth() + 1)}-${zwei(d.getDate())}`;
const tageZwischen = (a, b) => Math.round((new Date(`${b}T12:00`) - new Date(`${a}T12:00`)) / 864e5);
const vor = (i) => { const h = new Date(); return tagISO(new Date(h.getFullYear(), h.getMonth(), h.getDate() - i)); };

export async function ladeAlles() {
  const [gew, logs, rf] = await Promise.all([getAll(GEWOHNHEITEN), getAll(LOGS), getAll(RUECKFAELLE)]);
  return gew
    .sort((a, b) => a.reihenfolge - b.reihenfolge || a.name.localeCompare(b.name, 'de'))
    .map((g) => ({
      ...g,
      logs: logs.filter((l) => l.gewohnheit_id === g.id),
      rueckfaelle: rf.filter((r) => r.gewohnheit_id === g.id).sort((a, b) => a.tag.localeCompare(b.tag)),
    }));
}

export function speichereGewohnheit(felder) {
  return save(GEWOHNHEITEN, felder.id ? felder : { ...felder, reihenfolge: Date.now() });
}

export async function loescheGewohnheit(g) {
  for (const l of g.logs) await remove(LOGS, l.id);
  for (const r of g.rueckfaelle) await remove(RUECKFAELLE, r.id);
  await remove(GEWOHNHEITEN, g.id);
}

// ---- Aufbauen ----
const logAm = (g, tag) => g.logs.filter((l) => l.tag === tag).sort((a, b) => b.wert - a.wert)[0] ?? null;
export const wertAm = (g, tag = tagISO()) => logAm(g, tag)?.wert || 0;
const geschafft = (g, tag) => wertAm(g, tag) >= g.ziel;

// Andere Einträge desselben Tags (zweites Gerät) werden entfernt – sonst bliebe nach dem Zurücksetzen der höhere stehen.
export async function setzeWert(g, wert) {
  const alt = logAm(g, tagISO());
  for (const l of g.logs) if (l.tag === tagISO() && l.id !== alt?.id) await remove(LOGS, l.id);
  return save(LOGS, { ...(alt ? { id: alt.id } : {}), gewohnheit_id: g.id, tag: tagISO(), wert: Math.max(0, wert) });
}

// Diese Woche Mo–So: [{ tag, fertig, zukunft }]
export function wocheTage(g) {
  const h = new Date();
  const mo = h.getDate() - ((h.getDay() + 6) % 7);
  return Array.from({ length: 7 }, (_, i) => {
    const tag = tagISO(new Date(h.getFullYear(), h.getMonth(), mo + i));
    return { tag, fertig: geschafft(g, tag), zukunft: tag > tagISO(h) };
  });
}

// Tage in Folge geschafft (bis heute, oder bis gestern, wenn heute noch offen ist).
export function serie(g) {
  let i = geschafft(g, vor(0)) ? 0 : 1;
  let n = 0;
  while (geschafft(g, vor(i))) { n++; i++; }
  return n;
}

// ---- Abbauen ----
// Tage ohne seit dem letzten Rückfall (bzw. seit Beginn).
export function tageOhne(g) {
  const letzter = g.rueckfaelle.at(-1)?.tag;
  return Math.max(0, tageZwischen(letzter && letzter > g.seit ? letzter : g.seit, tagISO()));
}

// Längste Strecke ohne Rückfall (inkl. der laufenden).
export function besteSerie(g) {
  const punkte = [g.seit, ...g.rueckfaelle.map((r) => r.tag).filter((t) => t >= g.seit), tagISO()];
  return Math.max(0, ...punkte.slice(1).map((t, i) => tageZwischen(punkte[i], t)));
}

// Häufigste Auslöser: [[name, anzahl], …] absteigend.
export function ausloeserZaehlen(g) {
  const z = {};
  for (const r of g.rueckfaelle) for (const a of r.ausloeser || []) z[a] = (z[a] || 0) + 1;
  return Object.entries(z).sort((a, b) => b[1] - a[1]);
}

export function rueckfallEintragen(g, ausloeser, notiz) {
  return save(RUECKFAELLE, { gewohnheit_id: g.id, tag: tagISO(), ausloeser, notiz: notiz || null });
}
