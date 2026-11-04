// Musterseite, zweiter Teil: Bausteine aus der Design-Runde (Kopfbild, Kachel, Chips, Knopf primary).
// Oben schaltet eine Chip-Leiste die Bereichsfarbe um (mit Kopfbild und Spruch des Bereichs).
import { el } from './ui/dom.js';
import { card } from './ui/card.js';
import { button } from './ui/button.js';
import { kopfbild } from './ui/kopfbild.js';
import { kachel, kacheln } from './ui/kachel.js';
import { chips } from './ui/chips.js';
import { spruchDesTages } from './core/sprueche.js';

const note = (text) => el('p', { class: 'muster__note', text });

const FARBEN = [
  { id: 'heute', label: 'Heute' },
  { id: 'todos', label: 'To-dos' },
  { id: 'einstellungen', label: 'Einstellungen' },
  { id: 'physio', label: 'Physio' },
];

// Physio hat noch kein eigenes Bild (kommt mit dem Modul).
const BILDER = { heute: 'heute', todos: 'todos', einstellungen: 'einstellungen' };
const kopfPlatz = el('div');

function setzeFarbe(id) {
  document.documentElement.style.setProperty('--bereich', `var(--farbe-${id})`);
  const versatz = FARBEN.findIndex((f) => f.id === id);
  kopfPlatz.replaceChildren(kopfbild({
    titel: FARBEN[versatz].label,
    bild: BILDER[id] && `assets/bilder/${BILDER[id]}.svg`,
    spruch: spruchDesTages(versatz),
  }));
}

export function farbUmschalter() {
  setzeFarbe(FARBEN[0].id);
  return card({
    title: 'Bereichsfarbe',
    children: [
      note('Chips: gewählter Chip weiß, umrandeter Chip = Aktion. Wechselt hier die Farbe der Muster.'),
      chips({
        items: FARBEN,
        onChange: setzeFarbe,
        aktionen: [{ label: '+ Bereich', onClick: () => {} }],
      }),
    ],
  });
}

export function kopfbildDemo() {
  return el('div', { class: 'muster__stack' }, [
    kopfPlatz,
    note('Kopfbild: zarte Illustration ohne eigenen Hintergrund, Ränder laufen weich aus. Spruch wechselt täglich, je Bereich ein anderer.'),
  ]);
}

export function kachelDemo() {
  return el('div', { class: 'muster__stack' }, [
    kacheln([
      kachel({ symbol: 'einstellungen', titel: 'Abgleich', wert: 'Alles synchron', text: 'Zuletzt vor 2 Minuten', gross: true }),
      kachel({ symbol: 'todos', titel: 'Export', wert: 'JSON', onClick: () => {} }),
      kachel({ symbol: 'heute', titel: 'Konto', wert: 'Abmelden', onClick: () => {} }),
    ]),
    note('Kacheln: groß (ganze Breite) oder klein (halbe Breite), mit onClick antippbar.'),
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
