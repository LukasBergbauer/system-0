// Modul „Affirmationen“: meldet sich beim Router an.
import { register } from '../../core/router.js';
import { affirmationenAnsicht } from './view.js';

register({ id: 'affirmationen', titel: 'Affirmationen', symbol: 'affirmation', ansicht: affirmationenAnsicht });
