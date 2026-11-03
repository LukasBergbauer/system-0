// Modal: auf dem iPhone von unten (Sheet), auf dem Mac mittig.
// Nutzt das eingebaute <dialog>: Esc schließt, Fokus bleibt im Modal.
// const m = modal({ title, content, actions }); m.open(); m.close();
import { el } from './dom.js';

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function modal({ title, content = [], actions = [] } = {}) {
  const dialog = el('dialog', { class: 'modal' }, [
    el('div', { class: 'modal__panel' }, [
      el('span', { class: 'modal__grip', attrs: { 'aria-hidden': 'true' } }),
      title && el('h2', { class: 'modal__title', text: title }),
      el('div', { class: 'modal__body' }, content),
      actions.length > 0 && el('div', { class: 'modal__actions' }, actions),
    ]),
  ]);

  // Tippen auf den abgedunkelten Hintergrund schließt.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) close();
  });
  // Esc: erst sanft ausblenden statt hart schließen.
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    close();
  });

  function open() {
    if (!dialog.isConnected) document.body.append(dialog);
    dialog.classList.remove('is-closing');
    dialog.showModal();
  }

  function close() {
    if (!dialog.open || dialog.classList.contains('is-closing')) return;
    if (reduceMotion()) return dialog.close();
    dialog.classList.add('is-closing');
    const timer = setTimeout(done, 400); // Sicherheitsnetz, falls keine Animation läuft
    dialog.addEventListener('animationend', done);
    function done() {
      clearTimeout(timer);
      dialog.removeEventListener('animationend', done);
      dialog.classList.remove('is-closing');
      dialog.close();
    }
  }

  return { element: dialog, open, close };
}
