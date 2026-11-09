// Ansicht „Heute“: Glas-Dashboard (Plan in docs/module/heute.md).
// Liest nur über core/ (To-dos, Routinen, Training, Ziele, Affirmationen, Gewohnheiten, Quiz-Ergebnisse, Insta-Posts, eigene Termine, Google-Termine aus dem Zwischenspeicher), speichert nur das Abhaken von Gewohnheiten (gewohnheiten-leiste.js).
// Bei jedem Ereignis 'daten' neu zeichnen – dann ohne Hochzähl-Bewegung, damit nichts zappelt.
import { el } from '../../ui/dom.js';
import { getAll } from '../../core/store.js';
import { getMeta } from '../../core/sync-local.js';
import { on } from '../../core/events.js';
import { rechne } from './rechnen.js';
import { ordnen, ziehbar } from './anordnen.js';
import { aufklappen } from '../../core/wiederholung.js';
import { kopf } from './kopf.js';
import { hero } from './hero.js';
import { kacheln } from './kacheln.js';
import { kalenderKarte } from './kalender-karte.js';
import { verlauf } from './verlauf.js';
import { donut } from './donut.js';
import { routinenLeiste } from './routinen-leiste.js';
import { rechneTraining, trainingLeiste } from './training.js';
import { zieleLeiste } from './ziele-leiste.js';
import { affirmationKarte } from './affirmation.js';
import { gewohnheitenLeiste } from './gewohnheiten-leiste.js';
import { quizKarte } from './quiz-karte.js';
import { instaLeiste } from './insta-leiste.js';

const GOOGLE = 'kalender:google'; // Zwischenspeicher des Kalenders: { termine: [...] }

async function laden() {
  const [todos, termine, bereiche, google, routinen, schritte, logs, einheiten, plaene, planEinheiten, ziele, zielSchritte, affirmationen, gewohnheiten, gewLogs, rueckfaelle, quiz, saetze, insta] = await Promise.all([
    getAll('todos'), getAll('termine'), getAll('todo_bereiche'), getMeta(GOOGLE),
    getAll('routinen'), getAll('routine_schritte'), getAll('routine_logs'),
    getAll('einheiten'), getAll('trainingsplaene'), getAll('plan_einheiten'), getAll('lebensziele'), getAll('ziel_schritte'), getAll('affirmationen'),
    getAll('gewohnheiten'), getAll('gewohnheit_logs'), getAll('rueckfaelle'), getAll('quiz_ergebnisse'), getAll('saetze'), getAll('insta_posts'),
  ]);
  return { todos, bereiche, termine: [...aufklappen(termine), ...(google?.termine || [])], routinen: { routinen, schritte, logs },
    training: rechneTraining({ einheiten, saetze, plaene, planEinheiten }), ziele: { ziele, schritte: zielSchritte }, affirmationen: { affirmationen, ziele },
    gewohnheiten: { gewohnheiten, logs: gewLogs, rueckfaelle }, quiz, insta };
}

// [name, element] → Elemente mit data-kachel (leere Kacheln fallen weg)
const benennen = (paare) => paare.filter(([, k]) => k).map(([name, k]) => { k.dataset.kachel = name; return k; });

export function heuteAnsicht({ signal }) {
  const box = el('div', { class: 'heute' });
  let erstesMal = true;

  async function zeichne() {
    const d = await laden();
    const z = { ...rechne(d), training: d.training };
    const animiert = erstesMal;
    erstesMal = false;
    box.classList.toggle('heute--ruhig', !animiert); // beim Neuzeichnen nicht noch einmal einblenden
    box.replaceChildren(
      kopf(z.dinge),
      el('section', { class: 'heute-raster' }, ordnen(benennen([
        ['hero', hero(z.woche, animiert)],
        ['kalender', kalenderKarte(d.termine)],
        ...kacheln(z, animiert).map((k, i) => [`kachel-${i}`, k]),
        ['affirmation', affirmationKarte(d.affirmationen)],
        ['quiz', quizKarte(d.quiz)],
        ['routinen', routinenLeiste(d.routinen)],
        ['gewohnheiten', gewohnheitenLeiste(d.gewohnheiten)],
        ['training', trainingLeiste(d.training)],
        ['ziele', zieleLeiste(d.ziele)],
        ['insta', instaLeiste(d.insta)],
        ['verlauf', verlauf(d.todos, animiert)],
        ['donut', donut(d.todos, d.bereiche, animiert)],
      ]))),
    );
  }

  zeichne();
  ziehbar(box, signal); // lange drücken + ziehen = umordnen (nur dieses Gerät)
  // Einstellungen (z. B. Akzentfarbe) ändern hier nichts – sonst schlösse sich die Farbwahl bei jedem Tipp
  on('daten', ({ table }) => table !== 'einstellungen' && zeichne(), { signal });
  return box;
}
