// Karte einer Routine: Name, Art, Stand heute, Woche Mo–So als Punkte, Serie, Starten/Weiter.
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { logAm, wocheTage, serie } from './data.js';

const TAG = new Intl.DateTimeFormat('de-DE', { weekday: 'narrow' });

export function routineKarte(r, { onStart, onEdit }) {
  const n = r.schritte.length;
  const log = logAm(r);
  const fertig = !!log?.fertig_am;
  const geschafft = fertig ? n : Math.min(log?.geschafft || 0, n);
  const s = serie(r);

  const stand = !n ? 'Noch keine Schritte'
    : fertig ? 'Heute erledigt ✓'
      : `${geschafft} von ${n} Schritten`;
  const knopf = !n
    ? button({ text: 'Schritte eintragen', onClick: () => onEdit(r) })
    : button({ text: fertig ? 'Nochmal' : geschafft ? 'Weiter' : 'Starten', variant: fertig ? 'normal' : 'primary', onClick: () => onStart(r) });

  return el('article', { class: `routine${fertig ? ' routine--fertig' : ''}` }, [
    el('button', { class: 'routine__kopf', attrs: { type: 'button', 'aria-label': `${r.name} bearbeiten` }, on: { click: () => onEdit(r) } }, [
      el('h2', { class: 'routine__name', text: r.name }),
    ]),
    el('p', { class: 'routine__stand', text: stand }),
    n > 0 && el('div', { class: 'routine__balken', attrs: { 'aria-hidden': 'true' } }, [
      el('i', { attrs: { style: `width:${(geschafft / n) * 100}%` } }),
    ]),
    el('div', { class: 'routine__fuss' }, [
      el('div', { class: 'routine__tage', attrs: { 'aria-label': 'Diese Woche' } }, wocheTage(r).map((t) =>
        el('span', { class: t.fertig ? 'an' : t.zukunft ? 'zukunft' : '', attrs: { title: t.tag } }, [TAG.format(new Date(`${t.tag}T12:00`))]))),
      s > 1 && el('small', { class: 'routine__serie', text: `${s} Tage in Folge` }),
      knopf,
    ]),
  ]);
}
