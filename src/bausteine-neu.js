// Musterseite, zweiter Teil: Bausteine aus der Design-Runde (Kopfbild, Kachel, Chips, Knopf primary).
// Oben schaltet eine Chip-Leiste die Bereichsfarbe um (mit Kopfbild und Spruch des Bereichs).
import { el } from './ui/dom.js';
import { card } from './ui/card.js';
import { button } from './ui/button.js';
import { kopfbild } from './ui/kopfbild.js';
import { kachel, kacheln } from './ui/kachel.js';
import { chips } from './ui/chips.js';
import { spruchDesTages, desTages } from './core/sprueche.js';

const note = (text) => el('p', { class: 'muster__note', text });

const FARBEN = [
  { id: 'heute', label: 'Heute' },
  { id: 'todos', label: 'To-dos' },
  { id: 'einstellungen', label: 'Einstellungen' },
  { id: 'physio', label: 'Physio' },
];

// Stein-Szenen je Bereich (Physio bekommt sein Bild mit dem Modul).
const BILDER = { heute: 'heute', todos: 'todos', einstellungen: 'einstellungen' };
const kopfPlatz = el('div');

function setzeFarbe(id) {
  document.documentElement.style.setProperty('--bereich', `var(--farbe-${id})`);
  const versatz = FARBEN.findIndex((f) => f.id === id);
  kopfPlatz.replaceChildren(kopfbild({
    titel: FARBEN[versatz].label,
    bild: BILDER[id] && desTages([1, 2, 3].map((n) => `assets/bilder/${BILDER[id]}-${n}.webp`)),
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
    el('p', { class: 'marke', text: 'System 0' }),
    kopfPlatz,
    note('Markenzeile, darunter Kopfbild: großer Serifentitel, Strich, kursiver Spruch (wechselt täglich). Jeder Bereich hat sein eigenes Stein-Motiv.'),
  ]);
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
