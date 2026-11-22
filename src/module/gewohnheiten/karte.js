// Karte je Gewohnheit (Vorbild „FocusHero“): Symbol, Name, Summe; rechts Pille „Heute“ (bzw. „Rückfall“) + Serie;
// darunter das Jahres-Raster in der Farbe der Gewohnheit. Name antippen = bearbeiten.
// Heute: Abhaken = an/aus, Anzahl/Zeit = +1 Schritt; Rechtsklick bzw. lang drücken = einen Schritt zurück.
import { el } from '../../ui/dom.js';
import { symbol } from '../../ui/symbol.js';
import { SCHRITT, wertAm, setzeWert, serie, summe, stufeAuf, stufeAb, tageOhne, ausloeserZaehlen } from './data.js';
import { oeffneRueckfall } from './rueckfall.js';
import { raster } from './raster.js';

// Lang drücken (iPhone, Safari kennt kein contextmenu) bzw. Rechtsklick = onZurueck; danach kein Klick.
function langDruecken(onZurueck, onClick) {
  let uhr; let lang = false;
  const los = () => { lang = false; uhr = setTimeout(() => { lang = true; onZurueck(); }, 550); };
  const halt = () => clearTimeout(uhr);
  return { pointerdown: los, pointerup: halt, pointerleave: halt, pointercancel: halt,
    contextmenu: (e) => { e.preventDefault(); if (!lang) { halt(); onZurueck(); } },
    click: () => { if (lang) lang = false; else onClick(); } };
}

const pille = (kinder, { klasse = '', label, onClick, onZurueck } = {}) => el(onClick ? 'button' : 'span', {
  class: `gew-pille ${klasse}`,
  attrs: { ...(onClick ? { type: 'button' } : {}), ...(label ? { 'aria-label': label } : {}) },
  on: onZurueck ? langDruecken(onZurueck, onClick) : onClick ? { click: onClick } : {},
}, kinder);

function heutePille(g) {
  const w = wertAm(g);
  const fertig = w >= g.ziel;
  const plus = SCHRITT[g.messart];
  const text = g.messart === 'haken' || !w ? 'Heute' : `${w}/${g.ziel}${g.messart === 'zeit' ? ' min' : ''}`;
  return pille([el('span', { class: `gew-pille__kreis${fertig ? ' an' : ''}` }), text], {
    klasse: fertig ? 'gew-pille--fertig' : '',
    label: g.messart === 'haken' ? (fertig ? 'Heute zurücknehmen' : 'Heute abhaken') : `Heute +${plus}`,
    onClick: () => setzeWert(g, g.messart === 'haken' ? (fertig ? 0 : 1) : w + plus),
    onZurueck: w ? () => setzeWert(g, w - plus) : null,
  });
}

export function karte(g, nr, { onEdit }) {
  const auf = g.art === 'auf';
  const s = auf ? serie(g) : tageOhne(g);
  const ausloeser = auf ? [] : ausloeserZaehlen(g);

  return el('article', { class: 'gew', attrs: { style: `--g: var(--gew-${(nr % 6) + 1})` } }, [
    el('div', { class: 'gew__kopf' }, [
      el('button', { class: 'gew__name', attrs: { type: 'button', 'aria-label': `${g.name} bearbeiten` }, on: { click: () => onEdit(g) } }, [
        el('span', { class: 'gew__symbol' }, [symbol('gewohnheiten')]),
        el('span', {}, [el('strong', { text: g.name }), el('small', { text: auf ? summe(g) : `${s} ${s === 1 ? 'Tag' : 'Tage'} ohne` })]),
      ]),
      auf ? heutePille(g) : pille('Rückfall', { label: 'Rückfall eintragen', onClick: () => oeffneRueckfall(g) }),
      pille([symbol('flamme'), String(s)], { klasse: 'gew-pille--serie', label: `${s} Tage in Folge` }),
    ]),
    raster((tag) => (auf ? stufeAuf(g, tag) : stufeAb(g, tag))),
    ausloeser.length > 0 && el('details', { class: 'gewohnheit__ausloeser' }, [
      el('summary', { text: 'Auslöser' }),
      el('ul', {}, ausloeser.map(([name, z]) => el('li', {}, [el('span', { text: name }), el('b', { text: `${z}×` })]))),
    ]),
  ]);
}
