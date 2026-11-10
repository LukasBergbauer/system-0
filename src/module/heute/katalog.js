// Heute: alle Feld-Arten. Je Art: Titel, Bereich (Farbe), Symbol, Standardgröße std [w, h],
// gross(ctx, ref) = ausführliche Karte (ab Größe ab [w, h]), klein(ctx, ref) = Kennzahl/Ring ({ wert, anteil, text … } oder Element).
// ctx = { d (Rohdaten aus view.js), z (Zahlen aus rechnen.js), animiert, bearbeiten }.
import { hero } from './hero.js';
import { kennzahl } from './kacheln.js';
import { kalenderKarte } from './kalender-karte.js';
import { verlauf } from './verlauf.js';
import { donut } from './donut.js';
import { routinenLeiste, routineStand } from './routinen-leiste.js';
import { trainingLeiste } from './training.js';
import { zieleLeiste } from './ziele-leiste.js';
import { affirmationKarte } from './affirmation.js';
import { gewohnheitenLeiste, gewohnheitStand } from './gewohnheiten-leiste.js';
import { quizKarte } from './quiz-karte.js';
import { absatzKarte, absaetze } from './absatz.js';
import { instaLeiste } from './insta-leiste.js';
import { einzelGewohnheit, einzelRoutine, einzelZiel, todoListe } from './einzeln.js';
import { tagISO } from './rechnen.js';
import { go } from '../../core/router.js';

const ring = (fertig, n, text, ziel) => (n ? { wert: `${fertig}/${n}`, anteil: fertig / n, text, klick: () => go(ziel) } : null);

export const ARTEN = {
  woche: { titel: 'Woche', bereich: 'heute', symbol: 'heute', std: [3, 2], ab: [2, 2],
    gross: ({ z, animiert }) => hero(z.woche, animiert),
    klein: ({ z }) => ({ wert: z.woche.quote === null ? '–' : Math.round(z.woche.quote * 100), nach: z.woche.quote === null ? '' : ' %',
      anteil: z.woche.quote ?? 0, text: 'Woche erledigt', klick: () => go('todos') }) },
  kalender: { titel: 'Kalender', bereich: 'kalender', symbol: 'kalender', std: [1, 2], ab: [1, 2],
    gross: ({ d }) => kalenderKarte(d.termine),
    klein: ({ z }) => ({ wert: z.woche.termineHeute, text: 'Termine heute', klick: () => go('kalender') }) },
  todos: { titel: 'To-dos', bereich: 'todos', symbol: 'todos', std: [1, 1], ab: [2, 2],
    gross: ({ d }) => todoListe(d.todos), klein: ({ z, animiert }) => kennzahl('todos', z, animiert) },
  termine: { titel: 'Termine', bereich: 'kalender', symbol: 'kalender', std: [1, 1], ab: [2, 2],
    gross: ({ d }) => kalenderKarte(d.termine), klein: ({ z, animiert }) => kennzahl('termine', z, animiert) },
  serie: { titel: 'Erledigt-Serie', bereich: 'todos', symbol: 'flamme', std: [1, 1],
    klein: ({ z, animiert }) => kennzahl('serie', z, animiert) },
  training: { titel: 'Training', bereich: 'training', symbol: 'training', std: [1, 1], ab: [2, 1],
    gross: ({ d }) => trainingLeiste(d.training), klein: ({ z, animiert }) => kennzahl('training', z, animiert) },
  affirmation: { titel: 'Affirmation', bereich: 'affirmationen', symbol: 'affirmation', std: [3, 1],
    gross: ({ d }) => affirmationKarte(d.affirmationen) },
  absatz: { titel: 'Zitat', bereich: 'buecher', symbol: 'buecher', std: [2, 1], gross: ({ d }, ref) => absatzKarte(d.buecher, ref) },
  quiz: { titel: 'Daily-Quiz', bereich: 'quiz', symbol: 'quiz', std: [1, 1], gross: ({ d }) => quizKarte(d.quiz) },
  routinen: { titel: 'Routinen', bereich: 'routinen', symbol: 'routinen', std: [4, 1], ab: [2, 1],
    gross: ({ d }) => routinenLeiste(d.routinen),
    klein: ({ d }) => ring(d.routinen.routinen.filter((r) => routineStand(r, d.routinen).fertig).length, d.routinen.routinen.length, 'Routinen heute', 'routinen') },
  gewohnheiten: { titel: 'Gewohnheiten', bereich: 'gewohnheiten', symbol: 'gewohnheiten', std: [4, 1], ab: [2, 1],
    gross: ({ d }) => gewohnheitenLeiste(d.gewohnheiten),
    klein: ({ d }) => {
      const auf = d.gewohnheiten.gewohnheiten.filter((g) => g.art !== 'ab');
      return ring(auf.filter((g) => gewohnheitStand(g, d.gewohnheiten).fertig).length, auf.length, 'heute geschafft', 'gewohnheiten');
    } },
  ziele: { titel: 'Visionen', bereich: 'ziele', symbol: 'ziele', std: [4, 1], ab: [2, 1],
    gross: ({ d }) => zieleLeiste(d.ziele),
    klein: ({ d }) => {
      const n = d.ziele.ziele.filter((z) => z.status === 'aktiv').length;
      return n ? { wert: n, text: n === 1 ? 'aktiver Schritt' : 'aktive Schritte', klick: () => go('ziele') } : null;
    } },
  insta: { titel: 'Insta', bereich: 'insta', symbol: 'insta', std: [4, 1], ab: [2, 1],
    gross: ({ d }) => instaLeiste(d.insta),
    klein: ({ d }) => {
      const n = d.insta.filter((p) => p.datum === tagISO(new Date()) && p.status !== 'gepostet').length;
      return n ? { wert: n, text: 'heute geplant', klick: () => go('insta') } : null;
    } },
  verlauf: { titel: 'Verlauf', bereich: 'todos', symbol: 'todos', std: [3, 2], ab: [2, 2],
    gross: ({ d, animiert }) => verlauf(d.todos, animiert),
    klein: ({ z }) => ({ wert: z.serie.kurve.reduce((a, b) => a + b, 0), text: 'erledigt in 7 Tagen', klick: () => go('todos') }) },
  donut: { titel: 'Nach Bereich', bereich: 'todos', symbol: 'todos', std: [1, 2], ab: [1, 2],
    gross: ({ d, animiert }) => donut(d.todos, d.bereiche, animiert),
    klein: ({ z }) => ({ wert: z.offen.zahl, text: 'offene To-dos', klick: () => go('todos') }) },
  gewohnheit: { titel: 'Gewohnheit', bereich: 'gewohnheiten', symbol: 'gewohnheiten', std: [1, 1], klein: einzelGewohnheit },
  routine: { titel: 'Routine', bereich: 'routinen', symbol: 'routinen', std: [1, 1], klein: einzelRoutine },
  ziel: { titel: 'Schritt', bereich: 'ziele', symbol: 'ziele', std: [1, 1], klein: einzelZiel },
};

// Auswahl zum Hinzufügen: Gruppen mit fertigen Layout-Einträgen
export function auswahl(d) {
  const art = (typ, w, h, titel, ref) => ({ typ, ref, w: w ?? ARTEN[typ].std[0], h: h ?? ARTEN[typ].std[1], titel: titel || ARTEN[typ].titel });
  return [
    { titel: 'Übersicht', eintraege: ['woche', 'kalender', 'todos', 'termine', 'serie', 'verlauf', 'donut'].map((t) => art(t)) },
    { titel: 'Bereiche', eintraege: ['routinen', 'gewohnheiten', 'training', 'ziele', 'insta', 'affirmation', 'quiz', 'absatz'].map((t) => art(t)) },
    { titel: 'Ringe', eintraege: [art('woche', 1, 1, 'To-dos der Woche'), art('routinen', 1, 1, 'Routinen heute'),
      art('gewohnheiten', 1, 1, 'Gewohnheiten heute')] },
    { titel: 'Einzelne Felder', eintraege: [
      ...d.gewohnheiten.gewohnheiten.map((g) => art('gewohnheit', 1, 1, g.name, g.id)),
      ...d.routinen.routinen.map((r) => art('routine', 1, 1, r.name, r.id)),
      ...d.ziele.ziele.filter((z) => z.status === 'aktiv').map((z) => art('ziel', 1, 1, z.titel || 'Schritt', z.id)),
      ...absaetze(d.buecher).map((n) => art('absatz', 2, 1, `„${n.text.slice(0, 40)}${n.text.length > 40 ? '…' : ''}“`, n.id)),
    ] },
  ].filter((g) => g.eintraege.length);
}
