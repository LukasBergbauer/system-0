// Schnelleingabe oben: Titel tippen, Enter → To-do ist angelegt (Priorität mittel, ohne Datum).
// zielBereich() liefert den gerade gefilterten Bereich (oder null); dort landet das neue To-do.
// Das Feld bleibt im Fokus, damit gleich das nächste To-do folgen kann.
import { input } from '../../ui/input.js';
import { neuesTodo } from './data.js';

export function schnelleingabe({ zielBereich = () => null } = {}) {
  const feld = input({ placeholder: 'Neues To-do …' });
  const eingabe = feld.querySelector('input');
  eingabe.setAttribute('aria-label', 'Neues To-do');
  eingabe.setAttribute('enterkeyhint', 'enter');

  eingabe.addEventListener('keydown', async (e) => {
    if (e.key !== 'Enter' || e.isComposing) return;
    e.preventDefault();
    const titel = eingabe.value.trim();
    if (!titel) return;
    eingabe.value = '';
    await neuesTodo(titel, zielBereich());
  });

  return feld;
}
