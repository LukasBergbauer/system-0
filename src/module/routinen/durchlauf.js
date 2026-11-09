// Durchlauf als Vollbild: ein Schritt groß, Fortschritt oben, „Erledigt“ → nächster, „Zurück“ → vorheriger.
// Stand wird nach jedem Schritt gespeichert; erneutes Öffnen macht dort weiter. Am Ende „Geschafft“.
// signal endet beim Verlassen der Ansicht (z. B. Zurück-Wischen) → Durchlauf schließt sich.
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { logAm, speichereStand } from './data.js';

export function starteDurchlauf(routine, { signal } = {}) {
  const n = routine.schritte.length;
  if (!n) return;
  let log = logAm(routine);
  let i = log?.fertig_am ? 0 : Math.min(log?.geschafft || 0, n - 1); // fertig → von vorn

  const dialog = el('dialog', { class: 'durchlauf', attrs: { 'aria-label': routine.name } });
  const schliessen = () => dialog.open && dialog.close();

  function zeichne(fertig = false) {
    const punkte = routine.schritte.map((_, k) =>
      el('i', { class: k < i || fertig ? 'an' : k === i ? 'jetzt' : '' }));
    dialog.replaceChildren(el('div', { class: 'durchlauf__box' }, [
      el('header', { class: 'durchlauf__kopf' }, [
        el('span', { class: 'label', text: routine.name }),
        el('button', { class: 'durchlauf__zu', text: '×', attrs: { type: 'button', 'aria-label': 'Schließen' }, on: { click: schliessen } }),
      ]),
      el('div', { class: 'durchlauf__punkte', attrs: { 'aria-hidden': 'true' } }, punkte),
      fertig
        ? el('div', { class: 'durchlauf__mitte' }, [
          el('span', { class: 'durchlauf__zahl', text: '✓' }),
          el('h2', { class: 'durchlauf__text', text: 'Geschafft.' }),
          el('p', { class: 'app__note', text: `${n} von ${n} Schritten` }),
        ])
        : el('div', { class: 'durchlauf__mitte', attrs: { 'aria-live': 'polite' } }, [
          el('span', { class: 'durchlauf__zahl', text: `${i + 1} / ${n}` }),
          el('h2', { class: 'durchlauf__text', text: routine.schritte[i].text }),
        ]),
      el('footer', { class: 'durchlauf__fuss' }, fertig
        ? [button({ text: 'Fertig', variant: 'primary', onClick: schliessen })]
        : [
          button({ text: 'Zurück', variant: 'ghost', disabled: i === 0, onClick: zurueck }),
          button({ text: i === n - 1 ? 'Abschließen' : 'Erledigt', variant: 'primary', onClick: weiter }),
        ]),
    ]));
    dialog.querySelector('.btn--primary').focus();
  }

  async function weiter() {
    i++;
    log = await speichereStand(routine, i, log);
    if (i >= n) return zeichne(true);
    zeichne();
  }

  function zurueck() {
    if (i === 0) return;
    i--;
    zeichne();
  }

  dialog.addEventListener('close', () => dialog.remove());
  signal?.addEventListener('abort', schliessen);
  document.body.append(dialog);
  dialog.showModal();
  zeichne();
}
