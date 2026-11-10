// Heute: Kopf mit Gruß je nach Tageszeit, darunter Datum · „N Dinge brauchen dich“.
// Rechts die Knöpfe „Akzent“ und „Neu“ (kopf-knoepfe.js).
import { el } from '../../ui/dom.js';
import { kopfKnoepfe } from './kopf-knoepfe.js';

const DATUM = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

function gruss(stunde) {
  if (stunde < 11) return 'Guten Morgen';
  if (stunde < 18) return 'Guten Tag';
  return 'Guten Abend';
}

function dingeText(n) {
  if (n === 0) return 'heute ist nichts offen';
  return n === 1 ? '1 Ding braucht dich' : `${n} Dinge brauchen dich`;
}

// modus = { bearbeiten, umschalten, standard } für den Bearbeiten-Knopf
export function kopf(dinge, modus, jetzt = new Date()) {
  return el('header', { class: 'heute-kopf' }, [
    el('div', {}, [
      el('h1', { text: `${gruss(jetzt.getHours())}, Lukas` }),
      el('p', { text: `${DATUM.format(jetzt)} · ${dingeText(dinge)}` }),
    ]),
    kopfKnoepfe(modus),
  ]);
}
