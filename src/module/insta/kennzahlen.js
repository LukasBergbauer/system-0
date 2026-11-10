// Kennzahlen für den Seitenkopf (shell.js): Ideen und gepostete Beiträge.
import { getAll } from '../../core/store.js';

export async function kennzahlen() {
  const posts = await getAll('insta_posts');
  return [{ zahl: posts.filter((p) => p.status === 'idee').length, text: 'Ideen' }, { zahl: posts.filter((p) => p.status === 'gepostet').length, text: 'gepostet' }];
}
