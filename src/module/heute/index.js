// Modul „Heute“: meldet sich beim Router an.
import { register } from '../../core/router.js';
import { heuteAnsicht } from './view.js';

register({ id: 'heute', titel: 'Heute', symbol: 'heute', ansicht: heuteAnsicht });
