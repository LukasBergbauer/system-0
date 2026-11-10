// Modul „Lebensziele“: meldet sich beim Router an.
import { register } from '../../core/router.js';
import { kennzahlen } from './kennzahlen.js';
import { zieleAnsicht } from './view.js';

register({ id: 'ziele', titel: 'Visionen', symbol: 'ziele', ansicht: zieleAnsicht, kennzahlen });
