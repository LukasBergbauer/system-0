// Schnelleingabe oben: Titel tippen, Enter → To-do ist angelegt.
// In der Leiste: Kalender-Symbol (ohne → Heute → Morgen), „!“ (normal → !! hoch → ↓ niedrig), „+“; gelten für das nächste To-do.
// Bereich = gerade gefilterter Bereich (zielBereich(), sonst keiner); ändern im Bearbeiten-Fenster.
// Das Feld bleibt im Fokus, damit gleich das nächste To-do folgen kann.
import { el } from '../../ui/dom.js';
import { symbol } from '../../ui/symbol.js';
import { neuesTodo } from './data.js';

const PRIO = { 1: '!!', 2: '!', 3: '↓' }; // hoch · normal · niedrig
const PRIO_NAME = { 1: 'Priorität hoch', 2: 'Priorität normal', 3: 'Priorität niedrig' };
const NAECHSTE_PRIO = { 2: 1, 1: 3, 3: 2 };
const TAG = [null, 0, 1]; // ohne · heute · morgen
const TAG_TEXT = { 0: 'Heute', 1: 'Morgen' };
const tagISO = (plus) => {
  const d = new Date();
  d.setDate(d.getDate() + plus);
  return d.toLocaleDateString('sv-SE');
};

// Kleiner Knopf in der Leiste; mousedown verhindern: Fokus bleibt im Feld (iPhone-Tastatur bleibt offen)
function knopf(onClick) {
  return el('button', { class: 'leiste__option', attrs: { type: 'button' }, on: { click: onClick, mousedown: (e) => e.preventDefault() } });
}

export function schnelleingabe({ zielBereich = () => null } = {}) {
  const eingabe = el('input', { class: 'leiste__feld', attrs: { placeholder: 'Neues To-do', 'aria-label': 'Neues To-do', enterkeyhint: 'enter' } });

  let tag = null; // 0 = heute, 1 = morgen
  let prio = 2;
  const tagKnopf = knopf(() => { tag = TAG[(TAG.indexOf(tag) + 1) % TAG.length]; zeige(); });
  const prioKnopf = knopf(() => { prio = NAECHSTE_PRIO[prio]; zeige(); });
  const plus = el('button', { class: 'leiste__knopf', attrs: { type: 'button', 'aria-label': 'To-do anlegen' },
    on: { click: anlegen, mousedown: (e) => e.preventDefault() } }, [symbol('plus')]);

  function zeige() {
    tagKnopf.replaceChildren(symbol('kalender'), ...(tag === null ? [] : [TAG_TEXT[tag]]));
    tagKnopf.setAttribute('aria-label', tag === null ? 'Ohne Datum' : `Fällig ${TAG_TEXT[tag]}`);
    tagKnopf.setAttribute('aria-pressed', String(tag !== null));
    prioKnopf.textContent = PRIO[prio];
    prioKnopf.setAttribute('aria-label', PRIO_NAME[prio]);
    prioKnopf.setAttribute('aria-pressed', String(prio !== 2));
  }

  eingabe.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.isComposing) return;
    e.preventDefault();
    anlegen();
  });

  async function anlegen() {
    const titel = eingabe.value.trim();
    if (!titel) return;
    eingabe.value = '';
    await neuesTodo(titel, zielBereich(), { prio, faellig_am: tag === null ? null : tagISO(tag) });
    tag = null;
    prio = 2;
    zeige();
  }

  zeige();
  const box = el('div', { class: 'leiste todo-schnell' }, [eingabe, tagKnopf, prioKnopf, plus]);
  box.fokus = () => eingabe.focus();
  return box;
}
