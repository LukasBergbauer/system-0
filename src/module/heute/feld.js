// Heute: ein Feld im Raster. Hülle mit Rastergröße (w Spalten × h Zeilen) und Bereichsfarbe (data-bereich → --bereich),
// darin der Inhalt passend zur Größe: groß genug → ausführliche Karte (gross), sonst Kennzahl/Ring (klein).
import { el } from '../../ui/dom.js';
import { symbol } from '../../ui/symbol.js';
import { zahl, ring } from './bewegung.js';

// Modulname je Bereich: steht einheitlich oben in jedem Feld (Symbol + Name)
const MODUL = { heute: ['To-dos', 'todos'], todos: ['To-dos', 'todos'], kalender: ['Kalender', 'kalender'], training: ['Training', 'training'],
  affirmationen: ['Affirmationen', 'affirmation'], quiz: ['Wissen-Quiz', 'quiz'], routinen: ['Routinen', 'routinen'],
  gewohnheiten: ['Gewohnheiten', 'gewohnheiten'], ziele: ['Visionen', 'ziele'], insta: ['Insta', 'insta'] };

// Kleines Feld: Titel oben (Modulname steht darüber), Ring (anteil 0…1) oder große Zahl, Unterzeile.
export function kleinFeld({ titel, wert, nach = '', anteil = null, text, klick, fertig }, animiert) {
  const mitte = anteil === null
    ? zahl(wert ?? '–', { nach, animiert, klasse: 'feld-k__zahl' })
    : ring(anteil, el('div', {}, [typeof wert === 'number' ? zahl(wert, { nach, animiert }) : el('b', { text: wert ?? '' })]), animiert);
  return el(klick ? 'button' : 'div', {
    class: `feld-k${anteil === null ? '' : ' feld-k--ring'}${fertig ? ' feld-k--fertig' : ''}`,
    attrs: klick ? { type: 'button' } : {},
    on: klick ? { click: klick } : {},
  }, [
    el('span', { class: 'feld-k__kopf' }, [el('span', { text: titel })]),
    mitte,
    text && el('small', { class: 'feld-k__text', text }),
  ]);
}

// art = Eintrag aus katalog.js, e = { typ, ref, w, h } aus dem Layout, ctx = { d, z, animiert, bearbeiten }
export function feld(art, e, ctx) {
  const gross = art.gross && (!art.ab || (e.w >= art.ab[0] && e.h >= art.ab[1]));
  let inhalt = gross ? art.gross(ctx, e.ref) : null;
  if (!inhalt && art.klein) {
    const k = art.klein(ctx, e.ref);
    if (k) inhalt = k.nodeType ? k : kleinFeld({ symbol: art.symbol, titel: art.titel, ...k }, ctx.animiert);
  }
  if (!inhalt && !gross && art.gross) inhalt = art.gross(ctx, e.ref); // Karte ohne kleine Form: trotzdem zeigen
  if (!inhalt && !ctx.bearbeiten) return null; // nichts für heute
  inhalt ||= kleinFeld({ symbol: art.symbol, titel: art.titel, wert: '–', text: 'gerade nichts' }, false);
  const [name, sym] = MODUL[art.bereich] || [art.titel, art.symbol];
  for (const t of inhalt.querySelectorAll('.heute-karte__kopf h3, .feld-k__kopf')) if (t.textContent === name) t.remove(); // nicht doppelt
  const akzent = inhalt.matches('.heute-hero, .heute-kz--akzent');
  const huelle = el('div', { class: `feld feld--w${e.w} feld--h${e.h}${akzent ? ' feld--akzent' : ''}`, attrs: { 'data-bereich': art.bereich } }, [
    inhalt, el('span', { class: 'feld-modul' }, [el('span', { class: 'feld-symbol' }, [symbol(sym)]), name]),
  ]);
  huelle.style.setProperty('--w', e.w);
  huelle.style.setProperty('--h', e.h);
  return huelle;
}
