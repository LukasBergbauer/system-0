// Kennzahlen für den Seitenkopf (shell.js): heute fertige Routinen von allen.
import { getAll } from '../../core/store.js';

export async function kennzahlen() {
  const heute = new Date().toLocaleDateString('sv');
  const [routinen, logs] = await Promise.all([getAll('routinen'), getAll('routine_logs')]);
  const fertig = new Set(logs.filter((l) => l.tag === heute && l.fertig_am).map((l) => l.routine_id));
  return [{ zahl: `${routinen.filter((r) => fertig.has(r.id)).length}/${routinen.length}`, text: 'heute fertig' }];
}
