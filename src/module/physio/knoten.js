// Ein Punkt der Mindmap: Knopf mit Art (kleines Label), Titel und – nur Mac, beim Hovern –
// der Kurzbeschreibung darunter. Dasselbe Element bleibt erhalten, wenn der Punkt
// vom Nachbarn zur Mitte wird (so kann er sichtbar dorthin gleiten).
// Lange drücken (iPhone) oder Rechtsklick (Mac) → onLang(id), z. B. Verknüpfung lösen.
// Mit Titelbild wird der Punkt ein runder Ball (Foto schwarz-weiß, Titel darunter), Klasse mm-knoten--ball.
// Aufbau: Knopf (Platz, gleitet) > Blase (Glas, schwebt eigenständig) > Inhalt. Größe je Punkt leicht anders (--v).
import { el } from '../../ui/dom.js';
import { art } from './arten.js';
import { bildUrl } from './bilder.js';
import { schwebeTakt } from './schweben.js';

// fester Zahlenwert je id (gleicher Punkt = gleicher Takt und gleiche Größe)
const zahl = (id) => [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const teile = (knopf) => knopf.firstChild.children;

const LANG_MS = 550;

// Langes Drücken erkennen; der Klick danach zählt dann nicht als normales Antippen.
function langDruecken(knopf, ausloesen) {
  let timer = null;
  let start = null;
  let gerade = false;
  const stopp = () => { clearTimeout(timer); timer = null; };
  knopf.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    start = { x: e.clientX, y: e.clientY };
    stopp();
    timer = setTimeout(() => { gerade = true; ausloesen(); }, LANG_MS);
  });
  knopf.addEventListener('pointermove', (e) => {
    if (timer && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 10) stopp();
  });
  for (const typ of ['pointerup', 'pointercancel', 'pointerleave']) knopf.addEventListener(typ, stopp);
  knopf.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    stopp();
    if (!gerade) ausloesen(); // Rechtsklick am Mac (beim langen Drücken ist es schon passiert)
  });
  // true = dieser Klick gehört zum langen Drücken und wird geschluckt
  return () => {
    const war = gerade;
    gerade = false;
    return war;
  };
}

export function knoten(id, onClick, onLang) {
  const knopf = el('button', { class: 'mm-knoten', attrs: { type: 'button' } }, el('span', { class: 'mm-knoten__blase' }, [
    el('span', { class: 'mm-knoten__art label' }),
    el('span', { class: 'mm-knoten__titel' }),
    el('span', { class: 'mm-knoten__kurz', attrs: { 'aria-hidden': 'true' } }),
    el('span', { class: 'mm-knoten__foto', attrs: { 'aria-hidden': 'true' } }, el('img', { attrs: { alt: '', decoding: 'async' } })),
  ]));
  knopf.dataset.id = id;
  const n = zahl(id);
  schwebeTakt(knopf.style, n % 97);
  knopf.style.setProperty('--v', (0.88 + (n % 23) / 100).toFixed(2));
  const warLang = langDruecken(knopf, () => onLang?.(id));
  knopf.addEventListener('click', () => {
    if (!warLang()) onClick(id);
  });
  return knopf;
}

// Foto des Balls setzen (bild = Titelbild oder nichts). Lädt nur neu, wenn sich das Bild geändert hat.
function setzeFoto(knopf, bild) {
  const img = knopf.querySelector('.mm-knoten__foto img');
  const id = bild?.id ?? '';
  knopf.classList.toggle('mm-knoten--ball', Boolean(bild));
  if (knopf.dataset.bildId === id && (img.src || !bild)) return;
  knopf.dataset.bildId = id;
  img.classList.remove('ist-da');
  img.removeAttribute('src');
  if (!bild) return;
  img.onload = () => img.classList.add('ist-da');
  bildUrl(bild, 'klein').then((url) => {
    if (url && knopf.dataset.bildId === id) img.src = url; // fehlt es (offline), bleibt der graue Ball
  });
}

// Text, Art und Foto auf den aktuellen Stand bringen (Titel kann sich auf dem anderen Gerät ändern).
export function fuelleKnoten(knopf, eintrag, bild = null) {
  setzeFoto(knopf, bild);
  const [label, titel, kurz] = teile(knopf);
  const name = art(eintrag.art).name;
  knopf.dataset.art = eintrag.art;
  // lange Titel bekommen in der Mitte eine kleinere Schrift (sonst nur Silbenreste)
  knopf.classList.toggle('mm-knoten--lang', eintrag.titel.length > 14);
  label.textContent = name;
  titel.textContent = eintrag.titel;
  kurz.textContent = eintrag.kurz || '';
  knopf.setAttribute('aria-label', `${eintrag.titel} (${name})`);
}

// Platzhalter „+N weitere“, wenn nicht alle Nachbarn auf die Karte passen.
export function fuelleMehr(knopf, anzahl) {
  const [label, titel, kurz] = teile(knopf);
  knopf.dataset.art = 'mehr';
  knopf.classList.remove('mm-knoten--lang');
  setzeFoto(knopf, null);
  label.textContent = 'Weitere';
  titel.textContent = `+${anzahl}`;
  kurz.textContent = '';
  knopf.setAttribute('aria-label', `${anzahl} weitere Verknüpfungen anzeigen`);
}
