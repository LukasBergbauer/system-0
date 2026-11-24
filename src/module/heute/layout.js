// Heute: Anordnung der Felder = Liste [{ typ, ref?, w, h }] in Lesereihenfolge (Raster füllt Lücken selbst).
// Gespeichert als Einstellung „heute_layout“ (lokal zuerst, dann synchronisiert, über core/einstellungen.js).
import { getSetting, setSetting } from '../../core/einstellungen.js';
import { ARTEN } from './katalog.js';

const SCHLUESSEL = 'heute_layout';
const KLAR = 'heute_layout_klar'; // einmalige Umstellung auf die Neugestaltung (24.11.2026)
export const SPALTEN = 4; // Mac; iPhone zeigt 2 (breitere Felder werden dort 2 breit)
export const MAX_H = 3;

export const STANDARD = [
  ['todos', 2, 2], ['kalender', 1, 2], ['pyramide', 1, 2],
  ['routinen', 2, 1], ['gewohnheiten', 2, 1], ['affirmation', 2, 1], ['ziele', 2, 1],
  ['training', 1, 1], ['quiz', 1, 1], ['absatz', 2, 1], ['insta', 4, 1],
].map(([typ, w, h]) => ({ typ, w, h }));

const zahl = (n, max) => Math.min(max, Math.max(1, Math.round(Number(n) || 1)));

function pruefen(liste) {
  if (!Array.isArray(liste)) return null;
  return liste.filter((e) => e && ARTEN[e.typ])
    .map((e) => ({ typ: e.typ, ...(e.ref ? { ref: String(e.ref) } : {}), w: zahl(e.w, SPALTEN), h: zahl(e.h, MAX_H) }));
}

export async function layoutLaden() {
  try {
    const liste = pruefen(await getSetting(SCHLUESSEL));
    if (!liste) return STANDARD.map((e) => ({ ...e }));
    if (!(await getSetting(KLAR))) { // Neugestaltung: einmal neue Anordnung, eigene Einzel-Felder bleiben erhalten
      const neu = [...STANDARD.map((e) => ({ ...e })), ...liste.filter((e) => e.ref)];
      await setSetting(KLAR, true);
      await layoutSpeichern(neu);
      return neu;
    }
    return liste;
  } catch (err) {
    console.warn(err);
    return STANDARD.map((e) => ({ ...e }));
  }
}

export function layoutSpeichern(liste) {
  return setSetting(SCHLUESSEL, pruefen(liste));
}
