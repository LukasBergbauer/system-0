// Ansicht „Kalender“: Chips „Liste · Woche · Monat“, Schnelleingabe und Knopf „+ Termin“.
// Fällige To-dos stehen mit drin (gedämpft, antippen = in To-dos öffnen).
// Liste = „Nächste Termine“ in Gruppen (Heute · Morgen · Diese Woche · Später), Vergangenes ausgeblendet.
// Woche = Mo–So mit Pfeilen (woche.js), Monat = Raster + Tagesliste (monat.js).
// Zeichnet sich neu, sobald sich Termine ändern (auch durch das andere Gerät).
import { el } from '../../ui/dom.js';
import { list, listRow } from '../../ui/list.js';
import { button } from '../../ui/button.js';
import { on } from '../../core/events.js';
import { zusatzNehmen } from '../../core/router.js';
import { TERMINE, ladeTermine, faelligeTodos } from './daten.js';
import { monatAnsicht, monatsErster } from './monat.js';
import { go } from '../../core/router.js';
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
  if (t.wiederholung) teile.push('↻');
  if (t.todo) teile.push('To-do');
  return teile.join(' · ');
}

// Google-Termine: gedämpft und nicht antippbar (nur lesen)
function zeile(t, gruppe) {
  const z = listRow({
    title: t.titel,
    sub: unterText(t, gruppe),
    start: el('span', { class: `termin-zeit${t.ganztaegig ? ' termin-zeit--ganz' : ''}`, text: t.todo ? '○' : t.ganztaegig ? 'ganztägig' : zeitHM(new Date(t.start)) }),
    onClick: t.google ? null : t.todo ? () => go(`todos/${t.id}`) : () => oeffneTermin(t.serie || t),
  });
  if (t.google) z.classList.add('termin--google');
  if (t.todo) z.classList.add('termin--todo');
  return z;
}

const MERKER = 'system0-kalender-ansicht'; // nur auf diesem Gerät gemerkt, wie bei den To-dos

function gemerkt() {
  try {
    const wert = localStorage.getItem(MERKER);
    return wert === 'woche' || wert === 'monat' ? wert : 'liste';
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
  // Zusatz von außen (z. B. Heute): 'woche' = Wochenansicht zeigen, 'neu' = gleich einen Termin anlegen,
  // sonst die id eines Termins (Suche): eigener Termin → bearbeiten, Google-Termin → seine Woche zeigen
  let zusatz = zusatzNehmen();
  if (zusatz === 'woche') ansicht = 'woche';
  if (zusatz === 'neu') requestAnimationFrame(() => oeffneTermin());
  if (zusatz === 'woche' || zusatz === 'neu') zusatz = null;
  let wochenStart = montag(new Date());
  let monatStart = monatsErster(new Date());
  let monatTag = null;
  let stand = 0; // nur das Ergebnis des neuesten Zeichnens zählt

  async function zeichne() {
    const nr = ++stand;
    const termine = (await Promise.all([ladeTermine(), googleTermine(), faelligeTodos()])).flat();
    if (nr !== stand || signal.aborted) return;
    const gesucht = zusatz && termine.find((t) => t.id === zusatz);
    zusatz = null;
    if (gesucht?.google) { ansicht = 'woche'; wochenStart = montag(new Date(gesucht.start)); }
    else if (gesucht) oeffneTermin(gesucht);
    inhalt.replaceChildren(...(ansicht === 'liste'
      ? liste(termine)
      : ansicht === 'monat' ? [monatAnsicht({
        termine,
        start: monatStart,
        tag: monatTag,
        zeile: (t) => zeile(t, 'heute'),
        onTag: (d) => { monatTag = d; },
        onWechsel: (start) => { monatStart = start; monatTag = null; zeichne(); },
      })]
      : [wocheAnsicht({
        termine,
        start: wochenStart,
        zeile: (t) => zeile(t, 'heute'),
        onWechsel: (start) => { wochenStart = start; zeichne(); },
      })]));
  }

  on('daten', ({ table }) => {
    if (table === TERMINE || table === GOOGLE || table === 'todos') zeichne();
  }, { signal });
  // Auch ohne neue Daten: wenn die App wieder sichtbar wird und jede Minute (Mitternacht, Termin vorbei)
  const auffrischen = () => { zeichne(); holeGoogle(); }; // Google höchstens alle 15 Min. (google.js)
  document.addEventListener('visibilitychange', () => document.hidden || auffrischen(), { signal });
  const takt = setInterval(auffrischen, 60 * 1000);
  signal.addEventListener('abort', () => clearInterval(takt));
  auffrischen();

  const umschalter = chips({
    items: [{ id: 'liste', label: 'Liste' }, { id: 'woche', label: 'Woche' }, { id: 'monat', label: 'Monat' }],
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
