// Heute: Anordnung der Felder = Liste [{ typ, ref?, w, h }] in Lesereihenfolge (Raster füllt Lücken selbst).
// Gespeichert als Einstellung „heute_layout“ (lokal zuerst, dann synchronisiert, über core/einstellungen.js).
import { getSetting, setSetting } from '../../core/einstellungen.js';
import { ARTEN } from './katalog.js';

const SCHLUESSEL = 'heute_layout';
export const SPALTEN = 4; // Mac; iPhone zeigt 2 (breitere Felder werden dort 2 breit)
export const MAX_H = 3;

export const STANDARD = [
  ['woche', 3, 2], ['kalender', 1, 2], ['todos', 1, 1], ['termine', 1, 1], ['serie', 1, 1], ['training', 1, 1],
  ['affirmation', 3, 1], ['quiz', 1, 1], ['routinen', 4, 1], ['gewohnheiten', 4, 1], ['ziele', 4, 1], ['insta', 4, 1],
  ['verlauf', 3, 2], ['donut', 1, 2],
].map(([typ, w, h]) => ({ typ, w, h }));

const zahl = (n, max) => Math.min(max, Math.max(1, Math.round(Number(n) || 1)));

function pruefen(liste) {
  if (!Array.isArray(liste)) return null;
  return liste.filter((e) => e && ARTEN[e.typ])
    .map((e) => ({ typ: e.typ, ...(e.ref ? { ref: String(e.ref) } : {}), w: zahl(e.w, SPALTEN), h: zahl(e.h, MAX_H) }));
}

export async function layoutLaden() {
  try {
    return pruefen(await getSetting(SCHLUESSEL)) || STANDARD.map((e) => ({ ...e }));
  } catch (err) {
    console.warn(err);
    return STANDARD.map((e) => ({ ...e }));
  }
}

export function layoutSpeichern(liste) {
  return setSetting(SCHLUESSEL, pruefen(liste));
}
