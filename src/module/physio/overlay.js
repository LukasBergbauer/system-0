// Mindmap-Overlay: helle Vollbild-Fläche, die sich aus dem angetippten Knopf heraus öffnet
// (Kreis wächst vom Knopf aus) und beim Schließen wieder dorthin zurückschrumpft.
// Schließen: ✕, Esc, Zurück-Knopf/-Wischen (eigener Verlaufseintrag, Adresse bleibt gleich).
// Inhalt (Suche, Fokus-Karte, Liste, Verlauf): mindmap-inhalt.js.
import { el } from '../../ui/dom.js';
import { symbol } from '../../ui/symbol.js';
import { on } from '../../core/events.js';
import { EINTRAEGE, LINKS, ladeEintraege, ladeLinks } from './daten.js';
import { mindmapInhalt } from './mindmap-inhalt.js';

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const MARKE = 'physio-mindmap'; // Kennzeichen unseres Verlaufseintrags

let offen = null; // höchstens ein Overlay gleichzeitig

// ausKnopf = Element, aus dem sich das Overlay öffnet (Mittelpunkt der Animation).
export function oeffneMindmap({ ausKnopf, signal } = {}) {
  if (offen) return;
  const ende = new AbortController(); // endet beim Schließen

  const leistenKnopf = (klasse, inhalt, label) =>
    el('button', { class: `mm__knopf ${klasse}`, attrs: { type: 'button', 'aria-label': label } }, inhalt);
  const zurueckKnopf = leistenKnopf('mm__zurueck', 'Suche');
  const sucheKnopf = leistenKnopf('mm__suchen', symbol('suche'), 'Suchen');
  const zu = leistenKnopf('mm__zu', '✕', 'Mindmap schließen');
  zu.addEventListener('click', () => schliessen());
  const inhalt = mindmapInhalt({ zurueckKnopf, sucheKnopf });

  const dialog = el('dialog', { class: 'mm hell', attrs: { 'aria-label': 'Mindmap' } }, [
    el('div', { class: 'mm__leiste' }, [
      zurueckKnopf,
      el('p', { class: 'marke mm__marke', text: 'Mindmap' }),
      el('div', { class: 'mm__rechts' }, [sucheKnopf, zu]),
    ]),
    inhalt.element,
  ]);

  async function laden() {
    const [eintraege, links] = await Promise.all([ladeEintraege(), ladeLinks()]);
    if (!ende.signal.aborted) inhalt.daten(eintraege, links);
  }

  on('daten', ({ table }) => {
    if (table === EINTRAEGE || table === LINKS) laden();
  }, { signal: ende.signal });

  // ---------- Öffnen und Schließen ----------
  // Die Seite dahinter zeichnet sich bei Änderungen neu; dann gilt die neue Kachel (data-mm-start).
  const knopf = () => (ausKnopf?.isConnected ? ausKnopf : document.querySelector('[data-mm-start]'));

  function mittelpunkt() {
    const r = knopf()?.getBoundingClientRect();
    const x = r ? r.left + r.width / 2 : innerWidth / 2;
    const y = r ? r.top + r.height / 2 : innerHeight / 2;
    dialog.style.setProperty('--mm-x', `${x}px`);
    dialog.style.setProperty('--mm-y', `${y}px`);
  }

  function animiere(klasse) {
    return new Promise((fertig) => {
      if (reduceMotion()) return fertig();
      dialog.classList.add(klasse);
      const timer = setTimeout(done, 900); // Sicherheitsnetz
      dialog.addEventListener('animationend', done);
      function done() {
        clearTimeout(timer);
        dialog.removeEventListener('animationend', done);
        dialog.classList.remove(klasse);
        fertig();
      }
    });
  }

  let schliesst = false;
  async function schliessen({ ausVerlauf = false } = {}) {
    if (schliesst) return;
    schliesst = true;
    ende.abort();
    // Mit ✕/Esc geschlossen: unseren Verlaufseintrag wieder entfernen.
    if (!ausVerlauf && history.state?.[MARKE] === eintragId) history.back();
    mittelpunkt(); // Knopf könnte inzwischen woanders stehen
    await animiere('mm--zu');
    dialog.close();
    dialog.remove();
    document.documentElement.classList.remove('mm-offen');
    offen = null;
    knopf()?.focus?.({ preventScroll: true });
  }

  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    schliessen();
  });
  window.addEventListener('popstate', () => schliessen({ ausVerlauf: true }), { signal: ende.signal });
  signal?.addEventListener('abort', () => schliessen(), { signal: ende.signal });

  offen = dialog;
  const eintragId = Date.now(); // eigener Verlaufseintrag; alte (z. B. nach Neuladen) zählen nicht
  history.pushState({ ...history.state, [MARKE]: eintragId }, '');
  mittelpunkt();
  document.body.append(dialog);
  document.documentElement.classList.add('mm-offen'); // Seite dahinter nicht mitscrollen
  dialog.showModal();
  animiere('mm--auf');
  laden();
}
