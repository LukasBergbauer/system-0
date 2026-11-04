// Module benachrichtigen sich gegenseitig, ohne sich zu kennen.
// emit('daten', { table: 'todos' });  on('daten', (detail) => …)
const bus = new EventTarget();

export function emit(name, detail) {
  bus.dispatchEvent(new CustomEvent(name, { detail }));
}

// Gibt eine Funktion zurück, die das Zuhören wieder beendet.
// Mit { signal } endet das Zuhören automatisch, z. B. wenn eine Ansicht verlassen wird.
export function on(name, handler, { signal } = {}) {
  const listener = (e) => handler(e.detail);
  bus.addEventListener(name, listener, { signal });
  return () => bus.removeEventListener(name, listener);
}
