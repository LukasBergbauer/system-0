// Bearbeiten eines Posts (im Vollbild von post.js). Speichert bei jeder Änderung und beim Schließen.
// postForm({ post }) → { element, sichern(), fokus() }
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { chips } from '../../ui/chips.js';
import { STATUS, ARTEN, ZAHLEN, speicherePost, ladePost, zaehleTags } from './data.js';
import { oeffneSets } from './hashtags.js';

let nr = 0;
const feldMit = (label, kind, extra) => el('div', { class: 'field' }, [el('span', { class: 'field__label insta-label' }, [label, extra]), kind]);

export function postForm({ post }) {
  const id = post.id;
  const texte = {}; // schluessel → Eingabefeld
  const setze = async (felder) => { post = await speicherePost((await ladePost(id)) || post, felder); };

  async function sichern() {
    const f = {};
    for (const [k, feld] of Object.entries(texte)) {
      const v = feld.value.trim() || (k === 'titel' ? '' : null);
      if (v !== (post[k] ?? (k === 'titel' ? '' : null))) f[k] = v;
    }
    const zahlen = Object.fromEntries(ZAHLEN.map((z) => [z.id, zahlFelder[z.id].value]).filter(([, v]) => v !== '').map(([k, v]) => [k, Number(v)]));
    const neu = Object.keys(zahlen).length ? zahlen : null;
    if (JSON.stringify(neu) !== JSON.stringify(post.zahlen ?? null)) f.zahlen = neu;
    if (Object.keys(f).length) await setze(f);
  }

  function text(k, label, { zeilen = 0, platzhalter = '', zaehler } = {}) {
    const fid = `insta-${k}-${++nr}`;
    const feld = zeilen
      ? el('textarea', { class: 'field__input', attrs: { id: fid, rows: zeilen, placeholder: platzhalter } })
      : el('input', { class: 'field__input', attrs: { id: fid, placeholder: platzhalter } });
    feld.value = post[k] || '';
    feld.addEventListener('change', sichern);
    texte[k] = feld;
    let zahl = null;
    if (zaehler) {
      zahl = el('small', { class: 'insta-zahl' });
      const z = () => { const [n, max] = zaehler(feld.value); zahl.textContent = `${n} / ${max}`; zahl.classList.toggle('zu-viel', n > max); };
      feld.addEventListener('input', z);
      z();
    }
    return el('div', { class: 'field' }, [el('label', { class: 'field__label insta-label', attrs: { for: fid } }, [label, zahl]), feld]);
  }

  const datum = el('input', { class: 'field__input', attrs: { type: 'date', 'aria-label': 'Datum' } });
  datum.value = post.datum || '';
  datum.addEventListener('change', () => setze({ datum: datum.value || null }));

  const zahlFelder = {};
  const zahlen = el('div', { class: 'insta-zahlen-form' }, ZAHLEN.map((z) => {
    const f = el('input', { class: 'field__input', attrs: { type: 'number', min: 0, inputmode: 'numeric', 'aria-label': z.label } });
    f.value = post.zahlen?.[z.id] ?? '';
    f.addEventListener('change', sichern);
    zahlFelder[z.id] = f;
    return el('label', { class: 'insta-zahl-feld' }, [el('small', { text: z.label }), f]);
  }));

  const hashtags = text('hashtags', 'Hashtags', { zeilen: 2, platzhalter: '#physio #training', zaehler: (t) => [zaehleTags(t), 30] });
  const setKnopf = button({ text: '+ Set einfügen', variant: 'ghost', onClick: () => oeffneSets({ waehle: (s) => {
    const feld = texte.hashtags;
    feld.value = [feld.value.trim(), s.tags].filter(Boolean).join(' ');
    feld.dispatchEvent(new Event('input'));
    sichern();
  } }) });

  const element = el('div', { class: 'insta-form' }, [
    text('titel', 'Titel', { platzhalter: 'Arbeitstitel' }),
    feldMit('Art', chips({ items: ARTEN, active: post.art, onChange: (art) => setze({ art }) })),
    feldMit('Status', chips({ items: STATUS, active: post.status, onChange: (status) => setze({ status }) })),
    feldMit('Datum', datum),
    text('hook', 'Hook', { zeilen: 2, platzhalter: 'Die ersten 3 Sekunden' }),
    text('skript', 'Skript (Kurzfassung)', { zeilen: 8, platzhalter: '- Szene 1: …\n- Szene 2: …' }),
    text('cta', 'Call to Action', { platzhalter: 'z. B. Speichern für dein nächstes Training' }),
    text('caption', 'Caption', { zeilen: 5, zaehler: (t) => [t.length, 2200] }),
    hashtags, setKnopf,
    feldMit('Zahlen (nach dem Posten)', zahlen),
    text('notiz', 'Notiz', { zeilen: 2 }),
  ]);
  return { element, sichern, fokus: () => texte.titel.focus() };
}
