// Musterseite bausteine.html: zeigt alle UI-Bausteine, damit Lukas den Stil prüfen kann.
// Keine echten Daten, nur Beispiele.
import { el } from './ui/dom.js';
import { card } from './ui/card.js';
import { list, listRow, listItem } from './ui/list.js';
import { checkbox } from './ui/checkbox.js';
import { button } from './ui/button.js';
import { input } from './ui/input.js';
import { modal } from './ui/modal.js';
import { tabs } from './ui/tabs.js';

const note = (text) => el('p', { class: 'muster__note', text });
const chevron = '›';

function cardDemo() {
  return card({
    title: 'Karte',
    children: note('Fläche mit dünnem Rahmen statt Schatten. Hält Listen, Formulare und Inhalte zusammen.'),
  });
}

function listDemo() {
  return card({
    title: 'Liste',
    children: list([
      listRow({ title: 'Einkaufen', sub: 'Heute, 18:00', end: chevron, onClick: () => {} }),
      listRow({ title: 'Training: Oberkörper', sub: '45 Minuten', end: chevron, onClick: () => {} }),
      listRow({ title: 'Lesen', end: '12 Tage' }),
    ]),
  });
}

function checkboxDemo() {
  const rows = ['Wasser trinken', 'Dehnen', 'Tagebuch'].map((label, i) =>
    listItem(checkbox({ label, checked: i === 1 }))
  );
  return card({
    title: 'Checkbox',
    children: [
      note('Ganze Zeile antippen zum Abhaken.'),
      list(rows),
    ],
  });
}

function buttonDemo() {
  return card({
    title: 'Knopf',
    children: el('div', { class: 'muster__row' }, [
      button({ text: 'Speichern' }),
      button({ text: 'Abbrechen', variant: 'ghost' }),
      button({ text: 'Gesperrt', disabled: true }),
    ]),
  });
}

function inputDemo() {
  return card({
    title: 'Eingabefeld',
    children: el('div', { class: 'muster__stack' }, [
      input({ label: 'Titel', placeholder: 'Was steht an?' }),
      input({ label: 'Datum', type: 'date' }),
    ]),
  });
}

function tabsDemo() {
  const texts = {
    heute: 'Ansicht „Heute“',
    woche: 'Ansicht „Woche“',
    monat: 'Ansicht „Monat“',
  };
  const out = note(texts.heute);
  const bar = tabs({
    items: [
      { id: 'heute', label: 'Heute' },
      { id: 'woche', label: 'Woche' },
      { id: 'monat', label: 'Monat' },
    ],
    onChange: (id) => { out.textContent = texts[id]; },
  });
  return card({ title: 'Tabs', children: el('div', { class: 'muster__stack' }, [bar, out]) });
}

function modalDemo() {
  const m = modal({
    title: 'Neues To-do',
    content: [
      input({ label: 'Titel', placeholder: 'Was steht an?' }),
      checkbox({ label: 'Wichtig' }),
    ],
    actions: [
      button({ text: 'Abbrechen', variant: 'ghost', onClick: () => m.close() }),
      button({ text: 'Speichern', onClick: () => m.close() }),
    ],
  });
  return card({
    title: 'Modal',
    children: el('div', { class: 'muster__stack' }, [
      note('iPhone: kommt von unten. Mac: erscheint mittig. Schließen mit Knopf, Esc oder Tippen daneben.'),
      el('div', { class: 'muster__row' }, button({ text: 'Modal öffnen', onClick: () => m.open() })),
    ]),
  });
}

document.getElementById('muster').append(
  cardDemo(),
  listDemo(),
  checkboxDemo(),
  buttonDemo(),
  inputDemo(),
  tabsDemo(),
  modalDemo(),
);
