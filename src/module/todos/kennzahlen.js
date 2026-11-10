// Kennzahlen für den Seitenkopf (shell.js): offene und heute fällige To-dos.
import { getAll } from '../../core/store.js';

export async function kennzahlen() {
  const heute = new Date().toLocaleDateString('sv');
  const offen = (await getAll('todos')).filter((t) => !t.erledigt_am);
  return [{ zahl: offen.length, text: 'offen' }, { zahl: offen.filter((t) => t.faellig_am && t.faellig_am <= heute).length, text: 'fällig' }];
}
