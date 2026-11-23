// Modal „To-do bearbeiten“: Titel, Notiz, Fälligkeit, Löschen. Heute ist auf HEUTE_MAX begrenzt.
import { el } from '../../ui/dom.js';
import { modal } from '../../ui/modal.js';
import { input } from '../../ui/input.js';
import { button } from '../../ui/button.js';
import { aendereTodo, loescheTodo, heuteVoll } from './data.js';
import { heuteISO } from './sortierung.js';
import { VOLL_TEXT } from './schnelleingabe.js';

let zaehler = 0;

// Beschriftetes Feld für Elemente ohne eigenen Baustein (Notiz).
function feld(label, element) {
  const id = `todo-feld-${++zaehler}`;
  element.id = id;
  return el('div', { class: 'field' }, [el('label', { class: 'field__label', text: label, attrs: { for: id } }), element]);
}

export function oeffneBearbeiten(todo) {
  const titelFeld = input({ label: 'Titel', value: todo.titel });
  const titel = titelFeld.querySelector('input');

  const notiz = el('textarea', { class: 'field__input todo-notiz', attrs: { rows: 3 } });
  notiz.value = todo.notiz || '';

  const datumFeld = input({ label: 'Fällig am', type: 'date', value: todo.faellig_am || '' });
  const datum = datumFeld.querySelector('input');
  const hinweis = el('p', { class: 'todo-hinweis', attrs: { role: 'status' } });

  const m = modal({
    title: 'To-do bearbeiten',
    content: [
      titelFeld,
      feld('Notiz', notiz),
      datumFeld,
      hinweis,
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
    if (datum.value === heuteISO() && todo.faellig_am !== datum.value && !todo.erledigt_am && await heuteVoll(todo.id)) return (hinweis.textContent = VOLL_TEXT);
    await aendereTodo({
      id: todo.id,
      titel: neuerTitel,
      notiz: notiz.value.trim(),
      faellig_am: datum.value || null,
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
