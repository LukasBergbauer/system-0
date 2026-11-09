// Rechnen ohne Oberfläche: Sätze als Text, Bestwerte, Verlauf je Übung, Wochen-Zahlen.
import { zeitText, tagISO } from './daten.js';

const zahl = (n) => String(n).replace('.', ',');
const DATUM = new Intl.DateTimeFormat('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
export const datumText = (tag) => DATUM.format(new Date(`${tag}T12:00`));

// Ein Satz als Text, z. B. „10 × 40 kg · RIR 2“ oder „500 m · 2:05“.
export function satzText(s) {
  const vorne = [s.wdh != null && `${s.wdh}`, s.gewicht != null && `${zahl(s.gewicht)} kg`].filter(Boolean).join(' × ');
  const hinten = [s.distanz != null && `${zahl(s.distanz)} m`, s.zeit != null && zeitText(s.zeit), s.rir != null && `RIR ${s.rir}`].filter(Boolean);
  return [vorne, ...hinten].filter(Boolean).join(' · ') || '–';
}

// Mehrere Sätze: gleiche zusammenfassen („3 × 10 × 40 kg“), sonst mit „ / “.
export function saetzeText(saetze) {
  const texte = saetze.map(satzText).filter((t) => t !== '–');
  if (!texte.length) return 'noch nichts eingetragen';
  return texte.every((t) => t === texte[0]) && texte.length > 1 ? `${texte.length} × ${texte[0]}` : texte.join(' / ');
}

// Letzter Eintrag einer Übung vor einer Einheit (ohne diese), als Text „Zuletzt Mo., 3. Nov.: 3 × 10 × 40 kg · RIR 2“ oder ''.
export function zuletztText(uebung_id, einheiten, ohne = null, bis = tagISO()) {
  for (const e of einheiten) {
    if (e.id === ohne || e.datum > bis) continue;
    const s = e.saetze.filter((x) => x.uebung_id === uebung_id);
    if (s.length) return `Zuletzt ${datumText(e.datum)}: ${saetzeText(s)}`;
  }
  return '';
}

// Wonach eine Übung gemessen wird: Gewicht > Wdh > Distanz > Zeit (weniger ist besser).
function massstab(messung = []) {
  const key = ['gewicht', 'wdh', 'distanz', 'zeit'].find((k) => messung.includes(k)) || 'wdh';
  return { key, besser: key === 'zeit' ? Math.min : Math.max };
}

// Bester Wert einer Liste von Sätzen (oder null).
export function bestwert(saetze, messung) {
  const { key, besser } = massstab(messung);
  const werte = saetze.map((s) => s[key]).filter((w) => w != null && w !== 0);
  if (!werte.length) return null;
  const wert = besser(...werte);
  return { key, wert, text: key === 'zeit' ? zeitText(wert) : `${zahl(wert)} ${{ gewicht: 'kg', wdh: 'Wdh', distanz: 'm' }[key]}` };
}

// Verlauf einer Übung: [{ einheit, saetze, best }] neueste zuerst.
export function verlauf(uebung, einheiten) {
  return einheiten
    .map((einheit) => ({ einheit, saetze: einheit.saetze.filter((s) => s.uebung_id === uebung.id) }))
    .filter((v) => v.saetze.length)
    .map((v) => ({ ...v, best: bestwert(v.saetze, uebung.messung) }));
}

// Montag der Woche eines Datums als ISO-Tag.
function montag(tag) {
  const d = new Date(`${tag}T12:00`);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return tagISO(d);
}

export function dieseWoche(einheiten) {
  const mo = montag(tagISO());
  return einheiten.filter((e) => e.datum >= mo && e.datum <= tagISO()).length;
}

// Wochen in Folge mit mindestens einer Einheit (aktuelle Woche zählt mit, wenn schon trainiert).
export function wochenSerie(einheiten) {
  const wochen = new Set(einheiten.map((e) => montag(e.datum)));
  const d = new Date(`${montag(tagISO())}T12:00`);
  if (!wochen.has(tagISO(d))) d.setDate(d.getDate() - 7);
  let n = 0;
  while (wochen.has(tagISO(d))) { n++; d.setDate(d.getDate() - 7); }
  return n;
}
