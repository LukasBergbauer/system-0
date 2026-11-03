// Karte: Fläche mit dünnem Rahmen, optional mit Überschrift.
import { el } from './dom.js';

export function card({ title, children = [] } = {}) {
  return el('section', { class: 'card' }, [
    title && el('h2', { class: 'card__title', text: title }),
    children,
  ]);
}
