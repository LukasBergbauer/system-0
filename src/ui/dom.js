// Kleine Hilfe zum Bauen von Elementen.
// el('p', { class: 'x', text: 'Hallo', on: { click: fn }, attrs: { role: 'tab' } }, [kind1, kind2])

export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  if (props.class) node.className = props.class;
  if (props.text != null) node.textContent = props.text;
  for (const [name, value] of Object.entries(props.attrs || {})) {
    if (value === false || value == null) continue;
    node.setAttribute(name, value === true ? '' : value);
  }
  for (const [type, handler] of Object.entries(props.on || {})) {
    node.addEventListener(type, handler);
  }
  append(node, children);
  return node;
}

// Hängt Kinder an: Elemente, Texte oder Listen davon. Leere Werte werden übersprungen.
export function append(parent, children) {
  for (const child of [children].flat(Infinity)) {
    if (child == null || child === false) continue;
    parent.append(child instanceof Node ? child : String(child));
  }
  return parent;
}
