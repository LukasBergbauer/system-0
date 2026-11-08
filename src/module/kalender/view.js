// Ansicht „Kalender“: Chips „Liste · Woche“, Schnelleingabe und Knopf „+ Termin“.
// Liste = „Nächste Termine“ in Gruppen (Heute · Morgen · Diese Woche · Später), Vergangenes ausgeblendet.
// Woche = Mo–So mit Pfeilen (woche.js).
// Zeichnet sich neu, sobald sich Termine ändern (auch durch das andere Gerät).
import { el } from '../../ui/dom.js';
import { list, listRow } from '../../ui/list.js';
import { button } from '../../ui/button.js';
import { on } from '../../core/events.js';
import { TERMINE, ladeTermine } from './daten.js';
import { gruppiere, tagText, zeitHM, letzterTag } from './zeit.js';
import { oeffneTermin } from './bearbeiten.js';
import { schnelleingabe } from './schnelleingabe.js';
import { wocheAnsicht, montag } from './woche.js';
import { chips } from '../../ui/chips.js';
import { GOOGLE, googleTermine, holeGoogle } from './google.js';
import { oeffneGoogleAdresse } from './google-adresse.js';

// Unterzeile: Datum (nicht bei Heute/Morgen), Ende, Ort
function unterText(t, gruppe) {
  const start = new Date(t.start);
  const bis = letzterTag(t);
  const mehrtaegig = tagText(start) !== tagText(bis);
  const teile = [];
  if (gruppe === 'woche' || gruppe === 'spaeter') teile.push(tagText(start));
  if (mehrtaegig) teile.push(`bis ${tagText(bis)}${t.ganztaegig ? '' : `, ${zeitHM(bis)}`}`);
  else if (!t.ganztaegig) teile.push(`bis ${zeitHM(bis)}`);
  if (t.ort) teile.push(t.ort);
  return teile.join(' · ');
}

// Google-Termine: gedämpft und nicht antippbar (nur lesen)
function zeile(t, gruppe) {
  const z = listRow({
    title: t.titel,
    sub: unterText(t, gruppe),
    start: el('span', { class: `termin-zeit${t.ganztaegig ? ' termin-zeit--ganz' : ''}`, text: t.ganztaegig ? 'ganztägig' : zeitHM(new Date(t.start)) }),
    onClick: t.google ? null : () => oeffneTermin(t),
  });
  if (t.google) z.classList.add('termin--google');
  return z;
}

const MERKER = 'system0-kalender-ansicht'; // nur auf diesem Gerät gemerkt, wie bei den To-dos

function gemerkt() {
  try {
    return localStorage.getItem(MERKER) === 'woche' ? 'woche' : 'liste';
  } catch {
    return 'liste';
  }
}

function merke(wert) {
  try {
    localStorage.setItem(MERKER, wert);
  } catch {
    // Speichern nicht möglich (z. B. privater Modus): dann eben die Liste beim nächsten Mal.
  }
}

function liste(termine) {
  const gruppen = gruppiere(termine);
  if (!gruppen.length) return [el('p', { class: 'app__note', text: 'Keine Termine. Freie Zeit.' })];
  return gruppen.map((g) => el('section', { class: 'termin-gruppe' }, [
    el('h2', { class: 'termin-gruppe__titel label', text: `${g.titel} · ${g.termine.length}` }),
    list(g.termine.map((t) => zeile(t, g.id))),
  ]));
}

export function kalenderAnsicht({ signal }) {
  const inhalt = el('div', { class: 'termin-liste' });
  let ansicht = gemerkt();
  let wochenStart = montag(new Date());
  let stand = 0; // nur das Ergebnis des neuesten Zeichnens zählt

  async function zeichne() {
    const nr = ++stand;
    const termine = (await Promise.all([ladeTermine(), googleTermine()])).flat();
    if (nr !== stand || signal.aborted) return;
    inhalt.replaceChildren(...(ansicht === 'liste'
      ? liste(termine)
      : [wocheAnsicht({
        termine,
        start: wochenStart,
        zeile: (t) => zeile(t, 'heute'),
        onWechsel: (start) => { wochenStart = start; zeichne(); },
      })]));
  }

  on('daten', ({ table }) => {
    if (table === TERMINE || table === GOOGLE) zeichne();
  }, { signal });
  // Auch ohne neue Daten: wenn die App wieder sichtbar wird und jede Minute (Mitternacht, Termin vorbei)
  const auffrischen = () => { zeichne(); holeGoogle(); }; // Google höchstens alle 15 Min. (google.js)
  document.addEventListener('visibilitychange', () => document.hidden || auffrischen(), { signal });
  const takt = setInterval(auffrischen, 60 * 1000);
  signal.addEventListener('abort', () => clearInterval(takt));
  auffrischen();

  const umschalter = chips({
    items: [{ id: 'liste', label: 'Liste' }, { id: 'woche', label: 'Woche' }],
    active: ansicht,
    onChange: (id) => { ansicht = id; merke(id); zeichne(); },
    aktionen: [{ label: 'Google', onClick: oeffneGoogleAdresse }],
  });

  return el('div', { class: 'app__stack' }, [
    umschalter,
    el('div', { class: 'termin-kopf' }, [
      schnelleingabe(),
      button({ text: '+ Termin', variant: 'primary', onClick: () => oeffneTermin() }),
    ]),
    inhalt,
  ]);
}
