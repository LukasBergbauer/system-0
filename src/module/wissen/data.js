// Daten des Wissen-Quiz. Fragen: Grundstock aus fragen/<thema>.json (im Repo) + importierte aus Tabelle quiz_fragen.
// Frage im Speicher: { id, thema, f, a: [richtig, falsch, falsch, falsch], e }. Ergebnisse: quiz_ergebnisse.
import { getAll, save } from '../../core/store.js';

export const FRAGEN = 'quiz_fragen';
export const ERGEBNISSE = 'quiz_ergebnisse';
export const DAILY_ANZAHL = 5;
export const RUNDE_ANZAHL = 10;
export const THEMEN = [
  { id: 'allgemein', name: 'Allgemeinbildung' }, { id: 'geschichte', name: 'Geschichte' }, { id: 'geografie', name: 'Geografie' },
  { id: 'natur', name: 'Naturwissenschaft' }, { id: 'anatomie', name: 'Anatomie' }, { id: 'muskeln', name: 'Muskeln' }, { id: 'baender', name: 'Bänder' }, { id: 'physio', name: 'Physio' },
];

const zwei = (n) => String(n).padStart(2, '0');
export const tagISO = (d = new Date()) => `${d.getFullYear()}-${zwei(d.getMonth() + 1)}-${zwei(d.getDate())}`;
const vor = (i) => { const h = new Date(); return tagISO(new Date(h.getFullYear(), h.getMonth(), h.getDate() - i)); };

let grundstock = null; // einmal laden, bleibt im Speicher
async function ladeGrundstock() {
  grundstock ||= Promise.all(THEMEN.map(async (t) => {
    const liste = await fetch(new URL(`./fragen/${t.id}.json`, import.meta.url)).then((r) => r.json());
    return liste.map((q) => ({ ...q, thema: t.id }));
  })).then((x) => x.flat()).catch((e) => { grundstock = null; throw e; });
  return grundstock;
}

// Thema eines Imports: bekanntes Thema (Name oder id), sonst der Text selbst als eigenes Thema.
export function themaId(text) {
  const t = String(text || '').trim();
  return THEMEN.find((x) => x.id === t.toLowerCase() || x.name.toLowerCase() === t.toLowerCase())?.id || t || 'Eigene';
}
export const themaName = (id) => THEMEN.find((t) => t.id === id)?.name || id;

export async function ladeAlles() {
  const [basis, eigene, ergebnisse] = await Promise.all([ladeGrundstock(), getAll(FRAGEN), getAll(ERGEBNISSE)]);
  const fragen = [...basis, ...eigene.map((r) => ({ id: r.id, thema: themaId(r.thema), f: r.frage, a: r.antworten, e: r.erklaerung }))];
  return { fragen, ergebnisse: ergebnisse.sort((a, b) => a.tag.localeCompare(b.tag) || a.created_at.localeCompare(b.created_at)) };
}

export const themenVon = (fragen) => [...new Set(fragen.map((q) => q.thema))];

// Zufall mit festem Startwert (gleicher Tag → gleiche Auswahl auf Mac und iPhone).
function zufall(text) {
  let h = 1779033703;
  for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 3432918353), h = (h << 13) | (h >>> 19);
  return () => { h = Math.imul(h ^ (h >>> 16), 2246822507) + 0x6d2b79f5 | 0; return ((h >>> 0) % 1e9) / 1e9; };
}
export function mische(liste, rnd = Math.random) {
  const a = [...liste];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// Gesehene Fragen: Map id → { tag, ok } (letzte Antwort). Optional nur Runden vor einem Tag.
export function gesehen(ergebnisse, vorTag) {
  const m = new Map();
  for (const r of ergebnisse) if (!vorTag || r.tag < vorTag) for (const x of r.antworten || []) m.set(x.id, { tag: r.tag, ok: x.ok });
  return m;
}

// Daily: nie gesehene Fragen, aus dem Datum fest gemischt, je Thema höchstens eine (große Themen wie Muskeln
// sollen nicht alles füllen); reichen sie nicht, auffüllen, zuletzt mit den am längsten nicht gesehenen.
export function dailyFragen(fragen, ergebnisse, tag = tagISO()) {
  const g = gesehen(ergebnisse, tag);
  const rnd = zufall(tag);
  const nachId = [...fragen].sort((a, b) => a.id.localeCompare(b.id));
  const neu = mische(nachId.filter((q) => !g.has(q.id)), rnd);
  const alt = nachId.filter((q) => g.has(q.id)).sort((a, b) => g.get(a.id).tag.localeCompare(g.get(b.id).tag));
  const jeThema = mische(themenVon(nachId).sort(), rnd).map((t) => neu.find((q) => q.thema === t)).filter(Boolean);
  return [...new Set([...jeThema, ...neu, ...alt])].slice(0, DAILY_ANZAHL);
}

// Endlos: erst neue, dann falsch beantwortete, dann der Rest (am längsten her zuerst).
export function endlosFragen(fragen, ergebnisse, thema) {
  const g = gesehen(ergebnisse);
  const rang = (q) => (!g.has(q.id) ? 0 : g.get(q.id).ok ? 2 : 1);
  const pool = mische(fragen.filter((q) => !thema || q.thema === thema));
  pool.sort((a, b) => rang(a) - rang(b) || (rang(a) === 2 ? g.get(a.id).tag.localeCompare(g.get(b.id).tag) : 0));
  return mische(pool.slice(0, RUNDE_ANZAHL));
}

export const dailyHeute = (ergebnisse) => ergebnisse.find((r) => r.modus === 'daily' && r.tag === tagISO()) || null;

// Tage in Folge mit Daily (bis heute, oder bis gestern, wenn heute noch offen).
export function serie(ergebnisse) {
  const tage = new Set(ergebnisse.filter((r) => r.modus === 'daily').map((r) => r.tag));
  let i = tage.has(vor(0)) ? 0 : 1;
  let n = 0;
  while (tage.has(vor(i))) { n++; i++; }
  return n;
}

// Je Thema: gesamt, gesehen, richtig/beantwortet (alle Antworten).
export function statistik(fragen, ergebnisse) {
  const thema = new Map(fragen.map((q) => [q.id, q.thema]));
  const g = gesehen(ergebnisse);
  const s = new Map(themenVon(fragen).map((t) => [t, { thema: t, gesamt: 0, gesehen: 0, richtig: 0, beantwortet: 0 }]));
  for (const q of fragen) { const x = s.get(q.thema); x.gesamt++; if (g.has(q.id)) x.gesehen++; }
  for (const r of ergebnisse) for (const a of r.antworten || []) {
    const x = s.get(thema.get(a.id));
    if (x) { x.beantwortet++; if (a.ok) x.richtig++; }
  }
  return [...s.values()];
}

export function speichereErgebnis(modus, antworten) {
  return save(ERGEBNISSE, { tag: tagISO(), modus, richtig: antworten.filter((a) => a.ok).length, gesamt: antworten.length, antworten });
}

// Import aus einem Claude-Chat: JSON-Liste [{ thema, f, a: [richtig, …3 falsch], e }]. Doppelte Fragen werden übersprungen.
export async function importiere(text, vorhandene) {
  let liste;
  try { liste = JSON.parse(text.trim().replace(/^```(json)?|```$/g, '')); } catch { throw new Error('Kein gültiges JSON.'); }
  if (!Array.isArray(liste)) liste = liste?.fragen;
  if (!Array.isArray(liste)) throw new Error('Erwartet wird eine Liste von Fragen.');
  const schon = new Set(vorhandene.map((q) => q.f.trim().toLowerCase()));
  let neu = 0, doppelt = 0, falsch = 0;
  for (const q of liste) {
    const f = String(q?.f || q?.frage || '').trim();
    const a = (q?.a || q?.antworten || []).map((x) => String(x).trim());
    if (!f || a.length !== 4 || a.some((x) => !x) || new Set(a).size !== 4) { falsch++; continue; }
    if (schon.has(f.toLowerCase())) { doppelt++; continue; }
    schon.add(f.toLowerCase());
    await save(FRAGEN, { thema: themaId(q.thema), frage: f, antworten: a, erklaerung: String(q.e || q.erklaerung || '').trim() || null });
    neu++;
  }
  return { neu, doppelt, falsch };
}
