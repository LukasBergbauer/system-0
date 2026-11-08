// Modal „Google-Kalender“: geheime iCal-Adresse eintragen oder entfernen, Stand des letzten Abrufs.
import { el } from '../../ui/dom.js';
import { modal } from '../../ui/modal.js';
import { input } from '../../ui/input.js';
import { button } from '../../ui/button.js';
import { GOOGLE_PREFIX, googleAdresse, googleStand, setzeGoogleAdresse } from './google.js';
import { tagText, zeitHM } from './zeit.js';

function standText({ abgerufen, termine, fehler }, adresse) {
  if (!adresse) return 'Google Kalender → Einstellungen → dein Kalender → „Privatadresse im iCal-Format“ kopieren.';
  if (fehler) return `Fehler: ${fehler}`;
  if (!abgerufen) return 'Noch nicht abgerufen.';
  const d = new Date(abgerufen);
  return `Zuletzt abgerufen: ${tagText(d)}, ${zeitHM(d)} · ${termine.length} Termine`;
}

export async function oeffneGoogleAdresse() {
  const [adresse, stand] = await Promise.all([googleAdresse(), googleStand()]);
  const feld = input({ label: 'Geheime iCal-Adresse', value: adresse, placeholder: `${GOOGLE_PREFIX}…` });
  const eingabe = feld.querySelector('input');
  eingabe.setAttribute('autocomplete', 'off');
  const hinweis = el('p', { class: 'app__note', text: standText(stand, adresse) });

  const m = modal({
    title: 'Google-Kalender',
    content: [feld, hinweis],
    actions: [
      adresse && button({ text: 'Entfernen', variant: 'ghost', onClick: () => speichern('') }),
      button({ text: 'Abbrechen', variant: 'ghost', onClick: () => m.close() }),
      button({ text: 'Speichern', onClick: () => speichern(eingabe.value.trim()) }),
    ].filter(Boolean),
  });

  async function speichern(neu) {
    if (neu && !neu.startsWith(GOOGLE_PREFIX)) {
      hinweis.textContent = `Die Adresse muss mit ${GOOGLE_PREFIX} beginnen.`;
      return eingabe.focus();
    }
    hinweis.textContent = neu ? 'Wird abgerufen …' : '';
    await setzeGoogleAdresse(neu);
    if (!neu) return m.close();
    const ergebnis = await googleStand();
    if (ergebnis.fehler) hinweis.textContent = standText(ergebnis, neu); // offen lassen, damit man den Fehler sieht
    else m.close();
  }

  m.element.addEventListener('close', () => m.element.remove());
  m.open();
}
