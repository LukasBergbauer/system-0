// Kennzahlen für den Seitenkopf (shell.js): Einheiten und Minuten seit Montag.
import { getAll } from '../../core/store.js';

export async function kennzahlen() {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  const woche = (await getAll('einheiten')).filter((e) => e.datum >= d.toLocaleDateString('sv'));
  return [{ zahl: woche.length, text: 'Einheiten' }, { zahl: woche.reduce((s, e) => s + (e.dauer || 0), 0), text: 'Minuten' }];
}
