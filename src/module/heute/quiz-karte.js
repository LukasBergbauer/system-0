// Heute: Karte „Daily-Quiz“. Offen → Antippen startet es ('#/quiz/daily'); erledigt → Ergebnis-Raster und Serie.
// Liest nur Rohdaten (quiz_ergebnisse).
import { el } from '../../ui/dom.js';
import { symbol } from '../../ui/symbol.js';
import { go } from '../../core/router.js';
import { tagISO } from './rechnen.js';

const vor = (i) => { const h = new Date(); return tagISO(new Date(h.getFullYear(), h.getMonth(), h.getDate() - i)); };

export function quizKarte(ergebnisse) {
  const tage = new Set(ergebnisse.filter((r) => r.modus === 'daily').map((r) => r.tag));
  const heute = ergebnisse.find((r) => r.modus === 'daily' && r.tag === vor(0));
  let i = heute ? 0 : 1, n = 0;
  while (tage.has(vor(i))) { n++; i++; }

  return el('button', { class: 'heute-karte heute-quiz', attrs: { type: 'button' }, on: { click: () => go(heute ? 'quiz' : 'quiz/daily') } }, [
    el('div', { class: 'heute-karte__kopf' }, [
      el('div', {}, [el('h3', { text: 'Daily-Quiz' }), el('small', { text: heute ? `${heute.richtig} von ${heute.gesamt} richtig` : 'Noch offen · antippen' })]),
      el('span', { class: 'heute-kz__symbol' }, [symbol('quiz')]),
    ]),
    heute && el('div', { class: 'quiz-raster' }, (heute.antworten || []).map((a) => el('i', { class: a.ok ? 'ok' : 'nein' }))),
    el('p', { text: n ? `Serie: ${n} ${n === 1 ? 'Tag' : 'Tage'}` : 'Starte eine Serie' }),
  ]);
}
