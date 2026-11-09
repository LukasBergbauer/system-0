// Modul „Lebensziele“: meldet sich beim Router an.
import { register } from '../../core/router.js';
import { zieleAnsicht } from './view.js';

register({ id: 'ziele', titel: 'Ziele', symbol: 'ziele', ansicht: zieleAnsicht });
