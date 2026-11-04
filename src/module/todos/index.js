// Modul „To-dos“: meldet sich beim Router an.
import { register } from '../../core/router.js';
import { todosAnsicht } from './view.js';

register({ id: 'todos', titel: 'To-dos', symbol: 'todos', ansicht: todosAnsicht });
