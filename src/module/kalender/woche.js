// Wochenansicht: Pfeile ‹ › und Zeitraum (antippen = diese Woche), darunter das Zeitraster Mo–So
// (raster.js). Mac: alle 7 Tage, iPhone: 3 sichtbar, waagrecht wischbar.
import { el } from '../../ui/dom.js';
import { plusTage } from './zeit.js';
import { zeitraster } from './raster.js';

// Montag 0:00 Uhr der Woche, in der d liegt
export function montag(d) {
  const m = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return plusTage(m, -((m.getDay() + 6) % 7));
}

const kurz = (d, optionen) => d.toLocaleDateString('de-DE', optionen);

function zeitraum(start) {
  const ende = plusTage(start, 6);
  const von = start.getMonth() === ende.getMonth() ? `${start.getDate()}.` : kurz(start, { day: 'numeric', month: 'short' });
  return `${von} – ${kurz(ende, { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

export function pfeil(text, label, onClick) {
  return el('button', { class: 'btn btn--ghost woche__pfeil', text, attrs: { type: 'button', 'aria-label': label }, on: { click: onClick } });
}

// Kopfzeile mit ‹ Titel › (auch für Tag und Monat)
export function navKopf({ text, titel, zurueck, vor, jetzt }) {
  return el('div', { class: 'woche__kopf' }, [
    pfeil('‹', `${titel} zurück`, zurueck),
    el('button', { class: 'btn btn--ghost woche__zeitraum', text, attrs: { type: 'button', title: titel }, on: { click: jetzt } }),
    pfeil('›', `${titel} vor`, vor),
  ]);
}

export function wocheAnsicht({ termine, start, onWechsel, tippen, lage }) {
  return el('div', { class: 'woche' }, [
    navKopf({
      text: zeitraum(start),
      titel: 'Diese Woche',
      zurueck: () => onWechsel(plusTage(start, -7)),
      vor: () => onWechsel(plusTage(start, 7)),
      jetzt: () => onWechsel(montag(new Date())),
    }),
    zeitraster({ termine, start, tage: 7, art: 'woche', tippen, lage }),
  ]);
}
