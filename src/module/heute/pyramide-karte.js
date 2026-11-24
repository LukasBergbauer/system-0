// Heute: Pyramide des Tages – Tages-Pyramide von heute, sonst die dauerhafte. Liest nur über die Tabelle pyramiden.
import { el } from '../../ui/dom.js';
import { go } from '../../core/router.js';
import { tagISO } from './rechnen.js';

export function aktuellePyramide(liste = []) {
  const heute = tagISO(new Date());
  const voll = (x) => x.ebenen?.some((t) => t?.trim());
  return liste.find((x) => x.art === 'tag' && x.tag === heute && voll(x)) || liste.find((x) => x.art === 'dauerhaft' && voll(x));
}

export function pyramideKarte(liste) {
  const p = aktuellePyramide(liste);
  const knopf = (kinder) => el('button', { class: 'heute-karte heute-pyr', attrs: { type: 'button', 'aria-label': 'Pyramide öffnen' }, on: { click: () => go('pyramide') } }, kinder);
  if (!p) return knopf([el('p', { class: 'heute-pyr__leer', text: 'Noch keine Pyramide. Tippen zum Anlegen.' })]);
  const ebenen = p.ebenen.filter((t) => t?.trim());
  const n = ebenen.length;
  return knopf([
    el('div', { class: 'heute-karte__kopf' }, [el('div', {}, [el('h3', { text: 'Pyramide' }), el('small', { text: p.titel || (p.art === 'tag' ? 'Heute' : 'Dauerhaft') })])]),
    el('div', { class: 'pyr-stufen' }, [...ebenen].reverse().map((t, i) => el('div', {
      class: `pyr-stufe${20 + (80 * (i + 1)) / n < 72 ? ' pyr-stufe--hell' : ''}`, text: t, attrs: { style: `--b:${30 + (70 * (i + 1)) / n}%;--k:${20 + (80 * (i + 1)) / n}%` },
    }))),
  ]);
}
