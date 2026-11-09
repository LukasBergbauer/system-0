// Kachel „Wiederherstellen“: Export-Datei wählen → Vorschau (Anzahl je Tabelle) → bestätigen → einspielen.
import { el } from '../ui/dom.js';
import { kachel } from '../ui/kachel.js';
import { modal } from '../ui/modal.js';
import { button } from '../ui/button.js';
import { exportLesen, einspielen } from '../core/wiederherstellen.js';

const name = (t) => t.replace(/_/g, ' ').replace(/ae/g, 'ä').replace(/oe/g, 'ö').replace(/ue/g, 'ü');

function vorschau({ tabellen, anzahl, exportiert_am }) {
  const summe = Object.values(anzahl).reduce((a, b) => a + b, 0);
  const datum = exportiert_am ? new Date(exportiert_am).toLocaleString('de-DE', { dateStyle: 'long', timeStyle: 'short' }) : '–';
  const meldung = el('p', { class: 'app__note app__note--warn', attrs: { role: 'alert' } });
  const zellen = Object.entries(anzahl)
    .sort((a, b) => b[1] - a[1])
    .map(([t, n]) => el('div', { class: 'wh__zelle' }, [el('b', { text: n }), el('span', { text: name(t) })]));
  const ok = button({ text: `${summe} ${summe === 1 ? "Eintrag" : "Einträge"} einspielen`, variant: 'primary' });
  const m = modal({
    title: 'Wiederherstellen',
    content: [
      el('div', { class: 'wh__kopf' }, [
        el('span', { class: 'wh__summe', text: summe }),
        el('span', { class: 'wh__info', text: `Einträge aus dem Export vom ${datum}. Nichts wird gelöscht, gleiche Einträge werden überschrieben.` }),
      ]),
      el('div', { class: 'wh__raster' }, zellen),
      meldung,
    ],
    actions: [button({ text: 'Abbrechen', variant: 'ghost', onClick: () => m.close() }), ok],
  });
  ok.addEventListener('click', async () => {
    ok.disabled = true;
    ok.textContent = 'Wird eingespielt …';
    try {
      await einspielen(tabellen);
      ok.textContent = 'Fertig ✓';
      setTimeout(() => m.close(), 700);
    } catch (err) {
      console.warn(err);
      meldung.textContent = 'Einspielen hat nicht geklappt. Bitte nochmal versuchen.';
      ok.disabled = false;
      ok.textContent = 'Nochmal versuchen';
    }
  });
  m.element.classList.add('wh');
  m.open();
}

export function wiederherstellenKachel() {
  const datei = el('input', { attrs: { type: 'file', accept: '.json,application/json', hidden: true } });
  datei.addEventListener('change', async () => {
    const file = datei.files[0];
    datei.value = '';
    if (!file) return;
    try {
      vorschau(await exportLesen(file));
    } catch (err) {
      alert(err.message);
    }
  });
  const k = kachel({
    symbol: 'wiederherstellen',
    titel: 'Wiederherstellen',
    wert: 'Einspielen',
    text: 'Aus Export-Datei',
    onClick: () => datei.click(),
  });
  k.append(datei);
  return k;
}
