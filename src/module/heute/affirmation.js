// Heute: „Affirmation des Tages“ – aus den aktiven Affirmationen aktiver Ziele, für den Tag fest gewählt.
// Antippen zeigt die nächste (nur bis zum Neuladen). Liest nur Rohdaten (affirmationen, lebensziele); ohne Affirmation nichts.
import { el } from '../../ui/dom.js';
import { symbol } from '../../ui/symbol.js';

let weiter = 0;

function tagesZahl() {
  const d = new Date().toDateString();
  let h = 0;
  for (const c of d) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

export function affirmationKarte({ affirmationen, ziele }) {
  const aktiv = new Map(ziele.filter((z) => z.status === 'aktiv').map((z) => [z.id, z]));
  const pool = affirmationen.filter((a) => a.aktiv && aktiv.has(a.lebensziel_id)).sort((a, b) => a.reihenfolge - b.reihenfolge);
  if (!pool.length) return null;
  const a = pool[(tagesZahl() + weiter) % pool.length];
  const z = aktiv.get(a.lebensziel_id);

  const karte = el('button', { class: 'heute-karte heute-aff', attrs: { type: 'button', 'aria-label': 'Nächste Affirmation' } }, [
    el('div', { class: 'heute-karte__kopf' }, [el('div', {}, [el('h3', { text: 'Affirmation des Tages' }), el('small', { text: pool.length > 1 ? 'Antippen für die nächste' : '' })]),
      el('span', { class: 'heute-kz__symbol' }, [symbol('affirmation')])]),
    el('p', { class: 'heute-aff__text', text: a.text }),
    el('small', { text: [z.titel, z.warum].filter(Boolean).join(' · ') }),
  ]);
  karte.addEventListener('click', () => {
    if (pool.length < 2) return;
    weiter++;
    karte.replaceWith(affirmationKarte({ affirmationen, ziele }));
  });
  return karte;
}
