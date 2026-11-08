// Akzentfarbe: EINE Farbe färbt die ganze App (Hintergrund, Hero-Flächen, Haken, Schatten – siehe tokens.css).
// Gespeichert als Einstellung „akzent“ (synchronisiert) und zusätzlich lokal, damit sie beim Start sofort da ist.
import { getSetting, setSetting } from './einstellungen.js';

export const AKZENT_FARBEN = [
  ['#E8664F', 'Koralle'], ['#D9503A', 'Terrakotta'], ['#F0915F', 'Pfirsich'], ['#D9A441', 'Honig'],
  ['#6E9C7E', 'Salbei'], ['#4F8FBF', 'Nebelblau'], ['#8B79D6', 'Flieder'],
];
const SCHLUESSEL = 'akzent';
const GUELTIG = /^#[0-9a-f]{6}$/i;

function anwenden(farbe) {
  if (!GUELTIG.test(farbe || '')) return;
  document.documentElement.style.setProperty('--accent', farbe);
  try { localStorage.setItem(SCHLUESSEL, farbe); } catch {}
}

// gewählte Farbe (nicht der Zwischenwert während des Überblendens)
export function aktuellerAkzent() {
  return document.documentElement.style.getPropertyValue('--accent').trim() || AKZENT_FARBEN[0][0];
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
