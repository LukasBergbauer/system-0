// Kennzahlen für den Seitenkopf (shell.js): aktive Sätze.
import { getAll } from '../../core/store.js';

export async function kennzahlen() {
  return [{ zahl: (await getAll('affirmationen')).filter((a) => a.aktiv !== false).length, text: 'Sätze aktiv' }];
}
