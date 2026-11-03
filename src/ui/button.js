// Knopf. variant: 'normal' (mit Fläche) oder 'ghost' (ohne Hintergrund).
import { el } from './dom.js';

export function button({ text, variant = 'normal', type = 'button', disabled = false, onClick } = {}) {
  const cls = variant === 'ghost' ? 'btn btn--ghost' : 'btn';
  return el('button', {
    class: cls,
    text,
    attrs: { type, disabled },
    on: onClick ? { click: onClick } : {},
  });
}
