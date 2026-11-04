// Knopf. variant: 'normal' (Glas-Fläche), 'primary' (weiß, für die Hauptaktion) oder 'ghost' (ohne Hintergrund).
import { el } from './dom.js';

const KLASSEN = {
  normal: 'btn',
  primary: 'btn btn--primary',
  ghost: 'btn btn--ghost',
};

export function button({ text, variant = 'normal', type = 'button', disabled = false, onClick } = {}) {
  return el('button', {
    class: KLASSEN[variant] ?? KLASSEN.normal,
    text,
    attrs: { type, disabled },
    on: onClick ? { click: onClick } : {},
  });
}
