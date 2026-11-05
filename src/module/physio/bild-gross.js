// Großansicht eines Bilds (in Farbe), eigener Schritt im Verlauf: Zurück-Wischen schließt sie.
// Darunter „Bild 2 von 3“, „Als Titelbild“ (nur wenn es nicht schon das erste ist) und „Löschen“ (mit Rückfrage).
// bilder = alle Bilder des Punkts in ihrer Reihenfolge. fertig() nach dem Löschen (→ zurück zum Eintrag).
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { bildUrl, setzeTitelbild, loescheBild } from './bilder.js';

export function bildGross({ bild, bilder, fertig }) {
  const nr = bilder.findIndex((b) => b.id === bild.id) + 1;
  const img = el('img', { class: 'mm-bildgross__bild', attrs: { alt: '' } });
  if (bild.breite && bild.hoehe) img.style.aspectRatio = `${bild.breite} / ${bild.hoehe}`;
  const hinweis = el('p', { class: 'app__note', text: '' });

  bildUrl(bild, 'gross').then((url) => {
    if (url) img.src = url;
    else hinweis.textContent = 'Bild ist noch nicht auf diesem Gerät – es lädt, sobald Internet da ist.';
  });

  let laeuft = false;
  const titel = nr > 1 && button({
    text: 'Als Titelbild',
    onClick: async () => {
      if (laeuft) return;
      laeuft = true;
      await setzeTitelbild(bild, bilder);
    },
  });
  const weg = el('button', {
    class: 'btn btn--ghost mm-eintrag__loeschen', text: 'Löschen', attrs: { type: 'button' },
    on: {
      click: async () => {
        if (laeuft || !confirm('Dieses Bild löschen?')) return;
        laeuft = true;
        await loescheBild(bild);
        fertig();
      },
    },
  });

  return el('div', { class: 'mm-bildgross' }, [
    img,
    el('p', { class: 'label', text: nr === 1 ? `Titelbild · Bild 1 von ${bilder.length}` : `Bild ${nr} von ${bilder.length}` }),
    hinweis,
    el('div', { class: 'mm-bildgross__aktionen' }, [titel, weg]),
  ]);
}
