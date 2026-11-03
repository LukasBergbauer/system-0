// Karte „Export“: lädt alle Daten als JSON-Datei herunter.
// Vorläufig hier, später in der Einstellungen-Ansicht.
import { el } from '../ui/dom.js';
import { card } from '../ui/card.js';
import { button } from '../ui/button.js';
import { downloadExport } from '../core/export.js';

export function exportCard() {
  const message = el('p', { class: 'app__note app__note--warn', attrs: { role: 'alert' } });
  const btn = button({
    text: 'Alle Daten exportieren',
    variant: 'ghost',
    onClick: async () => {
      message.textContent = '';
      try {
        await downloadExport();
      } catch (err) {
        console.warn(err);
        message.textContent = 'Export hat nicht geklappt. Bitte nochmal versuchen.';
      }
    },
  });

  return card({
    title: 'Export',
    children: el('div', { class: 'app__stack' }, [
      el('p', { class: 'app__note', text: 'Alle Daten dieses Geräts als JSON-Datei – zur Sicherheit, falls sich etwas an Supabase ändert.' }),
      message,
      el('div', { class: 'app__row' }, btn),
    ]),
  });
}
