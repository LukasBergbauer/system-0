// Heute: Kopf mit Gruß je nach Tageszeit, darunter das Datum (was ansteht, zeigt das Tagesfeld).
// Rechts die Knöpfe Suche, Bearbeiten, Neu (kopf-knoepfe.js).
import { el } from '../../ui/dom.js';
import { kopfKnoepfe } from './kopf-knoepfe.js';

const DATUM = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

function gruss(stunde) {
  if (stunde < 11) return 'Guten Morgen';
  if (stunde < 18) return 'Guten Tag';
  return 'Guten Abend';
}

// modus = { bearbeiten, umschalten, standard } für den Bearbeiten-Knopf
export function kopf(modus, jetzt = new Date()) {
  return el('header', { class: 'heute-kopf' }, [
    el('div', {}, [
      el('h1', { text: `${gruss(jetzt.getHours())}, Lukas` }),
      el('p', { text: DATUM.format(jetzt) }),
    ]),
    kopfKnoepfe(modus),
  ]);
}
