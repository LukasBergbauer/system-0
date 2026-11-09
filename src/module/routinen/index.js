// Modul „Routinen“: meldet sich beim Router an.
import { register } from '../../core/router.js';
import { routinenAnsicht } from './view.js';

register({ id: 'routinen', titel: 'Routinen', symbol: 'routinen', ansicht: routinenAnsicht });
