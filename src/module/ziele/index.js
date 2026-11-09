// Modul „Lebensziele“: meldet sich beim Router an.
import { register } from '../../core/router.js';
import { zieleAnsicht } from './view.js';

register({ id: 'ziele', titel: 'Visionen', symbol: 'ziele', ansicht: zieleAnsicht });
