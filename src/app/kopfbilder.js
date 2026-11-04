// Kopfbilder der Bereiche: welches Foto heute gilt, und alle schon beim Start vorladen.
// Vorladen + Entpacken (decode) im Hintergrund, damit beim Wechsel der Seite das Bild sofort da ist
// und nichts „nachblitzt“.
import { desTages } from '../core/sprueche.js';

// bild darf ein Pfad oder eine Liste sein (Liste = täglich eine andere Variante).
export function heutigesBild(bereich) {
  return Array.isArray(bereich.bild) ? desTages(bereich.bild) : bereich.bild;
}

// Fertig entpackte Bilder festhalten, damit der Browser sie nicht wieder verwirft.
const geladen = new Map();

export function kopfbilderVorladen(bereiche) {
  for (const bereich of bereiche) {
    const url = heutigesBild(bereich);
    if (!url || geladen.has(url)) continue;
    const bild = new Image();
    bild.src = url;
    geladen.set(url, bild);
    bild.decode?.().catch(() => {}); // klappt es nicht, lädt die Seite das Bild eben beim Öffnen
  }
}
