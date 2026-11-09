// Modul „Gewohnheiten“: meldet sich beim Router an.
import { register } from '../../core/router.js';
import { gewohnheitenAnsicht } from './view.js';

register({ id: 'gewohnheiten', titel: 'Gewohnheiten', symbol: 'gewohnheiten', ansicht: gewohnheitenAnsicht });
