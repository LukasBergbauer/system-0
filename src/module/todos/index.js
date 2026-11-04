// Modul „To-dos“: meldet sich beim Router an.
import { register } from '../../core/router.js';
import { todosAnsicht } from './view.js';

register({
  id: 'todos',
  titel: 'To-dos',
  symbol: 'todos',
  bild: [1, 2, 3].map((n) => `assets/bilder/todos-${n}.webp`), // Steinstapel, drei Varianten
  ansicht: todosAnsicht,
});
