// Bildleiste oben im Eintrag: Bilder in Farbe, waagrecht wischbar, das erste ist das Titelbild.
// Am Ende „+ Bild“: iPhone bietet Kamera oder Mediathek an, mehrere auf einmal möglich.
// Antippen eines Bilds → oeffneBild(bild). Platz je Bild wird über breite/hoehe schon vor dem Laden reserviert.
// const g = galerie({ eintragId, bilder, oeffneBild }); g.zeige(bilder) bei Änderungen.
import { el } from '../../ui/dom.js';
import { bildUrl, fuegeBilderHinzu } from './bilder.js';

export function galerie({ eintragId, bilder: anfang = [], oeffneBild }) {
  let bilder = anfang;
  let wartend = 0; // Bilder, die gerade verkleinert und gespeichert werden
  const kacheln = new Map(); // bild.id → Knopf (bleibt erhalten, damit nichts flackert)

  const auswahl = el('input', {
    class: 'mm-galerie__datei',
    attrs: { type: 'file', accept: 'image/*', multiple: true, 'aria-hidden': 'true', tabindex: '-1' },
  });
  const plus = el('button', {
    class: 'mm-galerie__plus', text: '+ Bild', attrs: { type: 'button' },
    on: { click: () => auswahl.click() },
  });
  const leiste = el('div', { class: 'mm-galerie' });
  const element = el('div', { class: 'mm-galerie__huelle' }, [leiste, auswahl]);

  auswahl.addEventListener('change', async () => {
    const dateien = [...auswahl.files];
    auswahl.value = ''; // dieselben Fotos sollen nochmal wählbar sein
    if (!dateien.length) return;
    wartend += dateien.length;
    zeichne();
    try {
      await fuegeBilderHinzu(eintragId, dateien, bilder);
    } finally {
      wartend -= dateien.length;
      zeichne();
    }
  });

  function kachel(bild) {
    let knopf = kacheln.get(bild.id);
    if (knopf) return knopf;
    const img = el('img', { attrs: { alt: '', decoding: 'async' } });
    knopf = el('button', {
      class: 'mm-galerie__bild mm-galerie__bild--laedt', attrs: { type: 'button', 'aria-label': 'Bild groß ansehen' },
      on: { click: () => oeffneBild(bild) },
    }, [img, el('span', { class: 'mm-galerie__titel label', text: 'Titelbild' })]);
    if (bild.breite && bild.hoehe) knopf.style.aspectRatio = `${bild.breite} / ${bild.hoehe}`;
    kacheln.set(bild.id, knopf);
    bildUrl(bild, 'gross').then((url) => {
      if (!url) return knopf.classList.add('mm-galerie__bild--fehlt'); // noch nicht im Gerät und offline
      img.src = url;
      knopf.classList.remove('mm-galerie__bild--laedt');
    });
    return knopf;
  }

  function zeichne() {
    for (const [id, knopf] of kacheln) {
      // gelöscht – oder fehlte beim letzten Mal (offline): dann neu aufbauen und nochmal laden
      if (!bilder.some((b) => b.id === id) || knopf.classList.contains('mm-galerie__bild--fehlt')) kacheln.delete(id);
      else knopf.classList.remove('mm-galerie__bild--erstes');
    }
    const kn = bilder.map(kachel);
    kn[0]?.classList.add('mm-galerie__bild--erstes');
    const platzhalter = Array.from({ length: wartend }, () =>
      el('div', { class: 'mm-galerie__bild mm-galerie__bild--neu', text: 'Wird hinzugefügt …' }));
    leiste.replaceChildren(...kn, ...platzhalter, plus);
    leiste.classList.toggle('mm-galerie--leer', !bilder.length && !wartend);
  }

  zeichne();
  return {
    element,
    zeige(neu) {
      bilder = neu;
      zeichne();
    },
  };
}
