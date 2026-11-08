// Modul „Heute“: meldet sich beim Router an. Eigener Kopf (Gruß) und breites Dashboard-Layout.
import { register } from '../../core/router.js';
import { heuteAnsicht } from './view.js';

register({
  id: 'heute',
  titel: 'Heute',
  symbol: 'heute',
  dashboard: true, // shell.js: kein Standard-Kopf, breite Fläche
  ansicht: heuteAnsicht,
});
