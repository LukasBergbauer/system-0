// Ansicht „Training“: drei Seiten im selben Bereich – Liste (Einheiten | Übungen), Einheit erfassen, Übung mit Verlauf.
// Unterseiten bekommen einen eigenen Verlaufseintrag (gleiche Adresse), damit Zurück/Wischen zur Liste führt.
// Zusatz '#/training/neu' legt gleich eine Einheit an, '#/training/plan:<id>' startet die Plan-Einheit (oder öffnet sie).
import { el } from '../../ui/dom.js';
import { on } from '../../core/events.js';
import { zusatzNehmen } from '../../core/router.js';
import { TABELLEN, ladeAlles, neueEinheit } from './daten.js';
import { listeSeite } from './liste.js';
import { einheitSeite } from './einheit.js';
import { uebungSeite } from './uebung.js';
import { planSeite } from './plan.js';
import { planEinheitSeite } from './plan-einheit.js';
import { starte as starteAusPlan } from './plan-daten.js';

const SELBST = ['einheit', 'plan-einheit']; // zeichnen sich selbst (Fokus in Feldern bleibt)

export function trainingAnsicht({ signal }) {
  const box = el('div', { class: 'training' });
  const stapel = [{ seite: 'liste' }];
  const merk = { tab: 'einheiten' };
  let stand = 0;
  let zuletzt = 0; // Tiefe beim letzten Zeichnen: nur bei Seitenwechsel nach oben scrollen
  let seitenEnde = null; // Aufräumen der offenen Unterseite (z. B. leere Einheit löschen)

  const oben = () => stapel[stapel.length - 1];

  function oeffne(seite, id, durchlauf = false) {
    stapel.push({ seite, id, durchlauf });
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
  async function starte(pe) {
    const e = await starteAusPlan(pe, (await ladeAlles()).einheiten);
    oeffne('einheit', e.id, true);
  }

  async function zeichne() {
    const nr = ++stand;
    const daten = await ladeAlles();
    if (nr !== stand || signal.aborted) return;
    const ende = seitenEnde;
    seitenEnde = null;
    await ende?.();
    const { seite, id, durchlauf } = oben();
    oben().durchlauf = false; // nur einmal von selbst starten
    const hilfen = { oeffne, zurueck, neu, starte, merk, daten, signal, durchlauf, neuZeichnen: zeichne };
    if (SELBST.includes(seite)) {
      const s = (seite === 'einheit' ? einheitSeite : planEinheitSeite)(id, hilfen);
      seitenEnde = s.ende;
      box.replaceChildren(s.element);
    } else if (seite === 'uebung') box.replaceChildren(uebungSeite(id, hilfen));
    else if (seite === 'plan') box.replaceChildren(planSeite(id, hilfen));
    else box.replaceChildren(listeSeite(hilfen));
    if (zuletzt !== stapel.length) window.scrollTo(0, 0);
    zuletzt = stapel.length;
  }

  // Andere Geräte / eigene Änderungen: Liste, Plan und Übung neu zeichnen.
  on('daten', ({ table }) => TABELLEN.includes(table) && !SELBST.includes(oben().seite) && zeichne(), { signal });

  const zusatz = zusatzNehmen();
  const planId = zusatz?.startsWith('plan:') && zusatz.slice(5);
  if (zusatz === 'neu') neu();
  else if (planId) ladeAlles().then((d) => {
    const pe = d.planEinheiten.find((x) => x.id === planId);
    pe ? starte(pe) : zeichne();
  });
  else zeichne();
  return box;
}
