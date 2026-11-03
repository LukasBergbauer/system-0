// Liste: Zeilen mit Trennlinien.
// start/end = beliebige Elemente links/rechts (z. B. Checkbox, Zahl, Pfeil).
import { el } from './dom.js';

export function list(rows = []) {
  return el('ul', { class: 'list' }, rows);
}

export function listRow({ title, sub, start, end, onClick } = {}) {
  const text = el('div', { class: 'list__text' }, [
    el('span', { class: 'list__title', text: title }),
    sub && el('span', { class: 'list__sub', text: sub }),
  ]);
  const content = [
    start && el('span', { class: 'list__start' }, start),
    text,
    end && el('span', { class: 'list__end' }, end),
  ];

  // Antippbare Zeile = echter Knopf, damit Tastatur und VoiceOver funktionieren.
  const inner = onClick
    ? el('button', { class: 'list__inner list__inner--tap', attrs: { type: 'button' }, on: { click: onClick } }, content)
    : el('div', { class: 'list__inner' }, content);

  return el('li', { class: 'list__row' }, inner);
}

// Zeile mit freiem Inhalt, z. B. eine Checkbox mit Beschriftung (ganze Zeile antippbar).
export function listItem(content) {
  return el('li', { class: 'list__row list__row--free' }, content);
}
