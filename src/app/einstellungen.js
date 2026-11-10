// Bereich „Einstellungen“ als Kacheln: Abgleich, Akzent, Mitteilungen, Export, Wiederherstellen, Prompts, Verlauf, Konto.
import { el } from '../ui/dom.js';
import { kachel, kacheln } from '../ui/kachel.js';
import { signOut } from '../core/auth.js';
import { downloadExport } from '../core/export.js';
import { abgleichKachel } from './abgleich-kachel.js';
import { akzentKachel } from './akzent-kachel.js';
import { wiederherstellenKachel } from './wiederherstellen-kachel.js';
import { mitteilungenKachel } from './mitteilungen-kachel.js';
import { promptsKachel } from './prompts-kachel.js';
import { verlaufKachel } from './verlauf-kachel.js';

function exportKachel(meldung) {
  return kachel({
    symbol: 'export',
    titel: 'Export',
    wert: 'Sichern',
    text: 'Alle Daten als JSON-Datei',
    onClick: async () => {
      meldung.textContent = '';
      try {
        await downloadExport();
      } catch (err) {
        console.warn(err);
        meldung.textContent = 'Export hat nicht geklappt. Bitte nochmal versuchen.';
      }
    },
  });
}

function kontoKachel() {
  const k = kachel({
    symbol: 'konto',
    titel: 'Konto',
    wert: 'Abmelden',
    gross: true, // volle Breite
    text: 'Daten bleiben gespeichert',
    onClick: async () => {
      // Kachel ist groß und schnell angetippt, deshalb kurz nachfragen.
      if (!confirm('Wirklich abmelden?')) return;
      k.disabled = true;
      await signOut(); // main.js schaltet danach auf die Login-Ansicht
    },
  });
  return k;
}

function ansicht({ signal }) {
  const meldung = el('p', { class: 'app__note app__note--warn', attrs: { role: 'alert' } });
  return el('div', { class: 'app__stack' }, [
    kacheln([abgleichKachel({ signal }), akzentKachel(), mitteilungenKachel(), exportKachel(meldung), wiederherstellenKachel(), promptsKachel(), verlaufKachel(), kontoKachel()]),
    meldung,
  ]);
}

export const einstellungenBereich = {
  id: 'einstellungen',
  titel: 'Einstellungen',
  symbol: 'einstellungen',
  bild: [1, 2, 3].map((n) => `assets/bilder/einstellungen-${n}.webp`), // Steinquader, drei Varianten
  ende: true,
  ansicht,
};
