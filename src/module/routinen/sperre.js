// Routinen-Sperre: Vollbild über der ganzen App, solange eine Routine mit Sperre ab ihrer Startzeit heute offen ist.
// Prüft beim Start, bei Bereichswechsel, Datenänderung, Rückkehr ins Fenster und jede Minute.
// Raus nur durch Abhaken (Durchlauf) oder „Heute aussetzen“. Wirkt nur in System 0, nicht auf andere Apps.
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { on } from '../../core/events.js';
import { isLoggedIn, onAuthChange } from '../../core/auth.js';
import { TABELLEN, ladeAlles, logAm, sperrendeRoutine, setzeAus } from './data.js';
import { starteDurchlauf } from './durchlauf.js';

let dialog = null;
let imDurchlauf = false;

function zu() {
  dialog?.close();
  dialog?.remove();
  dialog = null;
}

function zeige(r) {
  if (!dialog) {
    dialog = el('dialog', { class: 'durchlauf sperre', attrs: { 'aria-label': 'Gesperrt' } });
    dialog.addEventListener('cancel', (e) => e.preventDefault()); // Esc schließt nicht
    document.body.append(dialog);
  }
  const n = r.schritte.length;
  const stand = logAm(r)?.geschafft || 0;
  dialog.replaceChildren(el('div', { class: 'durchlauf__box' }, [
    el('header', { class: 'durchlauf__kopf' }, [el('span', { class: 'label', text: 'System 0 ist gesperrt' })]),
    el('div', { class: 'durchlauf__mitte' }, [
      el('span', { class: 'durchlauf__zahl', text: stand ? `${stand} / ${n} geschafft` : `${n} Schritte` }),
      el('h2', { class: 'durchlauf__text', text: r.name }),
      el('p', { class: 'app__note', text: 'Erst die Routine, dann der Rest.' }),
    ]),
    el('footer', { class: 'durchlauf__fuss' }, [
      button({ text: 'Heute aussetzen', variant: 'ghost', onClick: async () => {
        if (confirm(`„${r.name}“ heute aussetzen? Zählt nicht als geschafft.`)) { await setzeAus(r); pruefe(); }
      } }),
      button({ text: stand ? 'Weiter' : 'Starten', variant: 'primary', onClick: () => {
        imDurchlauf = true;
        starteDurchlauf(r, { onZu: () => { imDurchlauf = false; pruefe(); } });
      } }),
    ]),
  ]));
  if (!dialog.open) dialog.showModal();
}

async function pruefe() {
  if (imDurchlauf) return;
  const r = isLoggedIn() ? sperrendeRoutine(await ladeAlles()) : null;
  if (imDurchlauf) return;
  r ? zeige(r) : zu();
}

export function starteSperre() {
  on('route', pruefe);
  on('daten', ({ table }) => TABELLEN.includes(table) && pruefe());
  onAuthChange(pruefe);
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && pruefe());
  setInterval(pruefe, 60_000);
  pruefe();
}
