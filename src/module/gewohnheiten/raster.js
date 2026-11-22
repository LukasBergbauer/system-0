// Jahres-Raster wie bei GitHub: Spalten = Wochen Jan–Dez, Zeilen = Mo–So, Kästchen je nach Stufe 0–4.
// stufe(tag) → 0 (leer) … 4 (kräftig). iPhone: waagrecht wischbar, startet bei heute.
import { el } from '../../ui/dom.js';
import { tagISO } from './data.js';

const MONAT = new Intl.DateTimeFormat('de-DE', { month: 'short' });
const LANG = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long' });

export function raster(stufe) {
  const jahr = new Date().getFullYear();
  const heute = tagISO();
  const start = new Date(jahr, 0, 1 - ((new Date(jahr, 0, 1).getDay() + 6) % 7)); // Montag vor/am 1. Januar
  const zellen = [];
  const monate = [];
  let heuteZelle = null;
  for (let i = 0, d = start; d.getFullYear() <= jahr; i++, d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)) {
    const tag = tagISO(d);
    const imJahr = d.getFullYear() === jahr;
    if (imJahr && d.getDate() === 1) monate.push(el('span', { text: MONAT.format(d).replace('.', ''), attrs: { style: `grid-column:${Math.floor(i / 7) + 1}` } }));
    const s = imJahr && tag <= heute ? stufe(tag) : 0;
    const z = el('i', { class: `raster__z${s ? ` s${s}` : ''}${imJahr ? '' : ' raster__z--aus'}${tag === heute ? ' raster__z--heute' : ''}`, attrs: { title: imJahr ? LANG.format(d) : '' } });
    if (tag === heute) heuteZelle = z;
    zellen.push(z);
  }

  const wisch = el('div', { class: 'raster__wisch' }, [
    el('div', { class: 'raster__monate', attrs: { 'aria-hidden': 'true' } }, monate),
    el('div', { class: 'raster__zellen', attrs: { role: 'img', 'aria-label': `Jahr ${jahr}` } }, zellen),
  ]);
  requestAnimationFrame(() => {
    if (heuteZelle && wisch.scrollWidth > wisch.clientWidth) wisch.scrollLeft = heuteZelle.offsetLeft - wisch.clientWidth + 4 * heuteZelle.offsetWidth;
  });
  return el('div', { class: 'raster' }, [
    el('div', { class: 'raster__tage', attrs: { 'aria-hidden': 'true' } }, ['', 'Mo', '', 'Mi', '', 'Fr', '', ''].map((t) => el('span', { text: t }))),
    wisch,
  ]);
}
