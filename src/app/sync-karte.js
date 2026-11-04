// Karte „Abgleich“ (in den Einstellungen): Status + „Jetzt abgleichen“.
import { el } from '../ui/dom.js';
import { card } from '../ui/card.js';
import { button } from '../ui/button.js';
import { on } from '../core/events.js';
import { syncNow, syncStatus } from '../core/sync.js';

const clock = (iso) => new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

function statusText({ state, at, pending }) {
  const wait = pending ? ` · ${pending} ${pending === 1 ? 'Änderung wartet' : 'Änderungen warten'}` : '';
  if (state === 'neu') return 'Noch nicht abgeglichen';
  if (state === 'läuft') return 'Gleiche ab …';
  if (state === 'ok') return `Abgeglichen um ${clock(at)}${wait}`;
  if (state === 'fehler') return `Abgleich hat nicht geklappt, neuer Versuch in Kürze${wait}`;
  return `Offline – Änderungen werden später hochgeladen${wait}`;
}

export function syncCard({ signal } = {}) {
  const line = el('p', { class: 'app__note', text: statusText(syncStatus()) });
  on('sync', (s) => { line.textContent = statusText(s); }, { signal });

  return card({
    title: 'Abgleich',
    children: el('div', { class: 'app__stack' }, [
      line,
      el('div', { class: 'app__row' }, button({ text: 'Jetzt abgleichen', variant: 'ghost', onClick: () => syncNow() })),
    ]),
  });
}
