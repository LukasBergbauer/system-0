// Kopfbild: Seitenkopf mit zarter Illustration, Seitentitel und optional einem Spruch.
// Das Bild hat keinen eigenen Hintergrund und läuft weich in die Seite aus (Maske in kopfbild.css).
// kopfbild({ titel: 'Heute', bild: 'assets/bilder/heute.svg', spruch: { jp: '一期一会', de: 'Jede Begegnung ist einmalig.' } })
import { el } from './dom.js';

export function kopfbild({ titel, bild, spruch } = {}) {
  return el('header', { class: `kopf${bild ? '' : ' kopf--ohne-bild'}` }, [
    bild && el('img', {
      class: 'kopf__bild',
      attrs: { src: bild, alt: '', 'aria-hidden': 'true', decoding: 'async' },
    }),
    el('div', { class: 'kopf__text' }, [
      el('h1', { class: 'kopf__titel', text: titel }),
      spruch && el('p', { class: 'kopf__spruch' }, [
        el('span', { class: 'kopf__jp', text: spruch.jp, attrs: { lang: 'ja' } }),
        el('span', { class: 'kopf__de', text: spruch.de }),
      ]),
    ]),
  ]);
}
