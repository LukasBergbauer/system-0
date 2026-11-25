// Heute: Zahlen für das feste Tagesfeld (tagesfeld.js) – was heute ansteht, was schon geschafft ist, Punkte für die Tageslinie.
// Reine Rechnung aus den Rohdaten von view.js, nichts wird gespeichert.
import { amTag, plusTage, tagISO } from './rechnen.js';
import { routineStand } from './routinen-leiste.js';
import { gewohnheitStand } from './gewohnheiten-leiste.js';
import { besteSerie } from './serien.js';

const UHR = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });
const ROUTINE_STUNDE = { morgen: 7, abend: 21 }; // Routinen haben keine Uhrzeit: feste Plätze auf der Linie
const stunden = (d) => d.getHours() + d.getMinutes() / 60;
const teil = (fertig, n) => ({ fertig, n });

export function rechneTag(d, jetzt = new Date()) {
  const heute = plusTage(jetzt, 0);
  const h = tagISO(heute);

  // To-dos: offen fällig/überfällig + heute erledigte
  const offen = d.todos.filter((t) => !t.erledigt_am && t.faellig_am && t.faellig_am <= h);
  const ueberfaellig = offen.filter((t) => t.faellig_am < h).length;
  const heuteErledigt = d.todos.filter((t) => t.erledigt_am && tagISO(new Date(t.erledigt_am)) === h).length;
  const todos = { ...teil(heuteErledigt, heuteErledigt + offen.length), offen: offen.length, ueberfaellig };

  // Termine mit Uhrzeit heute; vorbei = geschafft
  const termine = d.termine.filter((t) => amTag(t, heute) && !t.ganztaegig && !t.todo)
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  const vorbei = termine.filter((t) => Date.parse(t.ende || t.start) <= +jetzt).length;
  const naechster = termine.find((t) => Date.parse(t.ende || t.start) > +jetzt);

  const r = d.routinen.routinen.map((x) => ({ x, s: routineStand(x, d.routinen) })).filter(({ s }) => s.n);
  const naechsteR = r.find(({ s }) => !s.fertig)?.x;
  const routinen = { ...teil(r.filter(({ s }) => s.fertig).length, r.length), titel: naechsteR?.name, ziel: naechsteR ? `routinen/${naechsteR.id}` : 'routinen' };
  const auf = d.gewohnheiten.gewohnheiten.filter((g) => g.art !== 'ab');
  const gewohnheiten = teil(auf.filter((g) => gewohnheitStand(g, d.gewohnheiten).fertig).length, auf.length);
  const g = d.training.geplant;
  const offenT = g.find((p) => !p.fertig);
  const training = { ...teil(g.filter((p) => p.fertig).length, g.length), titel: offenT?.titel || g[0]?.titel,
    ziel: offenT ? `training/plan:${offenT.id}` : 'training' };
  const q = d.quiz.find((x) => x.modus === 'daily' && x.tag === h);
  const quiz = { ...teil(q ? 1 : 0, 1), richtig: q?.richtig, von: q?.gesamt };

  const alle = [todos, teil(vorbei, termine.length), routinen, gewohnheiten, training, quiz];
  const gesamt = alle.reduce((s, x) => s + x.n, 0);
  const geschafft = alle.reduce((s, x) => s + x.fertig, 0);

  // Tageslinie: Termine und Morgen-/Abendroutinen, Bereich mindestens 6–22 Uhr
  const punkte = [
    ...termine.map((t) => ({ zeit: stunden(new Date(t.start)), text: `${UHR.format(new Date(t.start))} ${t.titel || 'Termin'}`,
      fertig: Date.parse(t.ende || t.start) <= +jetzt, ziel: 'kalender' })),
    ...r.filter(({ x }) => ROUTINE_STUNDE[x.art]).map(({ x, s }) => ({ zeit: ROUTINE_STUNDE[x.art], text: x.name,
      fertig: s.fertig, ziel: s.fertig ? 'routinen' : `routinen/${x.id}` })),
  ].sort((a, b) => a.zeit - b.zeit);
  const von = Math.min(6, Math.floor(punkte[0]?.zeit ?? 6));
  const bis = Math.max(22, Math.ceil(punkte.at(-1)?.zeit ?? 22));

  return { todos, termine: { n: termine.length, naechster }, routinen, gewohnheiten, training, quiz, serie: besteSerie(d, jetzt), gesamt, geschafft,
    anteil: gesamt ? geschafft / gesamt : 1, linie: { punkte, von, bis, jetzt: stunden(jetzt) } };
}
