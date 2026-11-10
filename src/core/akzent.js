// Akzentfarbe: EINE Farbe färbt die ganze App (Hintergrund, Hero-Flächen, Haken, Schatten – siehe tokens.css).
// Gespeichert als Einstellung „akzent“ (synchronisiert) und zusätzlich lokal, damit sie beim Start sofort da ist.
import { getSetting, setSetting } from './einstellungen.js';

// „weiss“ und „schwarz“ sind neutrale Akzente: --accent wird Graphit (Haken, Chips, Knöpfe), Flächen hell bzw. dunkel
// über data-akzent am <html> (Stile in akzent-neutral.css).
export const NEUTRAL = { weiss: '#FFFFFF', schwarz: '#2E3035' };
export const zeigeFarbe = (f) => NEUTRAL[f] || f; // Farbe für den Farbkreis
const GRAPHIT = '#2E3035';
export const AKZENT_FARBEN = [
  ['weiss', 'Weiß'], ['schwarz', 'Graphit'], ['#E8664F', 'Koralle'], ['#D9503A', 'Terrakotta'], ['#F0915F', 'Pfirsich'], ['#D9A441', 'Honig'],
  ['#6E9C7E', 'Salbei'], ['#4F8FBF', 'Nebelblau'], ['#8B79D6', 'Flieder'],
];
const SCHLUESSEL = 'akzent';
const GUELTIG = /^#[0-9a-f]{6}$/i;

let gewaehlt = null;

function anwenden(farbe) {
  if (!NEUTRAL[farbe] && !GUELTIG.test(farbe || '')) return;
  const html = document.documentElement;
  html.style.setProperty('--accent', NEUTRAL[farbe] ? GRAPHIT : farbe);
  if (NEUTRAL[farbe]) html.dataset.akzent = farbe;
  else delete html.dataset.akzent;
  gewaehlt = farbe;
  try { localStorage.setItem(SCHLUESSEL, farbe); } catch {}
}

// gewählte Farbe bzw. „weiss“/„schwarz“ (nicht der Zwischenwert während des Überblendens)
export function aktuellerAkzent() {
  return gewaehlt || '#E8664F';
}

// Beim Start: erst die lokale Kopie (sofort, kein Farbsprung), dann die synchronisierte Einstellung.
export async function akzentLaden() {
  try { anwenden(localStorage.getItem(SCHLUESSEL)); } catch {}
  try { anwenden(await getSetting(SCHLUESSEL)); } catch (err) { console.warn(err); }
}

export async function akzentSetzen(farbe) {
  anwenden(farbe);
  await setSetting(SCHLUESSEL, farbe);
}
