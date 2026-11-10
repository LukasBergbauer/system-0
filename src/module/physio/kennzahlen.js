// Kennzahlen für den Seitenkopf (shell.js): Anzahl Einträge.
import { getAll } from '../../core/store.js';

export async function kennzahlen() {
  return [{ zahl: (await getAll('physio_eintraege')).length, text: 'Einträge' }];
}
