// Daten des Trainings: Lesen und Schreiben nur über core/store.js.
// Tabellen: training_uebungen (name, physio_id, notiz, messung), einheiten (datum, titel, art, gefuehl, belastung, dauer, notiz),
//           saetze (einheit_id, uebung_id, reihenfolge, wdh, gewicht, zeit, distanz).
// Physio-Übungen werden nur gelesen (Tabelle physio_eintraege, art 'uebung'), nie kopiert.
import { getAll, save, remove } from '../../core/store.js';

export const UEBUNGEN = 'training_uebungen';
export const EINHEITEN = 'einheiten';
export const SAETZE = 'saetze';
export const PHYSIO = 'physio_eintraege';
export const TABELLEN = [UEBUNGEN, EINHEITEN, SAETZE, PHYSIO, 'trainingsplaene', 'plan_einheiten'];

export const ARTEN = [
  { id: 'kraft', label: 'Kraft' },
  { id: 'ausdauer', label: 'Ausdauer' },
  { id: 'hyrox', label: 'Hyrox' },
  { id: 'physio', label: 'Physio' },
  { id: 'frei', label: 'Frei' },
];
export const MESSUNG = [
  { id: 'wdh', label: 'Wdh' },
  { id: 'gewicht', label: 'kg' },
  { id: 'zeit', label: 'Zeit' },
  { id: 'distanz', label: 'm' },
];
// Vorlagen: werden erst beim Wählen als eigene Übung angelegt.
export const HYROX = [
  ['SkiErg', ['distanz', 'zeit']], ['Sled Push', ['distanz', 'gewicht', 'zeit']], ['Sled Pull', ['distanz', 'gewicht', 'zeit']],
  ['Burpee Broad Jumps', ['distanz', 'zeit']], ['Rudern', ['distanz', 'zeit']], ['Farmers Carry', ['distanz', 'gewicht', 'zeit']],
  ['Sandbag Lunges', ['distanz', 'gewicht', 'zeit']], ['Wall Balls', ['wdh', 'gewicht', 'zeit']], ['Laufen', ['distanz', 'zeit']],
].map(([name, messung]) => ({ name, messung }));

const zwei = (n) => String(n).padStart(2, '0');
export const tagISO = (d = new Date()) => `${d.getFullYear()}-${zwei(d.getMonth() + 1)}-${zwei(d.getDate())}`;

// Alles auf einmal. uebungen bekommen name/physio aufgelöst, einheiten ihre saetze (sortiert), neueste zuerst;
// dazu plaene (aktiver zuerst) und planEinheiten (nach Wochentag).
export async function ladeAlles() {
  const [uebungen, einheiten, saetze, physio, plaene, planEinheiten] = await Promise.all(TABELLEN.map((t) => getAll(t)));
  const physioNach = new Map(physio.map((p) => [p.id, p]));
  const ue = new Map(uebungen.map((u) => {
    const p = u.physio_id ? physioNach.get(u.physio_id) : null;
    return [u.id, { ...u, physio: p, name: p?.titel || u.name || 'Übung' }];
  }));
  const einh = einheiten
    .map((e) => ({ ...e, saetze: saetze.filter((s) => s.einheit_id === e.id).sort((a, b) => a.reihenfolge - b.reihenfolge) }))
    .sort((a, b) => b.datum.localeCompare(a.datum) || b.created_at.localeCompare(a.created_at));
  const physioUebungen = physio.filter((p) => p.art === 'uebung').sort((a, b) => a.titel.localeCompare(b.titel, 'de'));
  plaene.sort((a, b) => b.aktiv - a.aktiv || a.name.localeCompare(b.name, 'de'));
  planEinheiten.sort((a, b) => a.wochentag - b.wochentag || a.reihenfolge - b.reihenfolge);
  return { uebungen: ue, einheiten: einh, physioUebungen, plaene, planEinheiten };
}

// Übungen einer Einheit in der Reihenfolge ihres ersten Satzes: [{ uebung_id, saetze }]
export function gruppen(einheit) {
  const m = new Map();
  for (const s of einheit.saetze) (m.get(s.uebung_id) || m.set(s.uebung_id, []).get(s.uebung_id)).push(s);
  return [...m].map(([uebung_id, saetze]) => ({ uebung_id, saetze }));
}

export const neueEinheit = () => save(EINHEITEN, { datum: tagISO(), art: 'kraft', titel: '', notiz: '' });
export const aendere = (table, felder) => save(table, felder);

export async function loescheEinheit(e) {
  for (const s of e.saetze) await remove(SAETZE, s.id);
  await remove(EINHEITEN, e.id);
}

// Leere Einheit (keine Sätze, kein Text) beim Verlassen wegräumen.
export async function aufraeumen(e) {
  if (!e.saetze.length && !e.titel && !e.notiz && !e.gefuehl && !e.belastung && !e.dauer) await remove(EINHEITEN, e.id);
}

// Neuer Satz; übernimmt die Werte von vorlage (letzter Satz).
export function neuerSatz(einheit_id, uebung_id, vorlage) {
  const { wdh = null, gewicht = null, zeit = null, distanz = null } = vorlage || {};
  return save(SAETZE, { einheit_id, uebung_id, reihenfolge: Date.now(), wdh, gewicht, zeit, distanz });
}
export const loescheSatz = (id) => remove(SAETZE, id);

// Eigene Übung aus Vorlage/Name oder als Verweis auf eine Physio-Übung (vorhandener Verweis wird wiederverwendet).
export function neueUebung({ name = '', messung = ['wdh', 'gewicht'], physio_id = null }) {
  return save(UEBUNGEN, { name, messung, physio_id, notiz: '' });
}
export async function uebungZuPhysio(physio_id, uebungen) {
  return [...uebungen.values()].find((u) => u.physio_id === physio_id) || neueUebung({ physio_id, messung: ['wdh'] });
}
export async function loescheUebung(u, einheiten) {
  for (const e of einheiten) for (const s of e.saetze) if (s.uebung_id === u.id) await remove(SAETZE, s.id);
  await remove(UEBUNGEN, u.id);
}

// Zeit: Sekunden ↔ „m:ss“ (auch „1:02:03“). Eingabe „90“ = 90 Sekunden.
export function zeitText(s) {
  if (s == null) return '';
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return h ? `${h}:${zwei(m)}:${zwei(r)}` : `${m}:${zwei(r)}`;
}
export function zeitLesen(t) {
  const teile = String(t).trim().split(':').map(Number);
  if (!t.trim() || teile.some((n) => Number.isNaN(n))) return null;
  return teile.reduce((summe, n) => summe * 60 + n, 0);
}
