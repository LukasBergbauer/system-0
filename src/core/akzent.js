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
  clearTimeout(leisteZeit);
  leisteZeit = setTimeout(leisteFaerben, 750); // nach dem Überblenden (--duration-slow)
}

// Fensterleiste (Mac-Web-App) und Statusleiste in der Seitenfarbe: theme-color = aufgelöstes --bg
let leisteZeit;
document.documentElement.addEventListener('transitionend', (e) => {
  if (e.target === document.documentElement && e.propertyName === '--accent') leisteFaerben();
});
function leisteFaerben() {
  const probe = document.body.appendChild(Object.assign(document.createElement('i'), { hidden: true }));
  probe.style.color = 'var(--bg)';
  const farbe = getComputedStyle(probe).color;
  probe.remove();
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', farbe);
}

// gewählte Farbe bzw. „weiss“/„schwarz“ (nicht der Zwischenwert während des Überblendens)
export function aktuellerAkzent() {
  return gewaehlt || '#E8664F';
}

// Unterton: zweite, leise Note derselben Farbe (Verlaufs-Ende, Hintergrund-Wolken; bei Weiß/Graphit die einzige Farbe).
// '' = kein Unterton (dann gilt die Akzentfarbe). Einstellung „unterton“, synchronisiert.
export const UNTERTOENE = [
  ['', 'Kein'], ['#C9A45C', 'Gold'], ['#D9A3A6', 'Rosé'], ['#B98A6E', 'Kupfer'],
  ['#9DB39A', 'Salbei'], ['#8FA3BF', 'Nebel'], ['#A89BCF', 'Flieder'],
];
const UNTERTON = 'unterton';
let unterton = '';

function untertonAnwenden(farbe) {
  if (farbe !== '' && !GUELTIG.test(farbe || '')) return;
  if (farbe) document.documentElement.style.setProperty('--unterton', farbe);
  else document.documentElement.style.removeProperty('--unterton');
  unterton = farbe;
  try { localStorage.setItem(UNTERTON, farbe); } catch {}
}

export const aktuellerUnterton = () => unterton;

export async function untertonSetzen(farbe) {
  untertonAnwenden(farbe);
  await setSetting(UNTERTON, farbe);
}

// Beim Start: erst die lokale Kopie (sofort, kein Farbsprung), dann die synchronisierte Einstellung.
export async function akzentLaden() {
  try { anwenden(localStorage.getItem(SCHLUESSEL)); untertonAnwenden(localStorage.getItem(UNTERTON) ?? ''); } catch {}
  try {
    anwenden(await getSetting(SCHLUESSEL));
    untertonAnwenden(await getSetting(UNTERTON, unterton));
  } catch (err) { console.warn(err); }
}

export async function akzentSetzen(farbe) {
  anwenden(farbe);
  await setSetting(SCHLUESSEL, farbe);
}
