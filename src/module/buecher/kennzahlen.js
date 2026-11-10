// Kennzahlen für den Seitenkopf (shell.js): gerade gelesen und dieses Jahr beendet.
import { getAll } from '../../core/store.js';

export async function kennzahlen() {
  const buecher = await getAll('buecher');
  const jahr = String(new Date().getFullYear());
  return [{ zahl: buecher.filter((b) => b.status === 'lese').length, text: 'lese gerade' },
    { zahl: buecher.filter((b) => b.status === 'gelesen' && b.beendet?.startsWith(jahr)).length, text: `gelesen ${jahr}` }];
}
