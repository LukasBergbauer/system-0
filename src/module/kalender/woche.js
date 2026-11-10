// Wochenansicht: oben Pfeile ‹ › und der Zeitraum (antippen = diese Woche), darunter Mo–So
// als Abschnitte mit den Terminen des Tags. Mehrtägige Termine stehen an jedem ihrer Tage.
import { abschnitt } from '../../ui/abschnitt.js';
import { el } from '../../ui/dom.js';
import { list } from '../../ui/list.js';
import { plusTage, tagISO } from './zeit.js';

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

function pfeil(text, label, onClick) {
  return el('button', { class: 'btn btn--ghost woche__pfeil', text, attrs: { type: 'button', 'aria-label': label }, on: { click: onClick } });
}

// termine: alle (auch vergangene); zeile(termin) baut eine Listenzeile
export function wocheAnsicht({ termine, start, onWechsel, zeile }) {
  const heute = tagISO(new Date());
  const tage = Array.from({ length: 7 }, (_, i) => {
    const von = plusTage(start, i);
    const bis = plusTage(von, 1);
    const anTag = termine
      .filter((t) => Date.parse(t.start) < +bis && Date.parse(t.ende) > +von)
      .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
    const istHeute = tagISO(von) === heute;
    return el('section', { class: `woche__tag${istHeute ? ' woche__tag--heute' : ''}` }, [
      abschnitt({ titel: kurz(von, { weekday: 'short', day: 'numeric', month: 'numeric' }), zahl: istHeute ? 'Heute' : null }),
      anTag.length ? list(anTag.map(zeile)) : el('p', { class: 'woche__leer', text: '—' }),
    ]);
  });

  return el('div', { class: 'woche' }, [
    el('div', { class: 'woche__kopf' }, [
      pfeil('‹', 'Vorige Woche', () => onWechsel(plusTage(start, -7))),
      el('button', { class: 'btn btn--ghost woche__zeitraum', text: zeitraum(start), attrs: { type: 'button', title: 'Diese Woche' }, on: { click: () => onWechsel(montag(new Date())) } }),
      pfeil('›', 'Nächste Woche', () => onWechsel(plusTage(start, 7))),
    ]),
    ...tage,
  ]);
}
