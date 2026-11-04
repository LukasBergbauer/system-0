// Modul „Heute“: meldet sich beim Router an.
import { register } from '../../core/router.js';
import { heuteAnsicht } from './view.js';

// Datum über dem Titel, z. B. „Mittwoch, 4. November“
const DATUM = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

register({
  id: 'heute',
  titel: 'Heute',
  symbol: 'heute',
  bild: 'assets/bilder/heute.svg',
  ueber: () => DATUM.format(new Date()),
  ansicht: heuteAnsicht,
});
