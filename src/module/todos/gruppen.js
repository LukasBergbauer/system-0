// Offene To-dos nach Zeit: Heute · Morgen (oben als Boxen) · Diese Woche · Später · Ohne Datum · Nicht erledigt (vergangene Tage, ganz unten).
// Morgige rutschen am nächsten Tag von selbst nach „Heute“ (alles hängt am Datum). Reihenfolge je Fach aus sortiereOffene.
import { heuteISO } from './sortierung.js';

function fachVon(d, heute, morgen, inSiebenTagen) {
  if (!d) return 'ohne';
  if (d < heute) return 'alt';
  if (d === heute) return 'heute';
  if (d === morgen) return 'morgen';
  return d <= inSiebenTagen ? 'woche' : 'spaeter';
}

// offene: schon sortiert → { heute, morgen, woche, spaeter, ohne, alt } (je eine Liste)
export function gruppiereNachZeit(offene) {
  const fach = { heute: [], morgen: [], woche: [], spaeter: [], ohne: [], alt: [] };
  const [heute, morgen, sieben] = [heuteISO(), heuteISO(1), heuteISO(7)];
  for (const t of offene) fach[fachVon(t.faellig_am, heute, morgen, sieben)].push(t);
  fach.alt.sort((a, b) => b.faellig_am.localeCompare(a.faellig_am)); // jüngste zuerst
  return fach;
}
