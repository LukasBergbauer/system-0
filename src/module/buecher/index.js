// Modul „Bücher“: meldet sich beim Router an.
import { register } from '../../core/router.js';
import { kennzahlen } from './kennzahlen.js';
import { buecherAnsicht } from './view.js';

register({ id: 'buecher', titel: 'Bücher', symbol: 'buecher', ansicht: buecherAnsicht, kennzahlen });
