// Daten der Routinen: Lesen und Schreiben nur über core/store.js.
// Tabellen: routinen (name, art, sperre, sperre_ab, reihenfolge), routine_schritte (routine_id, text, reihenfolge),
//           routine_logs (routine_id, tag, geschafft, fertig_am, ausgesetzt) – ein Eintrag je Routine und Tag.
import { getAll, save, remove } from '../../core/store.js';

export const ROUTINEN = 'routinen';
export const SCHRITTE = 'routine_schritte';
export const LOGS = 'routine_logs';
export const TABELLEN = [ROUTINEN, SCHRITTE, LOGS];

export const ARTEN = [
  { id: 'morgen', label: 'Morgen' },
  { id: 'abend', label: 'Abend' },
  { id: 'frei', label: 'Frei' },
];
const RANG = { morgen: 0, abend: 1, frei: 2 };

const zwei = (n) => String(n).padStart(2, '0');
export const tagISO = (d = new Date()) => `${d.getFullYear()}-${zwei(d.getMonth() + 1)}-${zwei(d.getDate())}`;

// Alles auf einmal: Routinen sortiert (Morgen, Abend, Frei, dann Reihenfolge/Name), je mit schritte und logs.
export async function ladeAlles() {
  const [routinen, schritte, logs] = await Promise.all([getAll(ROUTINEN), getAll(SCHRITTE), getAll(LOGS)]);
  return routinen
    .sort((a, b) => RANG[a.art] - RANG[b.art] || a.reihenfolge - b.reihenfolge || a.name.localeCompare(b.name, 'de'))
    .map((r) => ({
      ...r,
      schritte: schritte.filter((s) => s.routine_id === r.id).sort((a, b) => a.reihenfolge - b.reihenfolge),
      logs: logs.filter((l) => l.routine_id === r.id),
    }));
}

// Stand eines Tages; zwei Einträge am selben Tag (zwei Geräte) → der weitere zählt.
export function logAm(routine, tag = tagISO()) {
  return routine.logs.filter((l) => l.tag === tag)
    .sort((a, b) => !!b.fertig_am - !!a.fertig_am || b.geschafft - a.geschafft)[0] ?? null;
}

export async function neueRoutine(felder) {
  return save(ROUTINEN, { sperre: false, ...felder, reihenfolge: Date.now() });
}

export function aendereRoutine(felder) {
  return save(ROUTINEN, felder);
}

// Schritte aus Textzeilen übernehmen: gleiche Position behält ihre id, überzählige werden gelöscht.
export async function setzeSchritte(routine, zeilen) {
  for (const [i, text] of zeilen.entries()) {
    const alt = routine.schritte[i];
    if (alt && alt.text === text && alt.reihenfolge === i) continue;
    await save(SCHRITTE, { ...(alt ? { id: alt.id } : {}), routine_id: routine.id, text, reihenfolge: i });
  }
  for (const s of routine.schritte.slice(zeilen.length)) await remove(SCHRITTE, s.id);
}

export async function loescheRoutine(routine) {
  for (const s of routine.schritte) await remove(SCHRITTE, s.id);
  for (const l of routine.logs) await remove(LOGS, l.id);
  await remove(ROUTINEN, routine.id);
}

// Stand heute speichern (nach jedem Schritt). alt = bisheriger Eintrag von heute (oder null); gibt den neuen zurück.
// Einmal fertig bleibt der Tag fertig (auch wenn die Routine nochmal durchlaufen wird).
export function speichereStand(routine, geschafft, alt) {
  const fertig = alt?.fertig_am || geschafft >= routine.schritte.length;
  return save(LOGS, {
    ...(alt ? { id: alt.id } : {}),
    routine_id: routine.id,
    tag: tagISO(),
    geschafft: Math.max(geschafft, alt?.fertig_am ? alt.geschafft : 0),
    fertig_am: fertig ? alt?.fertig_am || new Date().toISOString() : null,
  });
}

// Diese Woche Mo–So: [{ tag, fertig, zukunft }]
export function wocheTage(routine) {
  const fertig = new Set(routine.logs.filter((l) => l.fertig_am).map((l) => l.tag));
  const h = new Date();
  const mo = h.getDate() - ((h.getDay() + 6) % 7);
  return Array.from({ length: 7 }, (_, i) => {
    const tag = tagISO(new Date(h.getFullYear(), h.getMonth(), mo + i));
    return { tag, fertig: fertig.has(tag), zukunft: tag > tagISO(h) };
  });
}

// Tage in Folge vollständig (bis heute, oder bis gestern, wenn heute noch offen ist).
export function serie(routine) {
  const fertig = new Set(routine.logs.filter((l) => l.fertig_am).map((l) => l.tag));
  const h = new Date();
  let i = fertig.has(tagISO(h)) ? 0 : 1;
  let n = 0;
  while (fertig.has(tagISO(new Date(h.getFullYear(), h.getMonth(), h.getDate() - i)))) { n++; i++; }
  return n;
}

// Sperre: ab wann sie gilt („HH:MM“). Ohne eigene Zeit: Abend 20:00, sonst 04:00.
export const sperreAb = (r) => r.sperre_ab || (r.art === 'abend' ? '20:00' : '04:00');

// Routine, die die App gerade sperrt (früheste Startzeit zuerst), sonst null.
export function sperrendeRoutine(routinen, jetzt = new Date()) {
  const uhr = `${String(jetzt.getHours()).padStart(2, '0')}:${String(jetzt.getMinutes()).padStart(2, '0')}`;
  const tag = tagISO(jetzt);
  return routinen
    .filter((r) => r.sperre && r.schritte.length && uhr >= sperreAb(r))
    .filter((r) => !r.logs.some((l) => l.tag === tag && (l.fertig_am || l.ausgesetzt)))
    .sort((a, b) => sperreAb(a).localeCompare(sperreAb(b)))[0] ?? null;
}

// „Heute aussetzen“: Sperre für heute aufheben, zählt nicht als geschafft.
export function setzeAus(routine) {
  const alt = logAm(routine);
  return save(LOGS, { ...(alt ? { id: alt.id } : { routine_id: routine.id, tag: tagISO(), geschafft: 0, fertig_am: null }), ausgesetzt: true });
}
