// Karten für den Abgleich: Status + „Jetzt abgleichen“ und eine Testnotiz,
// mit der Lukas prüfen kann, ob Änderungen auf dem anderen Gerät ankommen.
// Vorläufig, bis es eine echte Einstellungen-Ansicht gibt.
import { el } from '../ui/dom.js';
import { card } from '../ui/card.js';
import { button } from '../ui/button.js';
import { input } from '../ui/input.js';
import { on } from '../core/events.js';
import { syncNow, syncStatus } from '../core/sync.js';
import { getSetting, setSetting } from '../core/einstellungen.js';

const clock = (iso) => new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

function statusText({ state, at, pending }) {
  const wait = pending ? ` · ${pending} ${pending === 1 ? 'Änderung wartet' : 'Änderungen warten'}` : '';
  if (state === 'neu') return 'Noch nicht abgeglichen';
  if (state === 'läuft') return 'Gleiche ab …';
  if (state === 'ok') return `Abgeglichen um ${clock(at)}${wait}`;
  if (state === 'fehler') return `Abgleich hat nicht geklappt, neuer Versuch in Kürze${wait}`;
  return `Offline – Änderungen werden später hochgeladen${wait}`;
}

export function syncCard() {
  const line = el('p', { class: 'app__note', text: statusText(syncStatus()) });
  on('sync', (s) => { line.textContent = statusText(s); });

  return card({
    title: 'Abgleich',
    children: el('div', { class: 'app__stack' }, [
      line,
      el('div', { class: 'app__row' }, button({ text: 'Jetzt abgleichen', variant: 'ghost', onClick: () => syncNow() })),
    ]),
  });
}

export function testNoteCard() {
  const field = input({ label: 'Testnotiz', placeholder: 'Etwas eintippen …' });
  const inp = field.querySelector('input');
  const saved = el('p', { class: 'app__note' });

  async function load() {
    const value = await getSetting('testnotiz', '');
    saved.textContent = value ? `Gespeichert: „${value}“` : 'Noch nichts gespeichert.';
    if (document.activeElement !== inp) inp.value = value;
  }

  const form = el('form', {
    class: 'app__stack',
    on: {
      submit: async (e) => {
        e.preventDefault();
        await setSetting('testnotiz', inp.value.trim());
        inp.blur();
        load();
      },
    },
  }, [
    el('p', { class: 'app__note', text: 'Hier ändern, dann auf dem anderen Gerät nachsehen.' }),
    field,
    saved,
    el('div', { class: 'app__row' }, button({ text: 'Speichern', type: 'submit' })),
  ]);

  on('daten', ({ table }) => { if (table === 'einstellungen') load(); });
  load();
  return card({ title: 'Sync-Test', children: form });
}
