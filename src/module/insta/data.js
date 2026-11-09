// Daten des Insta-Organizers über core/store.js. Keine Verbindung zu Instagram.
// insta_posts (schluessel, titel, art, status, datum, hook, skript, cta, caption, hashtags, zahlen, notiz),
// insta_hashtags (name, tags), insta_erkenntnisse (text, warum, belege, datum).
import { getAll, get, save, remove } from '../../core/store.js';

export const POSTS = 'insta_posts';
export const SETS = 'insta_hashtags';
export const ERKENNTNISSE = 'insta_erkenntnisse';

export const STATUS = [
  { id: 'idee', label: 'Idee' },
  { id: 'arbeit', label: 'In Arbeit' },
  { id: 'geplant', label: 'Geplant' },
  { id: 'gepostet', label: 'Gepostet' },
];
export const ARTEN = [
  { id: 'reel', label: 'Reel' },
  { id: 'karussell', label: 'Karussell' },
  { id: 'post', label: 'Post' },
  { id: 'story', label: 'Story' },
];
export const ZAHLEN = [
  { id: 'aufrufe', label: 'Aufrufe' },
  { id: 'reichweite', label: 'Reichweite' },
  { id: 'likes', label: 'Likes' },
  { id: 'kommentare', label: 'Kommentare' },
  { id: 'gespeichert', label: 'Gespeichert' },
  { id: 'geteilt', label: 'Geteilt' },
  { id: 'follower', label: 'Follower +' },
];

export const label = (liste, id) => liste.find((x) => x.id === id)?.label || '';
export const heuteISO = () => new Date().toLocaleDateString('sv');

// Datum zuerst (ohne Datum ans Ende), dann neueste zuerst.
export async function ladePosts() {
  return (await getAll(POSTS)).sort((a, b) => (a.datum || '9999').localeCompare(b.datum || '9999') || b.created_at.localeCompare(a.created_at));
}
export const ladePost = (id) => get(POSTS, id);
export const neuerPost = (felder) => save(POSTS, { titel: '', art: 'reel', status: 'idee', ...felder });

// Status „gepostet“ trägt das Datum ein, falls leer.
export function speicherePost(post, felder) {
  const extra = felder.status === 'gepostet' && !post.datum ? { datum: heuteISO() } : {};
  return save(POSTS, { id: post.id, ...extra, ...felder });
}
export const loeschePost = (post) => remove(POSTS, post.id);

export const ladeSets = async () => (await getAll(SETS)).sort((a, b) => a.name.localeCompare(b.name, 'de'));
export const speichereSet = (set) => save(SETS, set);
export const loescheSet = (set) => remove(SETS, set.id);

export const ladeErkenntnisse = async () => (await getAll(ERKENNTNISSE)).sort((a, b) => (b.datum || '').localeCompare(a.datum || '') || b.created_at.localeCompare(a.created_at));
export const loescheErkenntnis = (e) => remove(ERKENNTNISSE, e.id);

// Hashtags zählen (Instagram erlaubt höchstens 30).
export const zaehleTags = (text) => (text || '').match(/#[\p{L}\p{N}_]+/gu)?.length || 0;
