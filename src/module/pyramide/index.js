// Modul „Pyramide“: meldet sich beim Router an.
import { register } from '../../core/router.js';
import { kennzahlen } from './kennzahlen.js';
import { pyramideAnsicht } from './view.js';

register({ id: 'pyramide', titel: 'Pyramide', symbol: 'pyramide', ansicht: pyramideAnsicht, kennzahlen });
