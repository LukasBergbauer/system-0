// Heute: Hero-Karte „Woche“ in der Akzentfarbe – Satz, drei Zahlen, zwei Knöpfe und der Ring.
// Ring = erledigt ÷ alle To-dos mit Fälligkeit in dieser Woche.
import { el } from '../../ui/dom.js';
import { go } from '../../core/router.js';
import { zahl, ring } from './bewegung.js';

const mehrzahl = (n, eins, viele) => `${n} ${n === 1 ? eins : viele}`;

// Überschrift mit einem kursiven Wort in der Mitte (wie in der Vorlage)
function titel(vor, kursiv, nach) {
  return el('h2', {}, [vor, el('em', { text: kursiv }), nach]);
}

function satz(w) {
  if (w.ueberfaellig > 0) {
    return [titel('Ein paar Dinge ', 'warten', ' auf dich'),
      `${mehrzahl(w.ueberfaellig, 'To-do ist', 'To-dos sind')} überfällig. Fang mit dem kleinsten an.`];
  }
  if (w.quote === null) {
    return [titel('Deine Woche ist ', 'frei', ''), 'Für diese Woche ist noch kein To-do geplant.'];
  }
  const prozent = Math.round(w.quote * 100);
  const rest = w.offenWoche ? `, ${mehrzahl(w.offenWoche, 'To-do steht', 'To-dos stehen')} noch an.` : '. Alles geschafft!';
  return [titel('Deine Woche läuft ', 'richtig', ' gut'), `${prozent} % deiner To-dos dieser Woche sind erledigt${rest}`];
}

function wert(n, text, animiert) {
  return el('div', {}, [zahl(n, { animiert }), el('small', { text })]);
}

export function hero(w, animiert) {
  const [h2, text] = satz(w);
  const prozent = w.quote === null ? null : Math.round(w.quote * 100);
  const mitte = el('div', {}, [
    prozent === null ? el('b', { text: '–' }) : zahl(prozent, { nach: ' %', animiert }),
    el('small', { text: 'erledigt' }),
  ]);
  return el('article', { class: 'heute-hero' }, [
    el('div', { class: 'heute-hero__text' }, [
      el('span', { class: 'heute-status' }, [el('i'), `Woche ${w.kw} · ${mehrzahl(w.termineHeute, 'Termin', 'Termine')} heute`]),
      h2,
      el('p', { text }),
      el('div', { class: 'heute-werte' }, [
        wert(w.erledigt, 'erledigt diese Woche', animiert),
        wert(w.heuteFaellig, 'heute fällig', animiert),
        wert(w.ueberfaellig, 'überfällig', animiert),
      ]),
      el('div', { class: 'heute-knoepfe' }, [
        el('button', { class: 'heute-pille heute-pille--weiss', text: 'Woche ansehen ↗', on: { click: () => go('kalender/woche') } }),
        el('button', { class: 'heute-pille heute-pille--rand', text: '+ To-do', on: { click: () => go('todos/neu') } }),
      ]),
    ]),
    ring(w.quote, mitte, animiert),
  ]);
}
