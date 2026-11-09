// Meldet alle Bereiche beim Router an.
// Neues Modul → hier seine index.js importieren (sie meldet sich dort selbst an).
import { register } from '../core/router.js';
import '../module/heute/index.js';
import '../module/todos/index.js';
import '../module/kalender/index.js';
import '../module/routinen/index.js';
import '../module/physio/index.js';
import '../module/training/index.js';
import '../module/ziele/index.js';
import '../module/affirmationen/index.js';
import { einstellungenBereich } from './einstellungen.js';
import { mehrBereich } from './mehr.js';

import './bald.js'; // „Kommt bald“-Platzhalter (nach den echten Modulen laden)

register(einstellungenBereich);
register(mehrBereich);
