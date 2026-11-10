// Modul „Wissen-Quiz“: meldet sich beim Router an (id 'quiz').
import { register } from '../../core/router.js';
import { kennzahlen } from './kennzahlen.js';
import { quizAnsicht } from './view.js';

register({ id: 'quiz', titel: 'Wissen-Quiz', kurztitel: 'Quiz', symbol: 'quiz', ansicht: quizAnsicht, kennzahlen });
