// Ansicht „Heute“: Glas-Dashboard aus Feldern im festen Raster (layout.js, katalog.js); „Bearbeiten“ im Kopf (bearbeiten.js).
// Liest nur über core/ (To-dos, Routinen, Training, Ziele, Affirmationen, Gewohnheiten, Quiz-Ergebnisse, Insta-Posts, Buch-Absätze, eigene Termine, Google-Termine aus dem Zwischenspeicher), speichert nur das Abhaken von Gewohnheiten (gewohnheiten-leiste.js).
// Bei jedem Ereignis 'daten' neu zeichnen – dann ohne Hochzähl-Bewegung, damit nichts zappelt.
import { el } from '../../ui/dom.js';
import { getAll } from '../../core/store.js';
import { getMeta } from '../../core/sync-local.js';
import { on } from '../../core/events.js';
import { rechne } from './rechnen.js';
import { aufklappen } from '../../core/wiederholung.js';
import { kopf } from './kopf.js';
import { rechneTraining } from './training.js';
import { ARTEN } from './katalog.js';
import { feld } from './feld.js';
import { layoutLaden, layoutSpeichern, STANDARD } from './layout.js';
import { griffe, plusFeld, bearbeitbar, hinzufuegen } from './bearbeiten.js';

const GOOGLE = 'kalender:google'; // Zwischenspeicher des Kalenders: { termine: [...] }

async function laden() {
  const [todos, termine, bereiche, google, routinen, schritte, logs, einheiten, plaene, planEinheiten, ziele, zielSchritte, affirmationen, gewohnheiten, gewLogs, rueckfaelle, quiz, saetze, insta, notizen, buecher] = await Promise.all([
    getAll('todos'), getAll('termine'), getAll('todo_bereiche'), getMeta(GOOGLE),
    getAll('routinen'), getAll('routine_schritte'), getAll('routine_logs'),
    getAll('einheiten'), getAll('trainingsplaene'), getAll('plan_einheiten'), getAll('lebensziele'), getAll('ziel_schritte'), getAll('affirmationen'),
    getAll('gewohnheiten'), getAll('gewohnheit_logs'), getAll('rueckfaelle'), getAll('quiz_ergebnisse'), getAll('saetze'), getAll('insta_posts'),
    getAll('buch_notizen'), getAll('buecher'),
  ]);
  return { todos, bereiche, termine: [...aufklappen(termine), ...(google?.termine || [])], routinen: { routinen, schritte, logs },
    training: rechneTraining({ einheiten, saetze, plaene, planEinheiten }), ziele: { ziele, schritte: zielSchritte }, affirmationen: { affirmationen, ziele },
    gewohnheiten: { gewohnheiten, logs: gewLogs, rueckfaelle }, quiz, insta, buecher: { notizen, buecher } };
}

export function heuteAnsicht({ signal }) {
  const box = el('div', { class: 'heute' });
  let erstesMal = true;
  let layout = null; // [{ typ, ref?, w, h }] (layout.js)
  let bearbeiten = false;
  let d = null;

  async function zeichne(neuLaden = true) {
    if (neuLaden || !d) [d, layout] = await Promise.all([laden(), layout ? layout : layoutLaden()]);
    const z = { ...rechne(d), training: d.training };
    const animiert = erstesMal;
    erstesMal = false;
    const ctx = { d, z, animiert, bearbeiten };
    box.classList.toggle('heute--ruhig', !animiert); // beim Neuzeichnen nicht noch einmal einblenden
    box.classList.toggle('heute--bearbeiten', bearbeiten);
    const felder = layout.map((e, i) => {
      const f = feld(ARTEN[e.typ], e, ctx);
      if (f && bearbeiten) griffe(f, i);
      return f;
    }).filter(Boolean);
    box.replaceChildren(
      kopf(z.dinge, { bearbeiten, umschalten, standard }),
      el('section', { class: 'heute-raster', attrs: { 'data-raster': '' } }, [...felder, bearbeiten && plusFeld(() => hinzufuegen(d, (e) => aendern([...layout, e])))]),
    );
  }

  function aendern(neu) {
    layout = neu;
    layoutSpeichern(layout).catch((err) => console.warn(err));
    zeichne(false);
  }
  function umschalten() { bearbeiten = !bearbeiten; zeichne(false); }
  function standard() { aendern(STANDARD.map((e) => ({ ...e }))); }

  bearbeitbar(box, {
    entfernen: (i) => aendern(layout.filter((_, j) => j !== i)),
    verschieben: (reihe) => aendern([...reihe.map((i) => layout[i]), ...layout.filter((_, i) => !reihe.includes(i))]),
    groesse: (i, w, h) => aendern(layout.map((e, j) => (j === i ? { ...e, w, h } : e))),
  }, signal);

  zeichne();
  // Einstellungen: nur neu zeichnen, wenn sich das Layout geändert hat (z. B. vom anderen Gerät) – sonst schlösse sich die Farbwahl
  on('daten', async ({ table }) => {
    if (table !== 'einstellungen') return zeichne();
    const neu = await layoutLaden();
    if (!bearbeiten && JSON.stringify(neu) !== JSON.stringify(layout)) { layout = neu; zeichne(false); }
  }, { signal });
  return box;
}
