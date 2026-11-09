// Ein Buch als Vollbild: Leseansicht (Cover, Titel, Sterne, Zusammenfassung schön gesetzt) oder Bearbeiten.
// oeffneBuch(id, { neu }) – neu: gleich bearbeiten, Titel fokussiert; bleibt es leer, wird es beim Schließen gelöscht.
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { STATUS, ladeBuch, coverUrl, loescheBuch } from './data.js';
import { zeigeMarkdown } from './markdown.js';
import { coverBild } from './cover-wahl.js';
import { bearbeiten } from './bearbeiten.js';

const DATUM = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'short', year: 'numeric' });
const tag = (d) => DATUM.format(new Date(`${d}T12:00`));

function zeitraum(b) {
  if (b.begonnen && b.beendet) return `${tag(b.begonnen)} – ${tag(b.beendet)}`;
  if (b.beendet) return `Gelesen ${tag(b.beendet)}`;
  if (b.begonnen) return `Seit ${tag(b.begonnen)}`;
  return '';
}

export async function oeffneBuch(id, { neu = false } = {}) {
  let buch = await ladeBuch(id);
  if (!buch) return;
  const holeBuch = async () => (buch = (await ladeBuch(id)) || buch);
  let form = null;

  const dialog = el('dialog', { class: 'durchlauf buch', attrs: { 'aria-label': buch.titel || 'Buch' } });
  const schliessen = () => dialog.open && dialog.close();

  function rahmen(label, mitte, fuss) {
    dialog.replaceChildren(el('div', { class: 'durchlauf__box buch__box' }, [
      el('header', { class: 'durchlauf__kopf' }, [
        el('span', { class: 'label', text: label }),
        el('button', { class: 'durchlauf__zu', text: '×', attrs: { type: 'button', 'aria-label': 'Schließen' }, on: { click: schliessen } }),
      ]),
      el('div', { class: 'buch__mitte' }, mitte),
      fuss && el('footer', { class: 'durchlauf__fuss' }, fuss),
    ]));
  }

  async function lesen() {
    if (form) { await form.sichern(); form = null; }
    await holeBuch();
    const sub = [STATUS.find((s) => s.id === buch.status)?.label, zeitraum(buch)].filter(Boolean).join(' · ');
    rahmen('Buch', [
      el('header', { class: 'buch-kopf' }, [
        coverBild(buch, await coverUrl(buch)),
        el('div', { class: 'buch-kopf__text' }, [
          el('h1', { class: 'buch-kopf__titel', text: buch.titel || 'Ohne Titel' }),
          buch.autor && el('p', { class: 'buch-kopf__autor', text: buch.autor }),
          buch.bewertung && el('p', { class: 'buch-kopf__sterne', text: '★'.repeat(buch.bewertung), attrs: { 'aria-label': `${buch.bewertung} von 5` } }),
          sub && el('small', { text: sub }),
        ]),
      ]),
      buch.zusammenfassung
        ? zeigeMarkdown(buch.zusammenfassung)
        : el('p', { class: 'app__note', text: 'Noch keine Zusammenfassung.' }),
    ], [button({ text: buch.zusammenfassung ? 'Bearbeiten' : 'Zusammenfassung schreiben', variant: 'primary', onClick: schreiben })]);
  }

  function schreiben() {
    form = bearbeiten({ buch, holeBuch });
    rahmen(neu ? 'Neues Buch' : 'Bearbeiten', form.element, [
      button({ text: 'Löschen', variant: 'ghost', onClick: loeschen }),
      button({ text: 'Fertig', variant: 'primary', onClick: () => { neu = false; lesen(); } }),
    ]);
  }

  async function loeschen() {
    if (buch.titel && !confirm(`„${buch.titel}“ löschen?`)) return;
    form = null;
    await loescheBuch(buch);
    schliessen();
  }

  dialog.addEventListener('close', async () => {
    dialog.remove();
    if (form) await form.sichern();
    const b = await ladeBuch(id);
    if (b && !b.titel && !b.zusammenfassung && !b.cover) await loescheBuch(b);
  });

  document.body.append(dialog);
  if (neu) {
    schreiben();
    dialog.showModal();
    requestAnimationFrame(() => form?.fokus());
  } else {
    await lesen();
    dialog.showModal();
  }
}
