// Schnelleingabe oben: Titel tippen, Enter → To-do ist angelegt.
// In der Zeile: Sonne = Heute, Sonnenaufgang = Morgen (an/aus), „+“. Gilt für das nächste To-do.
// Heute ist auf HEUTE_MAX begrenzt (Fokus); ist es voll, bleibt der Text stehen und ein Hinweis erscheint.
// Das Feld bleibt im Fokus, damit gleich das nächste To-do folgen kann.
import { el } from '../../ui/dom.js';
import { symbol } from '../../ui/symbol.js';
import { neuesTodo, heuteVoll, HEUTE_MAX } from './data.js';
import { heuteISO } from './sortierung.js';
import { rueckgaengig } from './wischen.js';

export const VOLL_TEXT = `Heute sind schon ${HEUTE_MAX} To-dos – erst eins erledigen oder verschieben.`;

// Kleiner Knopf in der Leiste; mousedown verhindern: Fokus bleibt im Feld (iPhone-Tastatur bleibt offen)
function knopf(onClick, sym, label) {
  return el('button', { class: 'leiste__option', attrs: { type: 'button', 'aria-label': label }, on: { click: onClick, mousedown: (e) => e.preventDefault() } }, [symbol(sym)]);
}

export function schnelleingabe() {
  const eingabe = el('input', { class: 'leiste__feld', attrs: { placeholder: 'Neues To-do', 'aria-label': 'Neues To-do', enterkeyhint: 'enter' } });

  let tag = null; // 0 = heute, 1 = morgen
  const heute = knopf(() => { tag = tag === 0 ? null : 0; zeige(); }, 'heute', 'Heute fällig');
  const morgen = knopf(() => { tag = tag === 1 ? null : 1; zeige(); }, 'morgen', 'Morgen fällig');
  const plus = el('button', { class: 'leiste__knopf', attrs: { type: 'button', 'aria-label': 'To-do anlegen' },
    on: { click: anlegen, mousedown: (e) => e.preventDefault() } }, [symbol('plus')]);

  function zeige() {
    heute.setAttribute('aria-pressed', String(tag === 0));
    morgen.setAttribute('aria-pressed', String(tag === 1));
  }

  eingabe.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.isComposing) return;
    e.preventDefault();
    anlegen();
  });

  async function anlegen() {
    const titel = eingabe.value.trim();
    if (!titel) return;
    if (tag === 0 && await heuteVoll()) return rueckgaengig(VOLL_TEXT);
    eingabe.value = '';
    await neuesTodo(titel, tag === null ? null : heuteISO(tag));
    tag = null;
    zeige();
  }

  zeige();
  const box = el('div', { class: 'leiste todo-schnell' }, [eingabe, heute, morgen, plus]);
  box.fokus = () => eingabe.focus();
  return box;
}
