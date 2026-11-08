// Heute: Kopf mit Gruß je nach Tageszeit, darunter Datum · „N Dinge brauchen dich“.
// Rechts kommen in Schritt d) die Knöpfe „Akzent“ und „Neu“ dazu.
import { el } from '../../ui/dom.js';

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

export function kopf(dinge, jetzt = new Date()) {
  return el('header', { class: 'heute-kopf' }, [
    el('div', {}, [
      el('h1', { text: `${gruss(jetzt.getHours())}, Lukas` }),
      el('p', { text: `${DATUM.format(jetzt)} · ${dingeText(dinge)}` }),
    ]),
  ]);
}
