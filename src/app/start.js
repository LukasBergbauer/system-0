// Startansicht nach dem Login (vorläufig, bis Navigation und Module kommen).
import { el } from '../ui/dom.js';
import { card } from '../ui/card.js';
import { button } from '../ui/button.js';
import { signOut } from '../core/auth.js';
import { syncCard, testNoteCard } from './sync-karte.js';
import { exportCard } from './export-karte.js';

export function startView() {
  const logout = button({
    text: 'Abmelden',
    variant: 'ghost',
    onClick: async () => {
      logout.disabled = true;
      await signOut(); // main.js schaltet danach auf die Login-Ansicht
    },
  });

  return el('div', { class: 'app' }, [
    el('h1', { class: 'app__title', text: 'System 0' }),
    testNoteCard(),
    syncCard(),
    exportCard(),
    card({
      title: 'Konto',
      children: el('div', { class: 'app__stack' }, [
        el('p', { class: 'app__note', text: 'Du bist angemeldet.' }),
        el('div', { class: 'app__row' }, logout),
      ]),
    }),
  ]);
}
