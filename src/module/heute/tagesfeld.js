// Heute: festes Tagesfeld ganz oben (nicht verschieb- oder entfernbar). Akzent-Fläche mit motivierendem Satz,
// Kästchen je Bereich, Tageslinie (Termine, Routinen, „jetzt“) und Ring „geschafft“. Zahlen aus tag-rechnen.js.
import { el } from '../../ui/dom.js';
import { go } from '../../core/router.js';
import { zahl, ring } from './bewegung.js';

const UHR = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });
const dinge = (n) => (n === 1 ? '1 Ding' : `${n} Dinge`);

function kw(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  return Math.ceil(((t - Date.UTC(t.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7);
}

// Überschrift mit einem kursiven Teil, dazu ein kurzer Satz – je nach Stand des Tages
function satz(t) {
  const rest = t.gesamt - t.geschafft;
  const weiter = t.termine.naechster ? ` Als Nächstes: ${UHR.format(new Date(t.termine.naechster.start))} ${t.termine.naechster.titel || 'Termin'}.` : '';
  if (!t.gesamt) return [['Dein Tag ist ', 'frei', ''], `Nichts geplant – Zeit für dich.${weiter}`];
  if (!rest) return [['Alles ', 'geschafft', ' – stark!'], `Jeder Punkt für heute ist erledigt.${weiter}`];
  if (!t.geschafft) return [['Neuer Tag, ', 'neue Kraft', ''], `${rest === 1 ? '1 Punkt steht' : `${rest} Punkte stehen`} an – fang mit dem Kleinsten an.${weiter}`];
  if (t.anteil < 0.5) return [['Guter Start – noch ', dinge(rest), ''], `${t.geschafft} von ${t.gesamt} erledigt.${weiter}`];
  return [['Noch ', dinge(rest), ', dann ist dein Tag rund'], `Mehr als die Hälfte geschafft.${weiter}`];
}

function kaestchen(wert, titel, text, ziel, fertig) {
  return el('button', { class: `tag-wert${fertig ? ' tag-wert--fertig' : ''}`, attrs: { type: 'button' }, on: { click: () => go(ziel) } }, [
    el('b', { text: wert }), el('span', {}, [titel, el('small', { text })]),
  ]);
}

function werte(t) {
  const { todos, termine, routinen, gewohnheiten, training } = t;
  const n = termine.naechster;
  return el('div', { class: 'tag-werte' }, [
    kaestchen(String(todos.offen || '✓'), 'To-dos', todos.ueberfaellig ? `${todos.ueberfaellig} überfällig` : todos.offen ? 'heute fällig' : 'alles erledigt',
      'todos', !todos.offen),
    termine.n > 0 && kaestchen(n ? UHR.format(new Date(n.start)) : '✓', n ? n.titel || 'Termin' : 'Termine', n ? 'nächster Termin' : 'alle vorbei',
      'kalender', !n),
    routinen.n > 0 && kaestchen(`${routinen.fertig}/${routinen.n}`, 'Routinen', routinen.fertig === routinen.n ? 'erledigt' : 'heute', 'routinen',
      routinen.fertig === routinen.n),
    gewohnheiten.n > 0 && kaestchen(`${gewohnheiten.fertig}/${gewohnheiten.n}`, 'Gewohnheiten',
      gewohnheiten.fertig === gewohnheiten.n ? 'erledigt' : `${gewohnheiten.n - gewohnheiten.fertig} offen`, 'gewohnheiten', gewohnheiten.fertig === gewohnheiten.n),
    training.n > 0 && kaestchen(training.fertig === training.n ? '✓' : `${training.fertig}/${training.n}`, 'Training',
      training.fertig === training.n ? 'erledigt' : training.titel || 'laut Plan', 'training', training.fertig === training.n),
  ]);
}

// Tageslinie: Spur bis „jetzt“ gefüllt, Punkte (gefüllt = geschafft), Stunden darunter
function linie({ punkte, von, bis, jetzt }) {
  const pos = (z) => `${((Math.min(Math.max(z, von), bis) - von) / (bis - von)) * 100}%`;
  const schritt = Math.ceil((bis - von) / 4);
  const marken = [];
  for (let s = von; s <= bis; s += schritt) if (Math.abs(s - jetzt) > (bis - von) * 0.1) marken.push(s); // nicht unter „jetzt“
  return el('div', { class: 'tag-linie' }, [
    el('div', { class: 'tag-linie__bahn' }, [
      el('div', { class: 'tag-linie__spur' }, [el('i', { attrs: { style: `width:${pos(jetzt)}` } })]),
      ...punkte.map((p) => el('button', {
        class: `tag-punkt${p.fertig ? ' tag-punkt--fertig' : ''}`, attrs: { type: 'button', style: `left:${pos(p.zeit)}`, title: p.text },
        on: { click: () => go(p.ziel) },
      }, [el('span', { text: p.text })])),
      jetzt >= von && jetzt <= bis && el('div', { class: 'tag-jetzt', attrs: { style: `left:${pos(jetzt)}` } }, [el('b', { text: 'jetzt' })]),
    ]),
    el('div', { class: 'tag-linie__stunden' }, marken.map((s) => el('span', { attrs: { style: `left:${pos(s)}` }, text: String(s) }))),
  ]);
}

export function tagesfeld(t, animiert, jetzt = new Date()) {
  const [[vor, kursiv, nach], text] = satz(t);
  const prozent = Math.round(t.anteil * 100);
  return el('article', { class: 'tagesfeld' }, [
    el('div', { class: 'tagesfeld__text' }, [
      el('span', { class: 'tagesfeld__status' }, [el('i'), `KW ${kw(jetzt)} · ${t.termine.n === 1 ? '1 Termin' : `${t.termine.n} Termine`} heute`]),
      el('h2', {}, [vor, el('em', { text: kursiv }), nach]),
      el('p', { text }),
    ]),
    ring(t.anteil, el('div', {}, [zahl(prozent, { nach: ' %', animiert }), el('small', { text: 'geschafft' })]), animiert),
    linie(t.linie),
    werte(t),
  ]);
}
