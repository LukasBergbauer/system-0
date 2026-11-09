// Karte eines Bereichs: Name, Vision, Ziele (aktiv/pausiert) mit Balken, erreichte eingeklappt, „+ Ziel“.
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { fortschritt } from './data.js';

const DATUM = new Intl.DateTimeFormat('de-DE', { month: 'short', year: 'numeric' });

function zeile(z, onZiel) {
  const erledigt = z.schritte.filter((s) => s.erledigt_am).length;
  const sub = [
    z.status === 'pausiert' && 'Pausiert',
    z.zieldatum && `bis ${DATUM.format(new Date(`${z.zieldatum}T12:00`))}`,
    z.schritte.length ? `${erledigt} / ${z.schritte.length} Schritte` : 'noch keine Schritte',
  ].filter(Boolean).join(' · ');
  return el('button', { class: `ziel-zeile ziel-zeile--${z.status}`, attrs: { type: 'button' }, on: { click: () => onZiel(z) } }, [
    el('span', { class: 'ziel-zeile__titel', text: z.titel || 'Ohne Titel' }),
    el('small', { text: sub }),
    z.status !== 'erreicht' && el('span', { class: 'routine__balken', attrs: { 'aria-hidden': 'true' } }, [
      el('i', { attrs: { style: `width:${fortschritt(z) * 100}%` } }),
    ]),
  ]);
}

export function bereichKarte(b, { onBereich, onZiel, onNeu }) {
  const offen = b.ziele.filter((z) => z.status !== 'erreicht').sort((x, y) => (x.status === 'pausiert') - (y.status === 'pausiert'));
  const erreicht = b.ziele.filter((z) => z.status === 'erreicht');
  return el('article', { class: 'ziel-bereich' }, [
    el('button', { class: 'routine__kopf', attrs: { type: 'button', 'aria-label': `${b.name} bearbeiten` }, on: { click: () => onBereich(b) } }, [
      el('h2', { class: 'routine__name', text: b.name }),
      b.vision && el('p', { class: 'ziel-bereich__vision', text: `„${b.vision}“` }),
    ]),
    offen.length > 0 && el('div', { class: 'ziel-bereich__liste' }, offen.map((z) => zeile(z, onZiel))),
    erreicht.length > 0 && el('details', { class: 'ziel-bereich__erreicht' }, [
      el('summary', { text: `Erreicht (${erreicht.length})` }),
      el('div', { class: 'ziel-bereich__liste' }, erreicht.map((z) => zeile(z, onZiel))),
    ]),
    button({ text: '+ Ziel', variant: 'ghost', onClick: () => onNeu(b) }),
  ]);
}
