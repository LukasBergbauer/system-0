// Heute: die vier Kennzahl-Kacheln (Offene To-dos · Termine · Erledigt-Serie · Training).
// Jede Kachel: Symbol, Trend-Pille, große Zahl, Titel, Unterzeile, Mini-Kurve der letzten Tage.
import { el } from '../../ui/dom.js';
import { symbol } from '../../ui/symbol.js';
import { go } from '../../core/router.js';
import { zahl, spur } from './bewegung.js';

function kachel({ sym, trend, wert, nach, titel, text, kurve, akzent, ziel }, animiert) {
  return el('button', {
    class: `heute-kz heute-s3${akzent ? ' heute-kz--akzent' : ''}`,
    attrs: { type: 'button', disabled: !ziel },
    on: { click: () => ziel && go(ziel) },
  }, [
    el('span', { class: 'heute-kz__kopf' }, [
      el('span', { class: 'heute-kz__symbol' }, [symbol(sym)]),
      trend && el('span', { class: `heute-trend${trend.gut ? ' heute-trend--gut' : ''}`, text: trend.text }),
    ]),
    typeof wert === 'number' ? zahl(wert, { nach, animiert }) : el('b', { text: wert }),
    el('span', { class: 'heute-kz__titel', text: titel }),
    el('small', { text }),
    kurve && spur(kurve, animiert),
  ]);
}

export function kacheln(z, animiert) {
  return [
    kachel({ sym: 'todos', trend: z.offen.trend, wert: z.offen.zahl, titel: 'Offene To-dos',
      text: `${z.offen.heute} davon heute`, kurve: z.offen.kurve, ziel: 'todos' }, animiert),
    kachel({ sym: 'kalender', trend: z.termine.trend, wert: z.termine.zahl, titel: 'Termine',
      text: 'diese Woche', kurve: z.termine.kurve, ziel: 'kalender' }, animiert),
    kachel({ sym: 'flamme', trend: z.serie.rekord ? { text: 'Rekord', gut: true } : null, wert: z.serie.tage,
      nach: z.serie.tage === 1 ? ' Tag' : ' Tage', titel: 'Erledigt-Serie', text: 'Tage mit erledigtem To-do',
      kurve: z.serie.kurve, akzent: true, ziel: 'todos' }, animiert),
    kachel({ sym: 'training', wert: '–', titel: 'Training', text: 'kommt bald' }, animiert),
  ];
}
