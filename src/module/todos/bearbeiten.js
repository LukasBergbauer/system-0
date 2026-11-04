// Modal „To-do bearbeiten“: Titel, Notiz, Priorität, Fälligkeit, Bereich, Löschen.
import { el } from '../../ui/dom.js';
import { modal } from '../../ui/modal.js';
import { input } from '../../ui/input.js';
import { tabs } from '../../ui/tabs.js';
import { button } from '../../ui/button.js';
import { PRIOS, aendereTodo, loescheTodo } from './data.js';

let zaehler = 0;

// Beschriftetes Feld für Elemente ohne eigenen Baustein (Notiz, Auswahl).
function feld(label, element) {
  const id = `todo-feld-${++zaehler}`;
  element.id = id;
  return el('div', { class: 'field' }, [el('label', { class: 'field__label', text: label, attrs: { for: id } }), element]);
}

function gruppe(label, inhalt) {
  return el('div', { class: 'field', attrs: { role: 'group', 'aria-label': label } }, [
    el('span', { class: 'field__label', text: label }),
    inhalt,
  ]);
}

export function oeffneBearbeiten(todo, bereiche) {
  const titelFeld = input({ label: 'Titel', value: todo.titel });
  const titel = titelFeld.querySelector('input');

  const notiz = el('textarea', { class: 'field__input todo-notiz', attrs: { rows: 3 } });
  notiz.value = todo.notiz || '';

  let prio = todo.prio;
  const prioWahl = tabs({
    items: PRIOS.map((p) => ({ id: p.id, label: p.label })),
    active: prio,
    onChange: (id) => { prio = id; },
  });

  const datumFeld = input({ label: 'Fällig am', type: 'date', value: todo.faellig_am || '' });
  const datum = datumFeld.querySelector('input');

  // Bereich gelöscht oder (noch) unbekannt → „Ohne Bereich“.
  const bekannt = bereiche.some((b) => b.id === todo.bereich_id);
  const bereich = el('select', { class: 'field__input' }, [
    el('option', { text: 'Ohne Bereich', attrs: { value: '' } }),
    bereiche.map((b) => el('option', { text: b.name, attrs: { value: b.id, selected: bekannt && b.id === todo.bereich_id } })),
  ]);

  const m = modal({
    title: 'To-do bearbeiten',
    content: [
      titelFeld,
      feld('Notiz', notiz),
      gruppe('Priorität', prioWahl),
      datumFeld,
      feld('Bereich', bereich),
    ],
    actions: [
      button({ text: 'Löschen', variant: 'ghost', onClick: loeschen }),
      button({ text: 'Abbrechen', variant: 'ghost', onClick: () => m.close() }),
      button({ text: 'Speichern', onClick: speichern }),
    ],
  });

  async function speichern() {
    const neuerTitel = titel.value.trim();
    if (!neuerTitel) return titel.focus();
    await aendereTodo({
      id: todo.id,
      titel: neuerTitel,
      notiz: notiz.value.trim(),
      prio,
      faellig_am: datum.value || null,
      bereich_id: bereich.value || null,
    });
    m.close();
  }

  async function loeschen() {
    if (!confirm(`„${todo.titel}“ löschen?`)) return;
    await loescheTodo(todo.id);
    m.close();
  }

  titel.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.isComposing) speichern();
  });
  // Nach dem Schließen wieder aus der Seite entfernen.
  m.element.addEventListener('close', () => m.element.remove());
  m.open();
}
