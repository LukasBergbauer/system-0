// Ein Post als Vollbild: Kurzfassung (Hook, Skript, CTA, Caption + Hashtags kopieren, Zahlen) oder Bearbeiten.
// oeffnePost(id, { neu }) – neu: gleich bearbeiten; bleibt er leer, wird er beim Schließen gelöscht.
import { abschnitt as kasten } from '../../ui/abschnitt.js';
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { zeigeMarkdown } from '../../ui/markdown.js';
import { STATUS, ARTEN, ZAHLEN, label, ladePost, loeschePost } from './data.js';
import { postForm } from './post-form.js';

const DATUM = new Intl.DateTimeFormat('de-DE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
export const tag = (d) => DATUM.format(new Date(`${d}T12:00`));
const zahl = new Intl.NumberFormat('de-DE');

function abschnitt(titel, inhalt) {
  return inhalt && el('section', { class: 'insta-abschnitt' }, [kasten({ titel, tag: 'h3', symbol: 'insta' }), inhalt]);
}

function zahlenRaster(z) {
  if (!z || !Object.keys(z).length) return null;
  const aktion = ['likes', 'kommentare', 'gespeichert', 'geteilt'].reduce((s, k) => s + (z[k] || 0), 0);
  const basis = z.reichweite || z.aufrufe;
  const kacheln = ZAHLEN.filter((x) => z[x.id] != null).map((x) => el('div', { class: 'insta-kz' }, [el('b', { text: zahl.format(z[x.id]) }), el('small', { text: x.label })]));
  if (basis) kacheln.push(el('div', { class: 'insta-kz' }, [el('b', { text: `${(aktion / basis * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })} %` }), el('small', { text: 'Interaktion' })]));
  return el('div', { class: 'insta-kz-raster' }, kacheln);
}

export async function oeffnePost(id, { neu = false } = {}) {
  let post = await ladePost(id);
  if (!post) return;
  let form = null;
  const dialog = el('dialog', { class: 'durchlauf buch insta-post', attrs: { 'aria-label': post.titel || 'Post' } });
  const schliessen = () => dialog.open && dialog.close();

  function rahmen(titel, mitte, fuss) {
    dialog.replaceChildren(el('div', { class: 'durchlauf__box buch__box' }, [
      el('header', { class: 'durchlauf__kopf' }, [
        el('span', { class: 'label', text: titel }),
        el('button', { class: 'durchlauf__zu', text: '×', attrs: { type: 'button', 'aria-label': 'Schließen' }, on: { click: schliessen } }),
      ]),
      el('div', { class: 'buch__mitte' }, mitte),
      el('footer', { class: 'durchlauf__fuss' }, fuss),
    ]));
  }

  async function ansehen() {
    if (form) { await form.sichern(); form = null; }
    post = (await ladePost(id)) || post;
    const sub = [label(ARTEN, post.art), label(STATUS, post.status), post.datum && tag(post.datum)].filter(Boolean).join(' · ');
    const posting = [post.caption, post.hashtags].filter(Boolean).join('\n\n');
    const kopieren = posting && button({ text: 'Caption + Hashtags kopieren', variant: 'ghost', onClick: async () => {
      try { await navigator.clipboard.writeText(posting); kopieren.textContent = 'Kopiert ✓'; } catch { kopieren.textContent = 'Kopieren nicht möglich'; }
    } });
    const leer = !post.hook && !post.skript && !post.caption;
    rahmen('Post', [
      el('header', { class: 'insta-kopf' }, [
        el('h1', { class: 'buch-kopf__titel', text: post.titel || 'Ohne Titel' }),
        el('small', { text: sub }),
      ]),
      post.hook && el('blockquote', { class: 'insta-hook', text: post.hook }),
      abschnitt('Skript', post.skript && zeigeMarkdown(post.skript, 'buch-text insta-text')),
      abschnitt('Call to Action', post.cta && el('p', { text: post.cta })),
      abschnitt('Caption', posting && el('div', { class: 'insta-caption' }, [el('p', { text: posting }), kopieren])),
      abschnitt('Zahlen', zahlenRaster(post.zahlen)),
      abschnitt('Notiz', post.notiz && el('p', { text: post.notiz })),
      leer && el('p', { class: 'app__note', text: 'Noch kein Skript. Mit Claude planen und über „Claude“ importieren oder selbst schreiben.' }),
    ], [button({ text: 'Bearbeiten', variant: 'primary', onClick: bearbeiten })]);
  }

  function bearbeiten() {
    form = postForm({ post });
    rahmen(neu ? 'Neuer Post' : 'Bearbeiten', form.element, [
      button({ text: 'Löschen', variant: 'ghost', onClick: loeschen }),
      button({ text: 'Fertig', variant: 'primary', onClick: () => { neu = false; ansehen(); } }),
    ]);
  }

  async function loeschen() {
    if (post.titel && !confirm(`„${post.titel}“ löschen?`)) return;
    form = null;
    await loeschePost(post);
    schliessen();
  }

  dialog.addEventListener('close', async () => {
    dialog.remove();
    if (form) await form.sichern();
    const p = await ladePost(id);
    if (p && !p.titel && !p.hook && !p.skript && !p.caption) await loeschePost(p);
  });

  document.body.append(dialog);
  if (neu) { bearbeiten(); dialog.showModal(); requestAnimationFrame(() => form?.fokus()); } else { await ansehen(); dialog.showModal(); }
}
