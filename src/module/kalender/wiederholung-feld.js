// Feld „Wiederholen“ im Termin-Modal: Chips Nie · Täglich · Wöchentlich · Monatlich · Jährlich, dazu optional „Endet am“.
// Liest/schreibt die Regel als RRULE-Text ('FREQ=WEEKLY;UNTIL=20271231'), leer = einmalig.
import { el } from '../../ui/dom.js';
import { chips } from '../../ui/chips.js';
import { input } from '../../ui/input.js';

const ARTEN = [
  { id: '', label: 'Nie' },
  { id: 'DAILY', label: 'Täglich' },
  { id: 'WEEKLY', label: 'Wöchentlich' },
  { id: 'MONTHLY', label: 'Monatlich' },
  { id: 'YEARLY', label: 'Jährlich' },
];

export function wiederholungFeld(regel = '') {
  const teile = Object.fromEntries((regel || '').split(';').filter(Boolean).map((t) => t.split('=')));
  let art = teile.FREQ || '';
  const u = teile.UNTIL?.slice(0, 8);
  const endeFeld = input({ label: 'Endet am (optional)', type: 'date', value: u ? `${u.slice(0, 4)}-${u.slice(4, 6)}-${u.slice(6, 8)}` : '' });
  const auswahl = chips({ items: ARTEN, active: art, onChange: (id) => { art = id; zeige(); } });
  const zeige = () => { endeFeld.hidden = !art; };
  zeige();

  return {
    element: el('div', { class: 'field termin-wdh' }, [el('span', { class: 'field__label', text: 'Wiederholen' }), auswahl, endeFeld]),
    wert() {
      if (!art) return null;
      const bis = endeFeld.querySelector('input').value;
      return `FREQ=${art}${bis ? `;UNTIL=${bis.replace(/-/g, '')}` : ''}`;
    },
  };
}
