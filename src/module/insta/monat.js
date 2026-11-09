// Monatsraster: geplante und gepostete Posts an ihrem Tag. Pfeile für vor/zurück. Antippen öffnet den Post.
// monat(posts, oeffne) → Element (merkt sich den gewählten Monat bis zum Neuladen der Seite).
import { el } from '../../ui/dom.js';
import { heuteISO } from './data.js';

let versatz = 0; // Monate ab jetzt
const MONAT = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' });
const iso = (d) => d.toLocaleDateString('sv');

export function monat(posts, oeffne) {
  const box = el('div', { class: 'insta-monat' });
  function zeichne() {
    const h = new Date();
    const erster = new Date(h.getFullYear(), h.getMonth() + versatz, 1);
    const start = new Date(erster);
    start.setDate(1 - ((erster.getDay() + 6) % 7)); // Montag davor
    const heute = heuteISO();
    const tage = Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
    const wochen = tage[35].getMonth() === erster.getMonth() ? tage : tage.slice(0, 35);

    box.replaceChildren(
      el('div', { class: 'insta-monat__kopf' }, [
        el('button', { class: 'insta-pfeil', text: '‹', attrs: { type: 'button', 'aria-label': 'Monat zurück' }, on: { click: () => { versatz--; zeichne(); } } }),
        el('strong', { text: MONAT.format(erster) }),
        el('button', { class: 'insta-pfeil', text: '›', attrs: { type: 'button', 'aria-label': 'Monat vor' }, on: { click: () => { versatz++; zeichne(); } } }),
      ]),
      el('div', { class: 'insta-monat__raster' }, [
        ...['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((t) => el('small', { class: 'insta-monat__wt', text: t })),
        ...wochen.map((d) => {
          const tag = iso(d);
          const hier = posts.filter((p) => p.datum === tag);
          return el('div', { class: `insta-tag${d.getMonth() !== erster.getMonth() ? ' fremd' : ''}${tag === heute ? ' heute' : ''}` }, [
            el('small', { text: String(d.getDate()) }),
            ...hier.map((p) => el('button', { class: `insta-tag__post ${p.status}`, text: p.titel || 'Ohne Titel', attrs: { type: 'button' }, on: { click: () => oeffne(p.id) } })),
          ]);
        }),
      ]),
    );
  }
  zeichne();
  return box;
}
