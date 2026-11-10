// Verknüpfung bearbeiten (Kosmos: Nachbar lange drücken / Rechtsklick): Glas-Fläche „A – B“
// mit Notiz zur Verknüpfung (z. B. „häufigste Ursache“, steht klein auf dem Faden) und „Lösen“.
// Notiz speichert beim Verlassen des Felds und beim Schließen.
import { el } from '../../ui/dom.js';
import { oeffneFlaeche } from './glas-flaeche.js';
import { textfeld } from './textfeld.js';
import { loese, setzeLinkNotiz, linkNotiz } from './daten.js';

export function oeffneVerbindung({ a, b, links, ausBubble, signal }) {
  const notiz = textfeld({ label: 'Notiz zur Verknüpfung', wert: linkNotiz(links, a.id, b.id), platzhalter: 'z. B. häufigste Ursache', einzeilig: true });
  const loesen = el('button', { class: 'bereich__knopf', text: 'Verknüpfung lösen', attrs: { type: 'button' } });
  const f = oeffneFlaeche({
    name: 'Verknüpfung', ausBubble, signal,
    inhalt: [
      el('h2', { class: 'tief__titel', text: `${a.titel} – ${b.titel}` }),
      el('div', { class: 'notiz' }, [notiz, el('div', { class: 'bereich__knoepfe' }, loesen)]),
    ],
  });
  if (!f) return;
  let geloest = false;
  const merke = () => !geloest && setzeLinkNotiz(a.id, b.id, notiz.feld.value.trim());
  notiz.feld.addEventListener('change', merke);
  f.ende.addEventListener('abort', merke);
  loesen.addEventListener('click', async () => {
    if (!confirm(`Verknüpfung lösen?\n\n${a.titel} – ${b.titel}`)) return;
    geloest = true;
    await loese(a.id, b.id);
    f.schliessen();
  });
  requestAnimationFrame(() => notiz.feld.focus({ preventScroll: true }));
}
