// Kennzahlen für den Seitenkopf (shell.js): Einheiten diese Woche, Minuten, Wochen in Folge (ersetzt die Karte „Diese Woche“).
import { getAll } from '../../core/store.js';
import { dieseWoche, wochenSerie, montag } from './rechnen.js';
import { tagISO } from './daten.js';

export async function kennzahlen() {
  const alle = await getAll('einheiten');
  const mo = montag(tagISO());
  const minuten = alle.filter((e) => e.datum >= mo).reduce((s, e) => s + (e.dauer || 0), 0);
  const serie = wochenSerie(alle);
  return [{ zahl: dieseWoche(alle), text: 'Einheiten' }, { zahl: minuten, text: 'Minuten' },
    serie > 1 && { zahl: serie, text: 'Wochen in Folge' }].filter(Boolean);
}
