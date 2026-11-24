// Modul „Physio“: meldet sich beim Router an.
import { register } from '../../core/router.js';
import { kennzahlen } from './kennzahlen.js';
import { physioAnsicht } from './view.js';

register({
  id: 'physio',
  titel: 'Physio',
  symbol: 'physio',
  ansicht: physioAnsicht,
  kennzahlen,
});
