// Ansicht „Insta“: Ideen-Leiste mit „+“, dezente Knöpfe Claude · Hashtag-Sets, Umschalter Planer · Monat · Erkenntnisse.
// Zusatz '#/insta/<id>' (Suche, Heute) öffnet diesen Post.
import { leiste } from '../../ui/leiste.js';
import { el } from '../../ui/dom.js';
import { abschnitt } from '../../ui/abschnitt.js';
import { button } from '../../ui/button.js';
import { tabs } from '../../ui/tabs.js';
import { list, listItem } from '../../ui/list.js';
import { checkbox } from '../../ui/checkbox.js';
import { on } from '../../core/events.js';
import { zusatzNehmen } from '../../core/router.js';
import { POSTS, SETS, ERKENNTNISSE, STATUS, ladePosts, ladePost, neuerPost, speicherePost } from './data.js';
import { oeffnePost } from './post.js';
import { oeffneClaude } from './claude.js';
import { oeffneSets } from './hashtags.js';
import { monat } from './monat.js';
import { erkenntnisse } from './erkenntnisse.js';

const ANSICHTEN = [{ id: 'planer', label: 'Planer' }, { id: 'monat', label: 'Monat' }, { id: 'erkenntnisse', label: 'Erkenntnisse' }];
let ansicht = 'planer';

// Zeile: nur die Überschrift („Video 01 – …“) mit Haken „gefilmt“ (nicht bei geposteten Posts). Haken → Status „arbeit“ (Gefilmt), weg → zurück zu „idee“.
function zeile(p) {
  const text = el('button', { class: 'list__inner list__inner--tap', attrs: { type: 'button' }, on: { click: () => oeffnePost(p.id) } }, [
    el('span', { class: 'list__text' }, [el('span', { class: 'list__title', text: p.titel || 'Ohne Titel' })]),
  ]);
  if (p.status === 'gepostet') return listItem(el('div', { class: 'insta-zeile' }, [text]));
  const haken = checkbox({
    checked: p.status === 'arbeit',
    onChange: (an) => setTimeout(() => speicherePost(p, { status: an ? 'arbeit' : 'idee' }), 350),
  });
  haken.querySelector('input').setAttribute('aria-label', `${p.titel} ${p.status === 'arbeit' ? 'nicht gefilmt' : 'gefilmt'}`);
  return listItem(el('div', { class: 'insta-zeile' }, [haken, text]));
}

function planer(posts) {
  if (!posts.length) return el('p', { class: 'app__note', text: 'Noch keine Posts.' });
  return STATUS.map((s) => {
    // Datum zuerst, sonst nach Überschrift (Video 01, 02 … in richtiger Reihenfolge)
    let reihe = posts.filter((p) => p.status === s.id).sort((a, b) => (a.datum || '9999').localeCompare(b.datum || '9999')
      || (a.titel || '').localeCompare(b.titel || '', 'de', { numeric: true }));
    if (s.id === 'gepostet') reihe = reihe.reverse(); // zuletzt gepostet zuerst
    if (!reihe.length) return null;
    return el('section', { class: 'card insta-gruppe' }, [
      abschnitt({ titel: s.label, zahl: reihe.length, tag: 'h3' }),
      list(reihe.map(zeile)),
    ]);
  }).filter(Boolean);
}

export function instaAnsicht({ signal }) {
  const inhalt = el('div', { class: 'insta__inhalt' });
  const umschalter = tabs({ items: ANSICHTEN, active: ansicht, onChange: (a) => { ansicht = a; zeichne(); } });
  let stand = 0;

  async function zeichne() {
    const nr = ++stand;
    const posts = await ladePosts();
    const teil = ansicht === 'monat' ? monat(posts, oeffnePost) : ansicht === 'erkenntnisse' ? await erkenntnisse(posts, oeffnePost) : planer(posts);
    if (nr !== stand || signal.aborted) return;
    inhalt.replaceChildren(...[teil].flat());
  }

  const idee = el('input', { attrs: { placeholder: 'Neue Idee …', 'aria-label': 'Neue Idee', enterkeyhint: 'done' } });
  const ideeLeiste = leiste(idee, async () => {
    if (!idee.value.trim()) return;
    await neuerPost({ titel: idee.value.trim() });
    idee.value = '';
  }, 'Idee anlegen');

  const zusatz = zusatzNehmen();
  if (zusatz) ladePost(zusatz).then((p) => p && oeffnePost(p.id));

  on('daten', ({ table }) => [POSTS, SETS, ERKENNTNISSE].includes(table) && zeichne(), { signal });
  zeichne();
  return el('div', { class: 'insta' }, [
    el('div', { class: 'insta-leiste' }, [
      umschalter,
      el('div', { class: 'insta-knoepfe' }, [
        button({ text: 'Claude', variant: 'ghost', onClick: oeffneClaude }),
        button({ text: 'Hashtags', variant: 'ghost', onClick: () => oeffneSets() }),
      ]),
    ]),
    ideeLeiste, inhalt,
  ]);
}
