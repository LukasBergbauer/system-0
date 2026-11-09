// Heute: vier Schnellaktionen unter den Kacheln. Ziele über den Router-Zusatz (#/todos/neu …).
import { el } from '../../ui/dom.js';
import { symbol } from '../../ui/symbol.js';
import { go } from '../../core/router.js';

function aktion(sym, titel, text, ziel) {
  return el('button', {
    class: 'heute-schnell heute-s3',
    attrs: { type: 'button', disabled: !ziel },
    on: { click: () => ziel && go(ziel) },
  }, [
    el('span', { class: 'heute-kz__symbol' }, [symbol(sym)]),
    el('span', {}, [titel, el('small', { text })]),
  ]);
}

export function schnellaktionen(w, t) {
  const n = w.termineHeute;
  return [
    aktion('plus', 'Neues To-do', 'Schnell eintragen', 'todos/neu'),
    aktion('kalender', 'Termin', n ? `Heute ${n} ${n === 1 ? 'Termin' : 'Termine'}` : 'Heute frei', 'kalender/neu'),
    aktion('training', 'Training starten', t.ziel.startsWith('training/plan:') ? t.text.replace('heute: ', '') : 'Einheit eintragen', t.ziel),
    aktion('physio', 'Mindmap öffnen', 'PhysioZentrum', 'physio/mindmap'),
  ];
}
