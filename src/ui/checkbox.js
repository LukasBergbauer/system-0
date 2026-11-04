// Checkbox: runder Kreis, beim Abhaken füllt sich der Kreis weiß mit Haken (kurze Animation).
// Darunter steckt eine echte <input type="checkbox"> (Tastatur, VoiceOver).
import { el } from './dom.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

function checkmark() {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('check__mark');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', 'M6.5 12.5l3.5 3.5 7.5-8');
  path.setAttribute('pathLength', '1');
  svg.append(path);
  return svg;
}

export function checkbox({ label, checked = false, onChange } = {}) {
  const input = el('input', {
    class: 'check__input',
    attrs: { type: 'checkbox', checked },
    on: { change: () => onChange && onChange(input.checked) },
  });
  const box = el('span', { class: 'check__box' }, checkmark());

  return el('label', { class: 'check' }, [
    input,
    box,
    label && el('span', { class: 'check__label', text: label }),
  ]);
}
