// Karte eines Bereichs: Name, Vision, Ziele (aktiv/pausiert) mit Balken, erreichte eingeklappt, „+ Ziel“.
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { symbol } from '../../ui/symbol.js';
import { fortschritt } from './data.js';

const DATUM = new Intl.DateTimeFormat('de-DE', { month: 'short', year: 'numeric' });

// Schritt als Block: Zeile (öffnet den Schritt) und darunter seine Affirmationen (antippen → bearbeiten).
function zeile(z, onZiel, onAff) {
  const erledigt = z.schritte.filter((s) => s.erledigt_am).length;
  const sub = [
    z.status === 'pausiert' && 'Pausiert',
    z.zieldatum && `bis ${DATUM.format(new Date(`${z.zieldatum}T12:00`))}`,
    z.schritte.length ? `${erledigt} / ${z.schritte.length} Teilschritte` : 'noch keine Teilschritte',
  ].filter(Boolean).join(' · ');
  const knopf = el('button', { class: 'ziel-zeile', attrs: { type: 'button' }, on: { click: () => onZiel(z) } }, [
    el('span', { class: 'ziel-zeile__titel', text: z.titel || 'Ohne Titel' }),
    el('small', { text: sub }),
    z.status !== 'erreicht' && el('span', { class: 'routine__balken', attrs: { 'aria-hidden': 'true' } }, [
      el('i', { attrs: { style: `width:${fortschritt(z) * 100}%` } }),
    ]),
  ]);
  return el('div', { class: `ziel-block ziel-block--${z.status}` }, [
    knopf,
    ...z.affirmationen.map((a) => el('button', {
      class: `ziel-aff${a.aktiv ? '' : ' ziel-aff--aus'}`, attrs: { type: 'button' }, on: { click: () => onAff(z, a) },
    }, [symbol('affirmation'), el('span', { text: a.text })])),
  ]);
}

export function bereichKarte(b, { onBereich, onZiel, onAff, onNeu }) {
  const offen = b.ziele.filter((z) => z.status !== 'erreicht').sort((x, y) => (x.status === 'pausiert') - (y.status === 'pausiert'));
  const erreicht = b.ziele.filter((z) => z.status === 'erreicht');
  return el('article', { class: 'ziel-bereich' }, [
    el('button', { class: 'routine__kopf', attrs: { type: 'button', 'aria-label': `${b.name} bearbeiten` }, on: { click: () => onBereich(b) } }, [
      el('h2', { class: 'routine__name', text: b.name }),
      b.vision && el('p', { class: 'ziel-bereich__vision', text: `„${b.vision}“` }),
    ]),
    offen.length > 0 && el('div', { class: 'ziel-bereich__liste' }, offen.map((z) => zeile(z, onZiel, onAff))),
    erreicht.length > 0 && el('details', { class: 'ziel-bereich__erreicht' }, [
      el('summary', { text: `Erreicht (${erreicht.length})` }),
      el('div', { class: 'ziel-bereich__liste' }, erreicht.map((z) => zeile(z, onZiel, onAff))),
    ]),
    button({ text: '+ Schritt', variant: 'ghost', onClick: () => onNeu(b) }),
  ]);
}
