// Ein Punkt der Mindmap: Knopf mit Art (kleines Label), Titel und – nur Mac, beim Hovern –
// der Kurzbeschreibung darunter. Dasselbe Element bleibt erhalten, wenn der Punkt
// vom Nachbarn zur Mitte wird (so kann er sichtbar dorthin gleiten).
// Lange drücken (iPhone) oder Rechtsklick (Mac) → onLang(id), z. B. Verknüpfung lösen.
import { el } from '../../ui/dom.js';
import { art } from './arten.js';

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
  const knopf = el('button', { class: 'mm-knoten', attrs: { type: 'button' } }, [
    el('span', { class: 'mm-knoten__art label' }),
    el('span', { class: 'mm-knoten__titel' }),
    el('span', { class: 'mm-knoten__kurz', attrs: { 'aria-hidden': 'true' } }),
  ]);
  knopf.dataset.id = id;
  const warLang = langDruecken(knopf, () => onLang?.(id));
  knopf.addEventListener('click', () => {
    if (!warLang()) onClick(id);
  });
  return knopf;
}

// Text und Art auf den aktuellen Stand bringen (Titel kann sich auf dem anderen Gerät ändern).
export function fuelleKnoten(knopf, eintrag) {
  const [label, titel, kurz] = knopf.children;
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
  const [label, titel, kurz] = knopf.children;
  knopf.dataset.art = 'mehr';
  knopf.classList.remove('mm-knoten--lang');
  label.textContent = 'Weitere';
  titel.textContent = `+${anzahl}`;
  kurz.textContent = '';
  knopf.setAttribute('aria-label', `${anzahl} weitere Verknüpfungen anzeigen`);
}
