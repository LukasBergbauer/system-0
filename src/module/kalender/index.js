// Modul „Kalender“ (persönlich): meldet sich beim Router an.
import { register } from '../../core/router.js';
import { kennzahlen } from './kennzahlen.js';
import { kalenderAnsicht } from './view.js';

register({
  id: 'kalender',
  titel: 'Kalender',
  symbol: 'kalender',
  ansicht: kalenderAnsicht,
  kennzahlen,
});
