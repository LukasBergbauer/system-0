// Musterseite, zweiter Teil: Bausteine aus der Design-Runde (Chips, Kachel, Knopf primary).
import { el } from './ui/dom.js';
import { card } from './ui/card.js';
import { button } from './ui/button.js';
import { kachel, kacheln } from './ui/kachel.js';
import { chips } from './ui/chips.js';

const note = (text) => el('p', { class: 'muster__note', text });

export function chipsDemo() {
  return card({
    title: 'Chips',
    children: [
      note('Gewählter Chip weiß, umrandeter Chip = Aktion.'),
      chips({
        items: [{ id: 'alle', label: 'Alle' }, { id: 'arbeit', label: 'Arbeit' }, { id: 'privat', label: 'Privat' }],
        aktionen: [{ label: '+ Bereich', onClick: () => {} }],
      }),
    ],
  });
}

export function kachelDemo() {
  return el('div', { class: 'muster__stack' }, [
    kacheln([
      kachel({ symbol: 'abgleich', titel: 'Abgleich', wert: 'Alles synchron', text: 'Zuletzt vor 2 Minuten', gross: true }),
      kachel({ symbol: 'export', titel: 'Export', wert: 'JSON', onClick: () => {} }),
      kachel({ symbol: 'konto', titel: 'Konto', wert: 'Abmelden', onClick: () => {} }),
    ]),
    note('Kacheln: groß (Symbol links) oder klein (Symbol oben), Label in Großbuchstaben, Wert in Serifenschrift.'),
  ]);
}

export function primaryDemo() {
  return card({
    title: 'Hauptknopf',
    children: el('div', { class: 'muster__row' }, [
      button({ text: 'Speichern', variant: 'primary' }),
      button({ text: 'Normal' }),
      button({ text: 'Abbrechen', variant: 'ghost' }),
    ]),
  });
}
