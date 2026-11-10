// Modul „Kalender“ (persönlich): meldet sich beim Router an.
import { register } from '../../core/router.js';
import { kennzahlen } from './kennzahlen.js';
import { kalenderAnsicht } from './view.js';

register({
  id: 'kalender',
  titel: 'Kalender',
  symbol: 'kalender',
  // Kopfbild (steinerne Sonnenuhr): sobald Lukas' drei Fotos da sind (assets/bilder/kalender-1…3.webp),
  // diese Zeile einschalten und die Fotos in APP_FILES von sw.js eintragen.
  // bild: [1, 2, 3].map((n) => `assets/bilder/kalender-${n}.webp`),
  ansicht: kalenderAnsicht,
  kennzahlen,
});
