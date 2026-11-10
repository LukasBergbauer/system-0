// Schnelleingabe oben: Titel tippen, Enter → To-do ist angelegt.
// Darunter Schnell-Knöpfe (Kapseln): Heute / Morgen, Priorität (Mittel → Hoch → Niedrig); gelten für das nächste To-do.
// Bereich = gerade gefilterter Bereich (zielBereich(), sonst keiner); ändern im Bearbeiten-Fenster.
// Das Feld bleibt im Fokus, damit gleich das nächste To-do folgen kann.
import { el } from '../../ui/dom.js';
import { input } from '../../ui/input.js';
import { neuesTodo } from './data.js';

const PRIO = { 1: '! Hoch', 2: 'Priorität', 3: '↓ Niedrig' };
const NAECHSTE_PRIO = { 2: 1, 1: 3, 3: 2 };
const tagISO = (plus) => {
  const d = new Date();
  d.setDate(d.getDate() + plus);
  return d.toLocaleDateString('sv-SE');
};

function knopf(onClick) {
  // mousedown verhindern: Fokus bleibt im Feld (iPhone-Tastatur bleibt offen)
  return el('button', { class: 'todo-schnell__knopf', attrs: { type: 'button' }, on: { click: onClick, mousedown: (e) => e.preventDefault() } });
}

export function schnelleingabe({ zielBereich = () => null } = {}) {
  const feld = input({ placeholder: 'Neues To-do …' });
  const eingabe = feld.querySelector('input');
  eingabe.setAttribute('aria-label', 'Neues To-do');
  eingabe.setAttribute('enterkeyhint', 'enter');

  let tag = null; // 0 = heute, 1 = morgen
  let prio = 2;

  const heute = knopf(() => { tag = tag === 0 ? null : 0; zeige(); });
  const morgen = knopf(() => { tag = tag === 1 ? null : 1; zeige(); });
  const prioKnopf = knopf(() => { prio = NAECHSTE_PRIO[prio]; zeige(); });

  function zeige() {
    heute.textContent = 'Heute';
    morgen.textContent = 'Morgen';
    heute.setAttribute('aria-pressed', String(tag === 0));
    morgen.setAttribute('aria-pressed', String(tag === 1));
    prioKnopf.textContent = PRIO[prio];
    prioKnopf.setAttribute('aria-pressed', String(prio !== 2));
  }

  eingabe.addEventListener('keydown', async (e) => {
    if (e.key !== 'Enter' || e.isComposing) return;
    e.preventDefault();
    const titel = eingabe.value.trim();
    if (!titel) return;
    eingabe.value = '';
    await neuesTodo(titel, zielBereich(), { prio, faellig_am: tag === null ? null : tagISO(tag) });
    tag = null;
    prio = 2;
    zeige();
  });

  zeige();
  const box = el('div', { class: 'todo-schnell' }, [feld, el('div', { class: 'todo-schnell__knoepfe' }, [heute, morgen, prioKnopf])]);
  box.fokus = () => eingabe.focus();
  return box;
}
