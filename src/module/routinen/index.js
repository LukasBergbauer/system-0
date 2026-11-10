// Modul „Routinen“: meldet sich beim Router an und startet den Sperre-Wächter (sperre.js).
import { register } from '../../core/router.js';
import { kennzahlen } from './kennzahlen.js';
import { routinenAnsicht } from './view.js';
import { starteSperre } from './sperre.js';

register({ id: 'routinen', titel: 'Routinen', symbol: 'routinen', ansicht: routinenAnsicht, kennzahlen });
starteSperre();
