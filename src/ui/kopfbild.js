// Kopfbild: großes Bild oben (vollflächig, läuft unten weich in den Inhalt aus),
// darauf links der große Seitentitel in Serifenschrift, ein kurzer Strich und ein kursiver Spruch.
// kopfbild({ titel: 'Heute', bild: 'assets/bilder/heute-1.webp', ueber: 'Mittwoch, 4. November', spruch: 'Ein Schritt nach dem anderen.' })
// ueber = kleines Label über dem Titel (optional).
import { el } from './dom.js';

export function kopfbild({ titel, bild, ueber, spruch } = {}) {
  return el('header', { class: `kopf${bild ? '' : ' kopf--ohne-bild'}` }, [
    bild && el('img', {
      class: 'kopf__bild',
      attrs: { src: bild, alt: '', 'aria-hidden': 'true', decoding: 'async' },
    }),
    el('div', { class: 'kopf__text' }, [
      ueber && el('p', { class: 'kopf__ueber label', text: ueber }),
      el('h1', { class: 'kopf__titel', text: titel }),
      el('hr', { class: 'strich' }),
      spruch && el('p', { class: 'kopf__spruch', text: spruch }),
    ]),
  ]);
}
