// Modul „Training“: meldet sich beim Router an (ersetzt den „Kommt bald“-Platzhalter).
import { register } from '../../core/router.js';
import { kennzahlen } from './kennzahlen.js';
import { trainingAnsicht } from './view.js';

register({ id: 'training', titel: 'Training', symbol: 'training', ansicht: trainingAnsicht, kennzahlen });
