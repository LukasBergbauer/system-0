// Kopfbild: großes Bild oben (vollflächig, läuft unten weich in den Inhalt aus),
// darauf links der große Seitentitel in Serifenschrift, ein kurzer Strich und ein kursiver Spruch.
// kopfbild({ titel: 'Heute', bild: 'assets/bilder/heute.svg', spruch: 'Ein Schritt nach dem anderen.' })
import { el } from './dom.js';

export function kopfbild({ titel, bild, spruch } = {}) {
  return el('header', { class: `kopf${bild ? '' : ' kopf--ohne-bild'}` }, [
    bild && el('img', {
      class: 'kopf__bild',
      attrs: { src: bild, alt: '', 'aria-hidden': 'true', decoding: 'async' },
    }),
    el('div', { class: 'kopf__text' }, [
      el('h1', { class: 'kopf__titel', text: titel }),
      el('hr', { class: 'strich' }),
      spruch && el('p', { class: 'kopf__spruch', text: spruch }),
    ]),
  ]);
}
