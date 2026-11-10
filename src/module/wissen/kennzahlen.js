// Kennzahlen für den Seitenkopf (shell.js): Fragen und Trefferquote der letzten 30 Tage.
import { getAll } from '../../core/store.js';

export async function kennzahlen() {
  const ab = new Date(Date.now() - 30 * 864e5).toLocaleDateString('sv');
  const [fragen, runden] = await Promise.all([getAll('quiz_fragen'), getAll('quiz_ergebnisse')]);
  const r = runden.filter((e) => e.tag >= ab).reduce((s, e) => [s[0] + e.richtig, s[1] + e.gesamt], [0, 0]);
  return [{ zahl: fragen.length, text: 'Fragen' }, { zahl: r[1] ? `${Math.round((100 * r[0]) / r[1])} %` : '–', text: 'richtig (30 T.)' }];
}
