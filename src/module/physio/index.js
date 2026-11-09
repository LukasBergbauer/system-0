// Modul „Physio“: meldet sich beim Router an.
import { register } from '../../core/router.js';
import { physioAnsicht } from './view.js';

register({
  id: 'physio',
  titel: 'Physio',
  symbol: 'physio',
  // Kopfbild: sobald Lukas' drei Fotos da sind (assets/bilder/physio-1…3.webp), diese Zeile einschalten
  // und die Fotos in APP_FILES von sw.js eintragen.
  // bild: [1, 2, 3].map((n) => `assets/bilder/physio-${n}.webp`),
  ansicht: physioAnsicht,
});
