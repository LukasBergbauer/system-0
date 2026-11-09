// Eine Quiz-Runde als Vollbild (Rahmen wie der Routinen-Durchlauf): Frage groß, 4 Antworten,
// nach dem Tippen grün/rot + Erklärung, „Weiter“. Am Ende Ergebnis mit Raster.
// onFertig(antworten) wird einmal gerufen: am Ende, oder beim Schließen mit mindestens einer Antwort, wenn teilweise = true.
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { mische, themaName } from './data.js';

export const raster = (antworten) => el('div', { class: 'quiz-raster', attrs: { 'aria-label': `${antworten.filter((a) => a.ok).length} von ${antworten.length} richtig` } },
  antworten.map((a) => el('i', { class: a.ok ? 'ok' : 'nein' })));

export function starteRunde({ titel, fragen, teilweise = false, onFertig, unterzeile, nochmal, signal }) {
  if (!fragen.length) return;
  const antworten = [];
  let i = 0;
  let gemeldet = false;
  const melden = () => { if (!gemeldet && antworten.length) { gemeldet = true; onFertig?.(antworten); } };

  const dialog = el('dialog', { class: 'durchlauf quiz-runde', attrs: { 'aria-label': titel } });
  const schliessen = () => dialog.open && dialog.close();

  function rahmen(mitte, fuss) {
    const punkte = fragen.map((_, k) => el('i', { class: k < antworten.length ? (antworten[k].ok ? 'an' : 'falsch') : k === i ? 'jetzt' : '' }));
    dialog.replaceChildren(el('div', { class: 'durchlauf__box' }, [
      el('header', { class: 'durchlauf__kopf' }, [
        el('span', { class: 'label', text: titel }),
        el('button', { class: 'durchlauf__zu', text: '×', attrs: { type: 'button', 'aria-label': 'Schließen' }, on: { click: schliessen } }),
      ]),
      el('div', { class: 'durchlauf__punkte', attrs: { 'aria-hidden': 'true' } }, punkte),
      mitte,
      el('footer', { class: 'durchlauf__fuss' }, fuss),
    ]));
  }

  function frage() {
    const q = fragen[i];
    const knoepfe = mische(q.a).map((text) => el('button', { class: 'quiz-antwort', text, attrs: { type: 'button' }, on: { click: () => waehle(text) } }));
    const erklaerung = el('p', { class: 'quiz-erklaerung', attrs: { hidden: true } });
    const weiter = button({ text: i === fragen.length - 1 ? 'Auswerten' : 'Weiter', variant: 'primary', disabled: true, onClick: () => (++i < fragen.length ? frage() : ende()) });
    rahmen(el('div', { class: 'quiz-mitte', attrs: { 'aria-live': 'polite' } }, [
      el('span', { class: 'durchlauf__zahl', text: `${i + 1} / ${fragen.length} · ${themaName(q.thema)}` }),
      el('h2', { class: 'quiz-frage', text: q.f }),
      el('div', { class: 'quiz-antworten' }, knoepfe),
      erklaerung,
    ]), [weiter]);

    function waehle(text) {
      const ok = text === q.a[0];
      antworten.push({ id: q.id, ok });
      for (const k of knoepfe) {
        k.disabled = true;
        if (k.textContent === q.a[0]) k.classList.add('ok');
        else if (k.textContent === text) k.classList.add('nein');
      }
      erklaerung.textContent = `${ok ? 'Richtig.' : 'Leider falsch.'} ${q.e || ''}`;
      erklaerung.hidden = false;
      weiter.disabled = false;
      weiter.focus();
      dialog.querySelectorAll('.durchlauf__punkte i')[i].className = ok ? 'an' : 'falsch';
    }
  }

  function ende() {
    gemeldet = true;
    onFertig?.(antworten);
    const r = antworten.filter((a) => a.ok).length;
    rahmen(el('div', { class: 'durchlauf__mitte' }, [
      el('span', { class: 'durchlauf__zahl', text: 'Ergebnis' }),
      el('h2', { class: 'durchlauf__text', text: `${r} von ${antworten.length} richtig` }),
      raster(antworten),
      unterzeile && el('p', { class: 'app__note', text: unterzeile }),
    ]), [
      nochmal && button({ text: 'Neue Runde', variant: 'ghost', onClick: () => { schliessen(); nochmal(); } }),
      button({ text: 'Fertig', variant: 'primary', onClick: schliessen }),
    ].filter(Boolean));
  }

  dialog.addEventListener('close', () => { if (teilweise) melden(); dialog.remove(); });
  signal?.addEventListener('abort', schliessen);
  document.body.append(dialog);
  dialog.showModal();
  frage();
}
