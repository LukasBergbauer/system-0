// Neuen Punkt anlegen: Art per Chip wählen, Titel tippen, Enter (oder „Anlegen“).
// Die zuletzt gewählte Art wird gemerkt (nur auf diesem Gerät, Bequemlichkeit).
// anlegenForm({ titel: 'Spanish Squat', onAngelegt: (eintrag) => … })
import { el } from '../../ui/dom.js';
import { chips } from '../../ui/chips.js';
import { input } from '../../ui/input.js';
import { button } from '../../ui/button.js';
import { ARTEN } from './arten.js';
import { neuerEintrag } from './daten.js';

const SCHLUESSEL = 'physio:letzte-art';

function letzteArt() {
  try {
    const id = localStorage.getItem(SCHLUESSEL);
    return ARTEN.some((a) => a.id === id) ? id : ARTEN[0].id;
  } catch {
    return ARTEN[0].id;
  }
}

function merkeArt(id) {
  try {
    localStorage.setItem(SCHLUESSEL, id);
  } catch { /* privates Fenster o. ä.: dann eben nicht merken */ }
}

export function anlegenForm({ titel = '', onAngelegt } = {}) {
  let art = letzteArt();
  const feld = input({ placeholder: 'Titel …', value: titel });
  const eingabe = feld.querySelector('input');
  eingabe.setAttribute('aria-label', 'Titel des neuen Punkts');
  eingabe.setAttribute('enterkeyhint', 'done');

  let laeuft = false;
  async function anlegen() {
    const t = eingabe.value.trim();
    if (!t || laeuft) return eingabe.focus();
    laeuft = true;
    merkeArt(art);
    const neu = await neuerEintrag(art, t);
    onAngelegt?.(neu);
  }

  eingabe.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.isComposing) return;
    e.preventDefault();
    anlegen();
  });

  return el('div', { class: 'mm-anlegen' }, [
    el('p', { class: 'label', text: 'Neuer Punkt' }),
    chips({
      items: ARTEN.map((a) => ({ id: a.id, label: a.name })),
      active: art,
      onChange: (id) => {
        art = id;
        eingabe.focus();
      },
    }),
    feld,
    el('div', { class: 'mm-anlegen__aktion' }, button({ text: 'Anlegen', variant: 'primary', onClick: anlegen })),
  ]);
}
