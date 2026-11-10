// Modul „Insta-Organizer“: meldet sich beim Router an.
import { register } from '../../core/router.js';
import { kennzahlen } from './kennzahlen.js';
import { instaAnsicht } from './view.js';

register({ id: 'insta', titel: 'Insta', symbol: 'insta', ansicht: instaAnsicht, kennzahlen });
