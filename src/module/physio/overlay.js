// Mindmap-Overlay: Vollbild-Fläche im Glas-Look, die sich aus dem angetippten Knopf heraus öffnet
// (Kreis wächst vom Knopf aus) und beim Schließen wieder dorthin zurückschrumpft.
// Schließen: ✕, Esc, oder Zurück-Wischen/-Taste vor dem ersten Schritt (Verlauf: mm-verlauf.js).
// Inhalt (Suche, Fokus-Karte, Liste, Verlauf): mindmap-inhalt.js.
import { el } from '../../ui/dom.js';
import { symbol } from '../../ui/symbol.js';
import { on } from '../../core/events.js';
import { EINTRAEGE, LINKS, ladeEintraege, ladeLinks } from './daten.js';
import { mindmapInhalt } from './mindmap-inhalt.js';
import { BILDER, ladeBilder, titelbilder, bildUrl } from './bilder.js';

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let offen = null; // höchstens ein Overlay gleichzeitig

// ausKnopf = Element, aus dem sich das Overlay öffnet (Mittelpunkt der Animation).
// mitteId = gleich mit der Fokus-Karte dieses Punkts starten (statt mit der Suche); lernpfad = von dort als Lernpfad.
// art = mit der Liste dieser Art starten (aus Regionen heraus beginnt ein Lernpfad).
export function oeffneMindmap({ ausKnopf, signal, mitteId, lernpfad, ansicht, art } = {}) {
  if (offen) return;
  const ende = new AbortController(); // endet beim Schließen

  const leistenKnopf = (klasse, inhalt, label) =>
    el('button', { class: `mm__knopf ${klasse}`, attrs: { type: 'button', 'aria-label': label } }, inhalt);
  const zurueckKnopf = leistenKnopf('mm__zurueck', 'Suche');
  const sucheKnopf = leistenKnopf('mm__suchen', symbol('suche'), 'Suchen');
  const zu = leistenKnopf('mm__zu', '✕', 'Mindmap schließen');
  zu.addEventListener('click', () => schliessen());
  const inhalt = mindmapInhalt({ zurueckKnopf, sucheKnopf, mitteId, lernpfad, ansicht, art });

  const dialog = el('dialog', { class: 'mm', attrs: { 'aria-label': 'Mindmap' } }, [
    el('div', { class: 'mm__leiste' }, [
      zurueckKnopf,
      el('p', { class: 'marke mm__marke', text: 'Mindmap' }),
      el('div', { class: 'mm__rechts' }, [sucheKnopf, zu]),
    ]),
    inhalt.element,
  ]);

  async function laden() {
    const [eintraege, links, bilder] = await Promise.all([ladeEintraege(), ladeLinks(), ladeBilder()]);
    if (ende.signal.aborted) return;
    // kleine Ball-Bilder schon mal bereitlegen (aus dem Gerät, fehlende aus Supabase), damit nichts nachblitzt
    for (const b of titelbilder(bilder).values()) bildUrl(b, 'klein');
    inhalt.daten(eintraege, links, bilder);
  }

  on('daten', ({ table }) => {
    if (table === EINTRAEGE || table === LINKS || table === BILDER) laden();
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
      function done(e) {
        if (e && e.target !== dialog) return; // Animationen im Inhalt zählen nicht
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
    // Mit ✕/Esc geschlossen: alle eigenen Verlaufseinträge wieder verlassen.
    if (!ausVerlauf) inhalt.verlassen();
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
  // Zurück/Vor: Schritt innerhalb der Mindmap – oder raus, dann schließen.
  window.addEventListener('popstate', (e) => {
    if (!inhalt.popstate(e.state)) schliessen({ ausVerlauf: true });
  }, { signal: ende.signal });
  signal?.addEventListener('abort', () => schliessen(), { signal: ende.signal });

  offen = dialog;
  inhalt.start(); // erster eigener Verlaufseintrag (Suche)
  mittelpunkt();
  document.body.append(dialog);
  document.documentElement.classList.add('mm-offen'); // Seite dahinter nicht mitscrollen
  dialog.showModal();
  animiere('mm--auf');
  laden();
}
