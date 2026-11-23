// Kennzahlen für den Seitenkopf (shell.js): Pyramiden und Ebenen der ersten.
import { ladeAlle } from './data.js';

export async function kennzahlen() {
  const liste = await ladeAlle();
  return [{ zahl: liste.length, text: 'Pyramiden' }, { zahl: liste[0]?.ebenen.length || 0, text: 'Ebenen' }];
}
