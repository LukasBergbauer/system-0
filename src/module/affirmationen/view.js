// Ansicht „Affirmationen“: eine Karte je Ziel (Bereich, Warum), darin die Affirmationen, „+ Affirmation“.
// Zusatz '#/affirmationen/<id>' (Suche) öffnet diese Affirmation.
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { on } from '../../core/events.js';
import { go, zusatzNehmen } from '../../core/router.js';
import { TABELLEN, ladeAlles } from './data.js';
import { oeffneAffirmation } from './bearbeiten.js';

function karte(z) {
  return el('article', { class: 'ziel-bereich' }, [
    el('div', {}, [
      z.bereich && el('small', { class: 'aff-bereich', text: z.bereich.name }),
      el('h2', { class: 'routine__name', text: z.titel || 'Ohne Titel' }),
      z.warum && el('p', { class: 'ziel-bereich__vision', text: z.warum }),
    ]),
    z.affirmationen.length > 0 && el('div', { class: 'ziel-bereich__liste' }, z.affirmationen.map((a) => el('button', {
      class: `ziel-zeile aff-zeile${a.aktiv ? '' : ' ziel-zeile--pausiert'}`, attrs: { type: 'button' }, on: { click: () => oeffneAffirmation(z, a) },
    }, [el('span', { class: 'ziel-zeile__titel', text: a.text }), !a.aktiv && el('small', { text: 'nicht auf Heute' })]))),
    button({ text: '+ Affirmation', variant: 'ghost', onClick: () => oeffneAffirmation(z) }),
  ]);
}

export function affirmationenAnsicht({ signal }) {
  const box = el('div', { class: 'ziele' });
  let zusatz = zusatzNehmen();
  let stand = 0;

  async function zeichne() {
    const nr = ++stand;
    const ziele = await ladeAlles();
    if (nr !== stand || signal.aborted) return;
    if (zusatz) {
      const z = ziele.find((x) => x.affirmationen.some((a) => a.id === zusatz));
      if (z) oeffneAffirmation(z, z.affirmationen.find((a) => a.id === zusatz));
      zusatz = null;
    }
    box.replaceChildren(...(ziele.length
      ? [el('div', { class: 'ziele__raster' }, ziele.map(karte))]
      : [
        el('p', { class: 'app__note', text: 'Noch keine Schritte. Affirmationen gehören zu einem Schritt deiner Visionen – lege zuerst einen an.' }),
        button({ text: 'Zu den Visionen', variant: 'primary', onClick: () => go('ziele') }),
      ]));
  }

  on('daten', ({ table }) => TABELLEN.includes(table) && zeichne(), { signal });
  zeichne();
  return box;
}
