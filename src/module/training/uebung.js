// Seite „Übung“: Name (eigene) bzw. Verweis ins PhysioZentrum, Messung, eigene Notiz, Bestwert, Verlauf-Linie, Liste der Einheiten.
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { input } from '../../ui/input.js';
import { list, listRow } from '../../ui/list.js';
import { kacheln, kachel } from '../../ui/kachel.js';
import { UEBUNGEN, MESSUNG, aendere, loescheUebung } from './daten.js';
import { verlauf, bestwert, saetzeText, datumText } from './rechnen.js';

const SVG = 'http://www.w3.org/2000/svg';

// Linie der Bestwerte je Einheit (älteste links), ab 2 Punkten.
function linie(punkte) {
  if (punkte.length < 2) return null;
  const werte = punkte.map((p) => p.wert);
  const min = Math.min(...werte), max = Math.max(...werte), spanne = max - min || 1;
  const xy = punkte.map((p, i) => `${(i / (punkte.length - 1)) * 300},${76 - ((p.wert - min) / spanne) * 68}`);
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('class', 'training__linie');
  svg.setAttribute('viewBox', '-4 0 308 84');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = `<polyline points="${xy.join(' ')}"/>${xy.map((p) => `<circle cx="${p.split(',')[0]}" cy="${p.split(',')[1]}" r="3"/>`).join('')}`;
  return svg;
}

function messungWahl(u) {
  const an = new Set(u.messung || []);
  return el('div', { class: 'chips' }, MESSUNG.map((m) => el('button', {
    class: 'chip', text: m.label,
    attrs: { type: 'button', 'aria-pressed': String(an.has(m.id)) },
    on: { click: () => {
      an.has(m.id) ? an.delete(m.id) : an.add(m.id);
      if (!an.size) an.add('wdh');
      aendere(UEBUNGEN, { id: u.id, messung: MESSUNG.map((x) => x.id).filter((k) => an.has(k)) });
    } },
  })));
}

export function uebungSeite(id, { daten, zurueck, oeffne }) {
  const u = daten.uebungen.get(id);
  if (!u) return el('div', { class: 'training__seite' }, [
    button({ text: '‹ Training', variant: 'ghost', onClick: zurueck }),
    el('p', { class: 'app__note', text: 'Diese Übung gibt es nicht mehr.' }),
  ]);
  const v = verlauf(u, daten.einheiten);
  const best = bestwert(v.flatMap((x) => x.saetze), u.messung);
  const punkte = v.map((x) => x.best).filter(Boolean).slice(0, 20).reverse();

  const notiz = el('textarea', { class: 'field__input training__notiz', attrs: { rows: 3, placeholder: 'Eigene Hinweise, z. B. Sitzhöhe 4' } });
  notiz.value = u.notiz || '';
  notiz.addEventListener('change', () => aendere(UEBUNGEN, { id, notiz: notiz.value.trim() }));

  let kopf;
  if (u.physio) {
    kopf = [
      el('h2', { class: 'training__titel', text: u.name }),
      u.physio.kurz && el('p', { class: 'training__zuletzt', text: u.physio.kurz }),
      button({ text: 'Im PhysioZentrum öffnen', onClick: () => { location.hash = `#/physio/${encodeURIComponent(u.physio_id)}`; } }),
    ];
  } else {
    const f = input({ label: 'Name', value: u.name });
    f.querySelector('input').addEventListener('change', (ev) => ev.target.value.trim() && aendere(UEBUNGEN, { id, name: ev.target.value.trim() }));
    kopf = [f, u.physio_id && el('p', { class: 'app__note', text: 'Der Eintrag im PhysioZentrum wurde gelöscht.' })];
  }

  async function loeschen() {
    if (!confirm(`„${u.name}“ und alle ihre Sätze löschen?`)) return;
    await loescheUebung(u, daten.einheiten);
    zurueck();
  }

  return el('div', { class: 'training__seite' }, [
    button({ text: '‹ Training', variant: 'ghost', onClick: zurueck }),
    el('section', { class: 'card training__kopf' }, [
      ...kopf,
      el('div', { class: 'field' }, [el('span', { class: 'field__label', text: 'Gemessen wird' }), messungWahl(u)]),
      el('div', { class: 'field' }, [el('span', { class: 'field__label', text: 'Notiz' }), notiz]),
    ]),
    kacheln([
      kachel({ symbol: 'flamme', titel: 'Bestwert', wert: best?.text ?? '–' }),
      kachel({ symbol: 'training', titel: 'Gemacht', wert: `${v.length}×` }),
    ]),
    punkte.length > 1 && el('section', { class: 'card' }, [el('h2', { class: 'card__title', text: 'Verlauf' }), linie(punkte)]),
    v.length > 0 && el('section', { class: 'card' }, [list(v.map((x) => listRow({
      title: datumText(x.einheit.datum), sub: saetzeText(x.saetze), end: x.best?.text ?? '',
      onClick: () => oeffne('einheit', x.einheit.id),
    })))]),
    button({ text: 'Übung löschen', variant: 'ghost', onClick: loeschen }),
  ]);
}
