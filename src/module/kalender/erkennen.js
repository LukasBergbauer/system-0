// Schnelleingabe verstehen: „Mo 18 Uhr Training“ → { titel: 'Training', start, ende, ganztaegig: false }.
// Reine Funktion (kein Speichern), damit sie sich leicht prüfen lässt. Erkannte Wörter: siehe docs/module/kalender.md.
// Nur Uhrzeit → heute (morgen, wenn schon vorbei). Nur Tag → ganztägig. Nichts erkannt → heute, ganztägig.
import { plusTage, mitternacht } from './zeit.js';

const RAND = '(^|\\s)'; // Wortanfang (\b kennt keine Umlaute)
const ENDE = '(?=[\\s,.]|$)';
const ZEIT = '(\\d{1,2})(?:[:.](\\d{2}))?';
const WOCHENTAGE = ['so', 'mo', 'di', 'mi', 'do', 'fr', 'sa']; // Index = getDay()

const MUSTER = {
  datum: new RegExp(`${RAND}(\\d{1,2})\\.(\\d{1,2})\\.(\\d{4})?${ENDE}`),
  relativ: new RegExp(`${RAND}(heute|morgen|übermorgen)${ENDE}`, 'i'),
  wochentag: new RegExp(`${RAND}(mo|di|mi|do|fr|sa|so)(?:ntag|enstag|ttwoch|nnerstag|eitag|mstag|nntag|nnabend)?\\.?${ENDE}`, 'i'),
  // „18-20 Uhr“, „18:00-19:30“, „18 bis 20 Uhr“ (ohne „Uhr“ nur mit Doppelpunkt)
  spanne: new RegExp(`${RAND}${ZEIT}\\s*(?:-|–|bis)\\s*${ZEIT}(\\s*uhr)?${ENDE}`, 'i'),
  zeit: new RegExp(`${RAND}(?:(\\d{1,2})(?:[:.](\\d{2}))?\\s*uhr|(\\d{1,2}):(\\d{2}))${ENDE}`, 'i'),
};

const gueltig = (h, m) => h <= 23 && m <= 59;

// Sucht ein Muster, schneidet den Treffer aus dem Text und gibt die Gruppen zurück.
function nimm(rest, muster) {
  const treffer = rest.text.match(muster);
  if (!treffer) return null;
  rest.text = rest.text.replace(treffer[0], ' ');
  return treffer;
}

function findeTag(rest, heute) {
  const d = rest.text.match(MUSTER.datum);
  // Nur echte Daten: „31.11.“ würde sonst still zum 1. Dez.
  if (d && new Date(2000, +d[3] - 1, +d[2]).getMonth() === +d[3] - 1) {
    rest.text = rest.text.replace(d[0], ' ');
    let tag = new Date(d[4] ? +d[4] : heute.getFullYear(), +d[3] - 1, +d[2]);
    if (!d[4] && tag < heute) tag = new Date(tag.getFullYear() + 1, tag.getMonth(), tag.getDate());
    return { tag };
  }
  const r = nimm(rest, MUSTER.relativ);
  if (r) return { tag: plusTage(heute, ['heute', 'morgen', 'übermorgen'].indexOf(r[2].toLowerCase())) };
  const w = nimm(rest, MUSTER.wochentag);
  if (w) return { tag: plusTage(heute, (WOCHENTAGE.indexOf(w[2].toLowerCase()) - heute.getDay() + 7) % 7), wochentag: true };
  return null;
}

// → { von: [h, m], bis: [h, m] | null } oder null
function findeZeit(rest) {
  const s = rest.text.match(MUSTER.spanne);
  if (s && (s[6] || s[3] || s[5])) {
    const von = [+s[2], +(s[3] || 0)];
    const bis = [+s[4], +(s[5] || 0)];
    if (gueltig(...von) && gueltig(...bis)) {
      rest.text = rest.text.replace(s[0], ' ');
      return { von, bis };
    }
  }
  const z = rest.text.match(MUSTER.zeit);
  if (!z) return null;
  const von = z[2] !== undefined ? [+z[2], +(z[3] || 0)] : [+z[4], +z[5]];
  if (!gueltig(...von)) return null;
  rest.text = rest.text.replace(z[0], ' ');
  return { von, bis: null };
}

export function erkenne(text, jetzt = new Date()) {
  const rest = { text: ` ${text} ` };
  const heute = mitternacht(jetzt);
  const t = findeTag(rest, heute);
  const z = findeZeit(rest);
  const titel = rest.text.replace(/\s+/g, ' ').replace(/^[\s,.\-–]+|[\s,\-–]+$/g, '');

  if (!z) {
    const start = t ? t.tag : heute;
    return { titel, start, ende: plusTage(start, 1), ganztaegig: true, erkannt: Boolean(t) };
  }
  const tag = t ? t.tag : heute;
  let start = new Date(tag.getFullYear(), tag.getMonth(), tag.getDate(), ...z.von);
  // Schon vorbei: ohne Tag → morgen, bei Wochentag → nächste Woche
  if (start < jetzt && (!t || (t.wochentag && +tag === +heute))) start = plusTage(start, t ? 7 : 1);
  let ende = z.bis
    ? new Date(start.getFullYear(), start.getMonth(), start.getDate(), ...z.bis)
    : new Date(+start + 3600e3);
  if (ende <= start && z.bis) ende = plusTage(ende, 1); // „22-1 Uhr“ endet am nächsten Tag
  return { titel, start, ende, ganztaegig: false, erkannt: true };
}
