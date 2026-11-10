// Daten von Physio: Lesen und Schreiben nur über core/store.js.
// Tabellen: physio_eintraege (art, titel, kurz, text, felder, video)
//           physio_links (a_id, b_id) – Verknüpfung gilt in beide Richtungen
import { getAll, save, remove } from '../../core/store.js';
import { loescheBilderVon } from './bilder.js';

export const EINTRAEGE = 'physio_eintraege';
export const LINKS = 'physio_links';

export async function ladeEintraege() {
  const rows = await getAll(EINTRAEGE);
  return rows.sort((a, b) => a.titel.localeCompare(b.titel, 'de'));
}

export function ladeLinks() {
  return getAll(LINKS);
}

// Schnell anlegen: nur Art und Titel, Rest später.
export function neuerEintrag(art, titel) {
  return save(EINTRAEGE, { art, titel, kurz: '', text: '', felder: {}, video: '' });
}

// Ändert nur die übergebenen Felder (id muss dabei sein).
export function aendereEintrag(felder) {
  return save(EINTRAEGE, felder);
}

// Eintrag weich löschen, seine Verknüpfungen und Bilder gleich mit.
export async function loescheEintrag(id) {
  await loescheBilderVon(id);
  for (const l of await ladeLinks()) {
    if (l.a_id === id || l.b_id === id) await remove(LINKS, l.id);
  }
  await remove(EINTRAEGE, id);
}

// ---------- Verknüpfungen ----------

const verbindet = (l, x, y) => (l.a_id === x && l.b_id === y) || (l.a_id === y && l.b_id === x);

// Verknüpft zwei Einträge. Gibt es die Verknüpfung schon (egal in welcher Richtung), passiert nichts.
export async function verknuepfe(aId, bId) {
  if (!aId || !bId || aId === bId) return null;
  const vorhanden = (await ladeLinks()).find((l) => verbindet(l, aId, bId));
  return vorhanden ?? save(LINKS, { a_id: aId, b_id: bId });
}

// Löst die Verknüpfung (alle, falls durch zwei Geräte doppelt entstanden).
export async function loese(aId, bId) {
  for (const l of await ladeLinks()) {
    if (verbindet(l, aId, bId)) await remove(LINKS, l.id);
  }
}

// Nachbarn eines Eintrags (ohne gelöschte, ohne doppelte), nach Titel sortiert.
export function nachbarn(id, eintraege, links) {
  const nachId = new Map(eintraege.map((e) => [e.id, e]));
  const ids = new Set();
  for (const l of links) {
    if (l.a_id === id) ids.add(l.b_id);
    else if (l.b_id === id) ids.add(l.a_id);
  }
  ids.delete(id);
  return [...ids].map((x) => nachId.get(x)).filter(Boolean)
    .sort((a, b) => a.titel.localeCompare(b.titel, 'de'));
}

// ---------- Suche ----------

// Klein, ohne Akzente: „Übung“ findet auch „ubung“.
export const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// Sucht in Titel, Kurzbeschreibung, Text und Feldern. Alle Wörter müssen vorkommen.
// Treffer im Titel stehen vorne, Titel-Anfang ganz vorne.
export function suche(eintraege, text) {
  const woerter = norm(text).split(/\s+/).filter(Boolean);
  if (!woerter.length) return [];
  const treffer = [];
  for (const e of eintraege) {
    const titel = norm(e.titel);
    const alles = [titel, norm(e.kurz), norm(e.text), ...Object.values(e.felder ?? {}).map(norm)].join(' ');
    if (!woerter.every((w) => alles.includes(w))) continue;
    const punkte = titel.startsWith(woerter[0]) ? 0 : woerter.every((w) => titel.includes(w)) ? 1 : 2;
    treffer.push({ e, punkte });
  }
  return treffer.sort((x, y) => x.punkte - y.punkte || x.e.titel.localeCompare(y.e.titel, 'de'))
    .map((t) => t.e);
}
