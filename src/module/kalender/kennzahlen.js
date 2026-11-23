// Kennzahlen für den Seitenkopf (shell.js): Termine heute und in den nächsten 7 Tagen.
import { getAll } from '../../core/store.js';

export async function kennzahlen() {
  const tag = (d) => new Date(d).toLocaleDateString('sv');
  const heute = tag(Date.now()), bis = tag(Date.now() + 7 * 864e5);
  const termine = (await getAll('termine')).map((t) => tag(t.start));
  return [{ zahl: termine.filter((t) => t === heute).length, text: 'heute' }, { zahl: termine.filter((t) => t >= heute && t < bis).length, text: '7 Tage' }];
}
