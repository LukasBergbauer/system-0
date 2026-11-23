// Modal „Bereiche bearbeiten“: Bereiche anlegen, umbenennen, löschen.
// Umbenennen wird gespeichert, sobald das Feld verlassen oder Enter gedrückt wird.
import { el } from '../../ui/dom.js';
import { modal } from '../../ui/modal.js';
import { input } from '../../ui/input.js';
import { button } from '../../ui/button.js';
import { list, listItem } from '../../ui/list.js';
import { on } from '../../core/events.js';
import { BEREICHE, ladeBereiche, neuerBereich, benenneBereich, loescheBereich } from './data.js';

function bereichZeile(bereich) {
  const feld = input({ value: bereich.name });
  const eingabe = feld.querySelector('input');
  eingabe.setAttribute('aria-label', `Bereich ${bereich.name} umbenennen`);

  const umbenennen = () => {
    const name = eingabe.value.trim();
    if (!name) eingabe.value = bereich.name; // leer = nicht übernehmen
    else if (name !== bereich.name) benenneBereich(bereich.id, name);
  };
  eingabe.addEventListener('change', umbenennen);
  eingabe.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.isComposing) eingabe.blur();
  });

  const loeschen = button({
    text: 'Löschen',
    variant: 'ghost',
    onClick: () => {
      const frage = `Bereich „${bereich.name}“ löschen? Seine To-dos bleiben erhalten, nur ohne Bereich.`;
      if (confirm(frage)) loescheBereich(bereich.id);
    },
  });

  return listItem(el('div', { class: 'todo-bereich' }, [feld, loeschen]));
}

export function oeffneBereicheVerwalten() {
  const liste = el('div');
  const ende = new AbortController();

  async function zeichne() {
    const bereiche = await ladeBereiche();
    // Nicht neu zeichnen, während ein Name getippt wird (sonst springt der Fokus).
    const aktiv = document.activeElement;
    if (aktiv?.tagName === 'INPUT' && liste.contains(aktiv)) return;
    liste.replaceChildren(
      bereiche.length
        ? list(bereiche.map(bereichZeile))
        : el('p', { class: 'app__note', text: 'Noch keine Bereiche.' })
    );
  }

  const neuFeld = input({ label: 'Neuer Bereich', placeholder: 'z. B. Praxis, Training, Privat …' });
  const neu = neuFeld.querySelector('input');
  async function anlegen() {
    const name = neu.value.trim();
    if (!name) return neu.focus();
    neu.value = '';
    await neuerBereich(name);
    neu.focus();
  }
  neu.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.isComposing) anlegen();
  });

  const m = modal({
    title: 'Bereiche bearbeiten',
    content: [liste, neuFeld, el('div', { class: 'app__row' }, button({ text: 'Hinzufügen', variant: 'ghost', onClick: anlegen }))],
    actions: [button({ text: 'Fertig', onClick: () => m.close() })],
  });

  on('daten', ({ table }) => {
    if (table === BEREICHE) zeichne();
  }, { signal: ende.signal });
  liste.addEventListener('focusout', () => setTimeout(zeichne)); // verpasstes Neuzeichnen nachholen

  m.element.addEventListener('close', () => {
    ende.abort();
    m.element.remove();
  });
  zeichne();
  m.open();
}
