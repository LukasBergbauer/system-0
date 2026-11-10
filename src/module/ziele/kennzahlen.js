// Kennzahlen für den Seitenkopf (shell.js): offene und erreichte Ziele.
import { getAll } from '../../core/store.js';

export async function kennzahlen() {
  const ziele = await getAll('lebensziele');
  const erreicht = ziele.filter((z) => z.status === 'erreicht').length;
  return [{ zahl: ziele.length - erreicht, text: 'Ziele offen' }, { zahl: erreicht, text: 'erreicht' }];
}
