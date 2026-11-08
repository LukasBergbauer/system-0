// Modul „Kalender“ (persönlich): meldet sich beim Router an.
// Kopfbild (steinerne Sonnenuhr) kommt in Teil e.
import { register } from '../../core/router.js';
import { kalenderAnsicht } from './view.js';

register({
  id: 'kalender',
  titel: 'Kalender',
  symbol: 'kalender',
  ansicht: kalenderAnsicht,
});
