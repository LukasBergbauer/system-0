// Eingabefeld mit Beschriftung darüber.
import { el } from './dom.js';

let counter = 0;

export function input({ label, placeholder = '', value = '', type = 'text', onInput } = {}) {
  const id = `field-${++counter}`;
  const field = el('input', {
    class: 'field__input',
    attrs: { id, type, placeholder, autocomplete: 'off' },
    on: onInput ? { input: () => onInput(field.value) } : {},
  });
  field.value = value;

  return el('div', { class: 'field' }, [
    label && el('label', { class: 'field__label', text: label, attrs: { for: id } }),
    field,
  ]);
}
