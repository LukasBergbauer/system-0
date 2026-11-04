// Kopfbild: großes Foto oben (vollflächig, läuft an den Rändern weich in die Seite aus),
// darauf links der große Seitentitel in Serifenschrift, ein kurzer Strich und ein kursiver Spruch.
// kopfbild({ titel: 'Heute', bild: 'assets/bilder/heute-1.webp', ueber: 'Mittwoch, 4. November', spruch: 'Ein Schritt nach dem anderen.' })
// ueber = kleines Label über dem Titel (optional).
import { el } from './dom.js';

// Foto als Hintergrund eines leeren Elements (rein schmückend, für Screenreader unsichtbar).
function hintergrund(bild) {
  const node = el('div', { class: 'kopf__bild', attrs: { 'aria-hidden': 'true' } });
  node.style.backgroundImage = `url("${bild}")`;
  return node;
}

export function kopfbild({ titel, bild, ueber, spruch } = {}) {
  // Ohne Spruch (alle Seiten außer Heute) ist der Kopf niedriger, damit der Inhalt früher anfängt.
  const klasse = `kopf${bild ? '' : ' kopf--ohne-bild'}${spruch ? '' : ' kopf--kompakt'}`;
  return el('header', { class: klasse }, [
    bild && hintergrund(bild),
    el('div', { class: 'kopf__text' }, [
      ueber && el('p', { class: 'kopf__ueber label', text: ueber }),
      el('h1', { class: 'kopf__titel', text: titel }),
      el('hr', { class: 'strich' }),
      spruch && el('p', { class: 'kopf__spruch', text: spruch }),
    ]),
  ]);
}
