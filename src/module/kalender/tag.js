// Tagesansicht: Pfeile ‹ › mit Datum (antippen = heute), darunter das Zeitraster für einen Tag (raster.js).
import { el } from '../../ui/dom.js';
import { mitternacht, plusTage } from './zeit.js';
import { zeitraster } from './raster.js';
import { navKopf } from './woche.js';

export function tagAnsicht({ termine, start, onWechsel, tippen, lage }) {
  const text = start.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  return el('div', { class: 'woche' }, [
    navKopf({
      text,
      titel: 'Heute',
      zurueck: () => onWechsel(plusTage(start, -1)),
      vor: () => onWechsel(plusTage(start, 1)),
      jetzt: () => onWechsel(mitternacht(new Date())),
    }),
    zeitraster({ termine, start, tage: 1, art: 'tag', tippen, lage }),
  ]);
}
