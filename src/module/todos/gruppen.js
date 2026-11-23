// Offene To-dos nach Zeit: Heute · Morgen (oben als Boxen) · Irgendwann (alles andere: ohne Datum, später, vergangen).
// Morgige rutschen am nächsten Tag von selbst nach „Heute“ (alles hängt am Datum). Reihenfolge je Fach aus sortiereOffene.
import { heuteISO } from './sortierung.js';

// offene: schon sortiert → { heute, morgen, irgendwann }
export function gruppiereNachZeit(offene) {
  const fach = { heute: [], morgen: [], irgendwann: [] };
  const [heute, morgen] = [heuteISO(), heuteISO(1)];
  for (const t of offene) fach[t.faellig_am === heute ? 'heute' : t.faellig_am === morgen ? 'morgen' : 'irgendwann'].push(t);
  return fach;
}
