// Modal „Hashtag-Sets“: anlegen, bearbeiten, löschen. waehle(set) optional: Antippen übernimmt das Set (aus dem Post).
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { modal } from '../../ui/modal.js';
import { ladeSets, speichereSet, loescheSet, zaehleTags } from './data.js';

function zeile(set, { waehle, zeichne }) {
  const name = el('input', { class: 'field__input', attrs: { placeholder: 'Name, z. B. Physio', 'aria-label': 'Name' } });
  const tags = el('textarea', { class: 'field__input', attrs: { rows: 3, placeholder: '#physio #training …', 'aria-label': 'Hashtags' } });
  name.value = set.name;
  tags.value = set.tags;
  const zahl = el('small', { class: 'insta-zahl' });
  const zaehle = () => { const n = zaehleTags(tags.value); zahl.textContent = `${n} / 30`; zahl.classList.toggle('zu-viel', n > 30); };
  const sichere = () => speichereSet({ id: set.id, name: name.value.trim(), tags: tags.value.trim() });
  name.addEventListener('change', sichere);
  tags.addEventListener('change', sichere);
  tags.addEventListener('input', zaehle);
  zaehle();
  return el('div', { class: 'insta-set' }, [
    name, tags,
    el('div', { class: 'insta-set__fuss' }, [
      zahl,
      button({ text: 'Löschen', variant: 'ghost', onClick: async () => { if (confirm(`Set „${set.name || 'ohne Namen'}“ löschen?`)) { await loescheSet(set); zeichne(); } } }),
      waehle && button({ text: 'Übernehmen', variant: 'primary', onClick: async () => { await sichere(); waehle({ ...set, tags: tags.value.trim() }); } }),
    ]),
  ]);
}

export function oeffneSets({ waehle } = {}) {
  const liste = el('div', { class: 'insta-sets' });
  let m;
  const fertig = waehle && ((s) => { waehle(s); m.close(); });
  async function zeichne() {
    const sets = await ladeSets();
    liste.replaceChildren(...(sets.length ? sets.map((s) => zeile(s, { waehle: fertig, zeichne })) : [el('p', { class: 'app__note', text: 'Noch keine Sets.' })]));
  }
  const neu = button({ text: '+ Set', variant: 'ghost', onClick: async () => { await speichereSet({ name: '', tags: '' }); await zeichne(); liste.lastChild?.querySelector('input')?.focus(); } });
  m = modal({ title: 'Hashtag-Sets', content: [liste, neu] });
  m.element.addEventListener('close', () => m.element.remove());
  zeichne();
  m.open();
}
