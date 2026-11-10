// Kennzahlen für den Seitenkopf (shell.js): heute eingetragene Gewohnheiten von allen.
import { getAll } from '../../core/store.js';

export async function kennzahlen() {
  const heute = new Date().toLocaleDateString('sv');
  const [alle, logs] = await Promise.all([getAll('gewohnheiten'), getAll('gewohnheit_logs')]);
  const heuteDa = new Set(logs.filter((l) => l.tag === heute).map((l) => l.gewohnheit_id));
  return [{ zahl: `${alle.filter((g) => heuteDa.has(g.id)).length}/${alle.length}`, text: 'heute' }];
}
