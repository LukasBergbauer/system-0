// Einstellungen: große Kachel „Mitteilungen“ – auf diesem Gerät ein-/ausschalten, Vorlauf für Termine wählen.
// Erinnerungen plant core/erinnerungen.js, verschickt die Supabase-Funktion „erinnerungen“.
import { el } from '../ui/dom.js';
import { kachel } from '../ui/kachel.js';
import { chips } from '../ui/chips.js';
import { button } from '../ui/button.js';
import { pushStatus, pushEinschalten, pushAusschalten } from '../core/mitteilungen.js';
import { getSetting, setSetting } from '../core/einstellungen.js';

const TEXTE = {
  'nicht-moeglich': 'Dieser Browser kann keine Mitteilungen',
  homebildschirm: 'Nur in der App vom Home-Bildschirm',
  blockiert: 'In den Systemeinstellungen blockiert',
  aus: 'Aus auf diesem Gerät',
  an: 'An auf diesem Gerät',
};

export function mitteilungenKachel() {
  const status = el('span', { class: 'mitteilung__status' });
  const knopf = button({ text: '…', variant: 'primary' });
  const meldung = el('p', { class: 'app__note app__note--warn' });
  const vorlauf = el('div', { class: 'mitteilung__vorlauf' });

  async function zeige() {
    const s = await pushStatus();
    status.textContent = TEXTE[s];
    knopf.hidden = s !== 'an' && s !== 'aus';
    knopf.textContent = s === 'an' ? 'Ausschalten' : 'Einschalten';
    knopf.dataset.an = String(s === 'an');
  }

  knopf.addEventListener('click', async () => {
    meldung.textContent = '';
    knopf.disabled = true;
    try {
      if (knopf.dataset.an === 'true') await pushAusschalten();
      else await pushEinschalten();
    } catch (err) {
      console.warn(err);
      meldung.textContent = err.message || 'Hat nicht geklappt.';
    }
    knopf.disabled = false;
    zeige();
  });

  getSetting('erinnerung_minuten', 15).then((min) => vorlauf.replaceChildren(
    el('span', { class: 'label', text: 'Termine vorher' }),
    chips({
      items: [5, 15, 30, 60].map((n) => ({ id: n, label: n === 60 ? '1 Std.' : `${n} Min.` })),
      active: Number(min),
      onChange: (n) => setSetting('erinnerung_minuten', n),
    }),
  ));
  zeige();

  return kachel({
    symbol: 'glocke',
    titel: 'Mitteilungen',
    text: 'Termine und Routinen mit Startzeit',
    gross: true,
    children: el('div', { class: 'mitteilung' }, [el('div', { class: 'mitteilung__zeile' }, [status, knopf]), vorlauf, meldung]),
  });
}
