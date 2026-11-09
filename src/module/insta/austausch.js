// Austausch mit Claude: Import (Skripte, Zahlen, Erkenntnisse als JSON) und Export (alle Posts mit Zahlen).
// Import-Format: { "posts": [ { schluessel, titel, art, status, datum, hook, skript, cta, caption, hashtags, notiz, zahlen } ],
//                  "erkenntnisse": [ { text, warum, belege } ] }  – oder nur eine Liste von Posts.
// Gleicher schluessel (sonst gleicher Titel) → Post wird aktualisiert; nur mitgeschickte Felder ändern sich.
// Zahlen ohne Status → Post gilt als gepostet.
import { getAll, save } from '../../core/store.js';
import { POSTS, ERKENNTNISSE, STATUS, ARTEN, ZAHLEN, heuteISO } from './data.js';

const TEXTE = ['titel', 'hook', 'skript', 'cta', 'caption', 'hashtags', 'notiz'];
const norm = (s) => String(s || '').trim().toLowerCase();

function lies(text) {
  const roh = text.trim().replace(/^```(json)?\s*|\s*```$/g, '');
  try { return JSON.parse(roh); } catch { throw new Error('Kein gültiges JSON.'); }
}

// Nur bekannte Felder übernehmen, Werte prüfen.
function felder(p) {
  const f = {};
  for (const k of TEXTE) if (typeof p[k] === 'string') f[k] = p[k].trim() || null;
  if (Array.isArray(p.hashtags)) f.hashtags = p.hashtags.map((t) => (String(t).startsWith('#') ? t : `#${t}`)).join(' ');
  if (ARTEN.some((a) => a.id === p.art)) f.art = p.art;
  if (STATUS.some((s) => s.id === p.status)) f.status = p.status;
  if (/^\d{4}-\d{2}-\d{2}$/.test(p.datum || '')) f.datum = p.datum;
  if (p.zahlen && typeof p.zahlen === 'object') {
    f.zahlen = Object.fromEntries(ZAHLEN.filter((z) => p.zahlen[z.id] != null && p.zahlen[z.id] !== '' && Number.isFinite(Number(p.zahlen[z.id])))
      .map((z) => [z.id, Number(p.zahlen[z.id])]));
  }
  return f;
}

export async function importiere(text) {
  const daten = lies(text);
  const posts = Array.isArray(daten) ? daten : daten?.posts || [];
  const erk = Array.isArray(daten?.erkenntnisse) ? daten.erkenntnisse : [];
  if (!posts.length && !erk.length) throw new Error('Keine Posts oder Erkenntnisse gefunden.');

  const vorhanden = await getAll(POSTS);
  const r = { neu: 0, aktualisiert: 0, erkenntnisse: 0, falsch: 0 };
  for (const p of posts) {
    if (!p || typeof p !== 'object') { r.falsch++; continue; }
    const f = felder(p);
    const schluessel = String(p.schluessel || '').trim() || null;
    const alt = vorhanden.find((v) => (schluessel ? v.schluessel === schluessel : f.titel && norm(v.titel) === norm(f.titel)));
    if (alt) {
      if (f.zahlen) { f.zahlen = { ...(alt.zahlen || {}), ...f.zahlen }; f.status ||= 'gepostet'; }
      await save(POSTS, { id: alt.id, ...f });
      r.aktualisiert++;
    } else if (f.titel || f.hook) {
      vorhanden.push(await save(POSTS, { titel: '', art: 'reel', status: 'idee', schluessel, ...f }));
      r.neu++;
    } else r.falsch++;
  }

  const schon = new Set((await getAll(ERKENNTNISSE)).map((e) => norm(e.text)));
  for (const e of erk) {
    const t = String(e?.text || '').trim();
    if (!t || schon.has(norm(t))) continue;
    schon.add(norm(t));
    const belege = Array.isArray(e.belege) ? e.belege.join(', ') : String(e.belege || '').trim() || null;
    await save(ERKENNTNISSE, { text: t, warum: String(e.warum || '').trim() || null, belege, datum: heuteISO() });
    r.erkenntnisse++;
  }
  return r;
}

// Export für den eigenen Claude-Agenten: alle Posts (ohne interne Felder) + bisherige Erkenntnisse.
export async function exportText() {
  const posts = (await getAll(POSTS)).sort((a, b) => (a.datum || '').localeCompare(b.datum || ''));
  const erk = await getAll(ERKENNTNISSE);
  return JSON.stringify({
    stand: heuteISO(),
    posts: posts.map(({ schluessel, titel, art, status, datum, hook, skript, cta, caption, hashtags, zahlen, notiz }) =>
      ({ schluessel, titel, art, status, datum, hook, skript, cta, caption, hashtags, zahlen, notiz })),
    erkenntnisse: erk.map(({ text, warum, belege, datum }) => ({ text, warum, belege, datum })),
  }, null, 2);
}
