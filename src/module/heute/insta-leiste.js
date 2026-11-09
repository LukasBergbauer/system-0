// Heute: „Insta“ – Posts, die für heute geplant und noch nicht gepostet sind. Antippen → '#/insta/<id>'.
// Liest nur Rohdaten (insta_posts).
import { el } from '../../ui/dom.js';
import { symbol } from '../../ui/symbol.js';
import { go } from '../../core/router.js';
import { tagISO } from './rechnen.js';

export function instaLeiste(posts) {
  const heute = tagISO(new Date());
  const reihe = posts.filter((p) => p.datum === heute && p.status !== 'gepostet');
  if (!reihe.length) return null;
  return el('article', { class: 'heute-karte heute-routinen' }, [
    el('div', { class: 'heute-karte__kopf' }, [el('div', {}, [el('h3', { text: 'Insta' }), el('small', { text: 'heute geplant' })])]),
    el('div', { class: 'heute-routinen__liste' }, reihe.map((p) => el('button', { class: 'heute-routine', attrs: { type: 'button' }, on: { click: () => go(`insta/${p.id}`) } }, [
      el('span', { class: 'heute-kz__symbol' }, [symbol('insta')]),
      el('span', {}, [p.titel || 'Post', el('small', { text: p.status === 'geplant' ? 'bereit zum Posten' : 'noch nicht fertig' })]),
    ]))),
  ]);
}
