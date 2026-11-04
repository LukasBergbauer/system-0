// Bereich „Einstellungen“: Abgleich-Status, Export, Abmelden.
import { el } from '../ui/dom.js';
import { card } from '../ui/card.js';
import { button } from '../ui/button.js';
import { signOut } from '../core/auth.js';
import { syncCard } from './sync-karte.js';
import { exportCard } from './export-karte.js';

function kontoCard() {
  const logout = button({
    text: 'Abmelden',
    variant: 'ghost',
    onClick: async () => {
      logout.disabled = true;
      await signOut(); // main.js schaltet danach auf die Login-Ansicht
    },
  });
  return card({
    title: 'Konto',
    children: el('div', { class: 'app__stack' }, [
      el('p', { class: 'app__note', text: 'Du bist angemeldet.' }),
      el('div', { class: 'app__row' }, logout),
    ]),
  });
}

function ansicht({ signal }) {
  return el('div', { class: 'app__stack' }, [
    syncCard({ signal }),
    exportCard(),
    kontoCard(),
  ]);
}

export const einstellungenBereich = {
  id: 'einstellungen',
  titel: 'Einstellungen',
  symbol: 'einstellungen',
  ende: true,
  ansicht,
};
