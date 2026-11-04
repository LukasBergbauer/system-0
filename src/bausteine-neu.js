// Musterseite, zweiter Teil: Bausteine aus der Design-Runde (Kopfbild, Kachel, Chips, Knopf primary).
// Oben schaltet eine Chip-Leiste die Bereichsfarbe um, damit man den Schimmer je Bereich sieht.
import { el } from './ui/dom.js';
import { card } from './ui/card.js';
import { button } from './ui/button.js';
import { kopfbild } from './ui/kopfbild.js';
import { kachel, kacheln } from './ui/kachel.js';
import { chips } from './ui/chips.js';

const note = (text) => el('p', { class: 'muster__note', text });

// Vorläufiges Testbild (Sonne + Blüten), bis in Teil c die echten Illustrationen kommen.
const TESTBILD = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200">' +
  '<circle cx="190" cy="80" r="60" fill="#F2A7BB" opacity="0.35"/>' +
  '<path d="M40 190 C120 140 170 120 290 40" stroke="#8a6f6a" stroke-width="3" fill="none"/>' +
  '<g fill="#F2A7BB"><circle cx="150" cy="128" r="9"/><circle cx="210" cy="92" r="11"/><circle cx="255" cy="62" r="8"/></g>' +
  '</svg>'
);

const FARBEN = [
  { id: 'heute', label: 'Heute' },
  { id: 'todos', label: 'To-dos' },
  { id: 'einstellungen', label: 'Einstellungen' },
  { id: 'physio', label: 'Physio' },
];

function setzeFarbe(id) {
  document.documentElement.style.setProperty('--bereich', `var(--farbe-${id})`);
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
    kopfbild({
      titel: 'Heute',
      bild: TESTBILD,
      spruch: { jp: '一期一会', de: 'Jede Begegnung ist einmalig.' },
    }),
    note('Kopfbild: zarte Illustration ohne eigenen Hintergrund, Ränder laufen weich aus. Testbild, echte Bilder folgen.'),
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
