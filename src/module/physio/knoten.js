// Ein Punkt der Mindmap: Knopf mit Art (kleines Label), Titel und – nur Mac, beim Hovern –
// der Kurzbeschreibung darunter. Dasselbe Element bleibt erhalten, wenn der Punkt
// vom Nachbarn zur Mitte wird (so kann er sichtbar dorthin gleiten).
import { el } from '../../ui/dom.js';
import { art } from './arten.js';

export function knoten(id, onClick) {
  const knopf = el('button', {
    class: 'mm-knoten',
    attrs: { type: 'button' },
    on: { click: () => onClick(id) },
  }, [
    el('span', { class: 'mm-knoten__art label' }),
    el('span', { class: 'mm-knoten__titel' }),
    el('span', { class: 'mm-knoten__kurz', attrs: { 'aria-hidden': 'true' } }),
  ]);
  knopf.dataset.id = id;
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
