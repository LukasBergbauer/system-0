// Cover-Bereich im Bearbeiten: Vorschau, „Foto wählen“, „Cover suchen“ (Open Library), „Entfernen“.
// coverWahl({ buch, holeBuch, suchwort }) → Element. holeBuch() liefert den gespeicherten Stand, suchwort() Titel/Autor aus den Feldern.
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { coverUrl, setzeCover, entferneCover } from './data.js';
import { verkleinere, sucheCover, ladeCover } from './cover.js';

export function coverBild(buch, url, klasse = 'buch-cover') {
  return url
    ? el('img', { class: klasse, attrs: { src: url, alt: '' } })
    : el('div', { class: `${klasse} ${klasse}--leer`, attrs: { 'aria-hidden': 'true' } }, [el('span', { text: buch.titel || 'Buch' })]);
}

export function coverWahl({ buch, holeBuch, suchwort }) {
  const vorschau = el('div', { class: 'buch-wahl__vorschau' });
  const meldung = el('p', { class: 'buch-wahl__meldung', attrs: { 'aria-live': 'polite' } });
  const treffer = el('div', { class: 'buch-wahl__treffer' });
  const datei = el('input', { attrs: { type: 'file', accept: 'image/*', hidden: true } });

  async function zeige() {
    buch = await holeBuch();
    vorschau.replaceChildren(coverBild(buch, await coverUrl(buch)));
    weg.style.display = buch.cover ? '' : 'none';
  }

  async function nimm(blobPromise) {
    meldung.textContent = 'Lädt …';
    try {
      await setzeCover(buch, await blobPromise);
      meldung.textContent = '';
      treffer.replaceChildren();
      await zeige();
    } catch (err) {
      meldung.textContent = err.message || 'Hat nicht geklappt';
    }
  }

  datei.addEventListener('change', () => {
    if (datei.files[0]) nimm(verkleinere(datei.files[0]));
    datei.value = '';
  });

  async function suchen() {
    const { titel, autor } = suchwort();
    if (!titel) { meldung.textContent = 'Erst einen Titel eintragen.'; return; }
    if (!navigator.onLine) { meldung.textContent = 'Suche geht nur mit Internet.'; return; }
    meldung.textContent = 'Sucht …';
    treffer.replaceChildren();
    try {
      const liste = await sucheCover(titel, autor);
      meldung.textContent = liste.length ? 'Antippen zum Übernehmen:' : 'Nichts gefunden. Autor weglassen oder eigenes Foto nehmen.';
      treffer.replaceChildren(...liste.map((t) => el('button', {
        class: 'buch-wahl__treffer-knopf', attrs: { type: 'button', 'aria-label': `${t.titel} ${t.autor}` },
        on: { click: () => nimm(ladeCover(t.url)) },
      }, [el('img', { attrs: { src: t.url.replace('-L.', '-M.'), alt: '', loading: 'lazy' } })])));
    } catch {
      meldung.textContent = 'Suche hat nicht geklappt.';
    }
  }

  const weg = button({ text: 'Entfernen', variant: 'ghost', onClick: async () => { await entferneCover(buch); zeige(); } });
  zeige();
  return el('div', { class: 'field buch-wahl' }, [
    el('span', { class: 'field__label', text: 'Cover' }),
    el('div', { class: 'buch-wahl__zeile' }, [
      vorschau,
      el('div', { class: 'buch-wahl__knoepfe' }, [
        button({ text: 'Cover suchen', variant: 'ghost', onClick: suchen }),
        button({ text: 'Foto wählen', variant: 'ghost', onClick: () => datei.click() }),
        weg,
      ]),
    ]),
    meldung, treffer, datei,
  ]);
}
