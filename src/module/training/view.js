// Ansicht „Training“: drei Seiten im selben Bereich – Liste (Einheiten | Übungen), Einheit erfassen, Übung mit Verlauf.
// Unterseiten bekommen einen eigenen Verlaufseintrag (gleiche Adresse), damit Zurück/Wischen zur Liste führt.
// Zusatz '#/training/neu' legt gleich eine Einheit an.
import { el } from '../../ui/dom.js';
import { on } from '../../core/events.js';
import { zusatzNehmen } from '../../core/router.js';
import { TABELLEN, ladeAlles, neueEinheit } from './daten.js';
import { listeSeite } from './liste.js';
import { einheitSeite } from './einheit.js';
import { uebungSeite } from './uebung.js';

export function trainingAnsicht({ signal }) {
  const box = el('div', { class: 'training' });
  const stapel = [{ seite: 'liste' }];
  const merk = { tab: 'einheiten' };
  let stand = 0;
  let zuletzt = 0; // Tiefe beim letzten Zeichnen: nur bei Seitenwechsel nach oben scrollen
  let seitenEnde = null; // Aufräumen der offenen Unterseite (z. B. leere Einheit löschen)

  const oben = () => stapel[stapel.length - 1];

  function oeffne(seite, id) {
    stapel.push({ seite, id });
    history.pushState({ training: stapel.length }, '', location.hash);
    zeichne();
  }
  const zurueck = () => history.back();

  addEventListener('popstate', () => {
    if (stapel.length < 2) return;
    stapel.pop();
    zeichne();
  }, { signal });
  signal.addEventListener('abort', () => seitenEnde?.());

  async function neu() {
    const e = await neueEinheit();
    oeffne('einheit', e.id);
  }

  async function zeichne() {
    const nr = ++stand;
    const daten = await ladeAlles();
    if (nr !== stand || signal.aborted) return;
    const ende = seitenEnde;
    seitenEnde = null;
    await ende?.();
    const { seite, id } = oben();
    const hilfen = { oeffne, zurueck, neu, merk, daten };
    if (seite === 'einheit') {
      const s = einheitSeite(id, hilfen);
      seitenEnde = s.ende;
      box.replaceChildren(s.element);
    } else if (seite === 'uebung') box.replaceChildren(uebungSeite(id, hilfen));
    else box.replaceChildren(listeSeite(hilfen));
    if (zuletzt !== stapel.length) window.scrollTo(0, 0);
    zuletzt = stapel.length;
  }

  // Andere Geräte / eigene Änderungen: Liste und Übung neu zeichnen. Die Einheit zeichnet sich selbst.
  on('daten', ({ table }) => TABELLEN.includes(table) && oben().seite !== 'einheit' && zeichne(), { signal });

  if (zusatzNehmen() === 'neu') neu();
  else zeichne();
  return box;
}
