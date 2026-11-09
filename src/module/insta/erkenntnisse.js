// Erkenntnisse „Was hat funktioniert, warum“ – kommen per Import vom eigenen Claude-Agenten. Belege = Schlüssel der Posts.
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { ladeErkenntnisse, loescheErkenntnis } from './data.js';
import { tag } from './post.js';

export async function erkenntnisse(posts, oeffne) {
  const liste = await ladeErkenntnisse();
  if (!liste.length) return el('p', { class: 'app__note', text: 'Noch keine Erkenntnisse. Über „Claude“ exportieren, mit deinem Agenten auswerten und die Antwort importieren.' });
  return el('div', { class: 'insta-erk' }, liste.map((e) => {
    const belege = (e.belege || '').split(',').map((s) => s.trim()).filter(Boolean)
      .map((s) => posts.find((p) => p.schluessel === s) || { titel: s });
    return el('article', { class: 'card insta-erk__karte' }, [
      el('p', { class: 'insta-erk__text', text: e.text }),
      e.warum && el('p', { class: 'insta-erk__warum', text: e.warum }),
      belege.length > 0 && el('div', { class: 'chips' }, belege.map((p) => el('button', {
        class: 'chip', text: p.titel || p.schluessel, attrs: { type: 'button', disabled: p.id ? null : '' }, on: { click: () => p.id && oeffne(p.id) },
      }))),
      el('div', { class: 'insta-erk__fuss' }, [
        el('small', { text: e.datum ? tag(e.datum) : '' }),
        button({ text: 'Löschen', variant: 'ghost', onClick: () => confirm('Erkenntnis löschen?') && loescheErkenntnis(e) }),
      ]),
    ]);
  }));
}
