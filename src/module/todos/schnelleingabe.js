// Schnelleingabe oben: Titel tippen, Enter → To-do ist angelegt.
// Darunter Schnell-Knöpfe (Kapseln): Heute / Morgen, Priorität (Mittel → Hoch → Niedrig), Bereich (antippen = nächster).
// Datum und Priorität gelten für das nächste To-do und springen danach zurück; der Bereich bleibt stehen.
// zielBereich() = gerade gefilterter Bereich (oder null), bereiche() = alle Bereiche in Reihenfolge.
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

export function schnelleingabe({ zielBereich = () => null, bereiche = () => [] } = {}) {
  const feld = input({ placeholder: 'Neues To-do …' });
  const eingabe = feld.querySelector('input');
  eingabe.setAttribute('aria-label', 'Neues To-do');
  eingabe.setAttribute('enterkeyhint', 'enter');

  let tag = null; // 0 = heute, 1 = morgen
  let prio = 2;
  let bereich; // undefined = wie Filter

  const heute = knopf(() => { tag = tag === 0 ? null : 0; zeige(); });
  const morgen = knopf(() => { tag = tag === 1 ? null : 1; zeige(); });
  const prioKnopf = knopf(() => { prio = NAECHSTE_PRIO[prio]; zeige(); });
  const bereichKnopf = knopf(() => {
    const liste = [null, ...bereiche().map((b) => b.id)];
    const jetzt = bereich === undefined ? zielBereich() : bereich;
    bereich = liste[(liste.indexOf(jetzt) + 1) % liste.length];
    zeige();
  });

  function zeige() {
    heute.textContent = 'Heute';
    morgen.textContent = 'Morgen';
    heute.setAttribute('aria-pressed', String(tag === 0));
    morgen.setAttribute('aria-pressed', String(tag === 1));
    prioKnopf.textContent = PRIO[prio];
    prioKnopf.setAttribute('aria-pressed', String(prio !== 2));
    const id = bereich === undefined ? zielBereich() : bereich;
    bereichKnopf.textContent = bereiche().find((b) => b.id === id)?.name || 'Kein Bereich';
    bereichKnopf.setAttribute('aria-pressed', String(!!id));
  }

  eingabe.addEventListener('keydown', async (e) => {
    if (e.key !== 'Enter' || e.isComposing) return;
    e.preventDefault();
    const titel = eingabe.value.trim();
    if (!titel) return;
    eingabe.value = '';
    await neuesTodo(titel, bereich === undefined ? zielBereich() : bereich, { prio, faellig_am: tag === null ? null : tagISO(tag) });
    tag = null;
    prio = 2;
    zeige();
  });

  zeige();
  const box = el('div', { class: 'todo-schnell' }, [feld, el('div', { class: 'todo-schnell__knoepfe' }, [heute, morgen, prioKnopf, bereichKnopf])]);
  box.auffrischen = () => { if (bereich !== undefined && bereich && !bereiche().some((b) => b.id === bereich)) bereich = undefined; zeige(); };
  box.fokus = () => eingabe.focus();
  return box;
}
