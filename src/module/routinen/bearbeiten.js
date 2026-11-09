// Modal „Routine“: Name, Art, Schritte (eine Zeile = ein Schritt), Sperre (an/aus, ab Uhrzeit), Löschen.
// routine = null → neue Routine anlegen.
import { el } from '../../ui/dom.js';
import { modal } from '../../ui/modal.js';
import { input } from '../../ui/input.js';
import { tabs } from '../../ui/tabs.js';
import { button } from '../../ui/button.js';
import { checkbox } from '../../ui/checkbox.js';
import { ARTEN, sperreAb, neueRoutine, aendereRoutine, setzeSchritte, loescheRoutine } from './data.js';

export function oeffneBearbeiten(routine = null) {
  const nameFeld = input({ label: 'Name', value: routine?.name || '', placeholder: 'z. B. Morgenroutine' });
  const name = nameFeld.querySelector('input');

  let art = routine?.art || 'frei';
  let sperre = !!routine?.sperre;
  const ab = el('input', { class: 'field__input routine-sperre__zeit', attrs: { type: 'time', 'aria-label': 'Sperre gilt ab' } });
  ab.value = sperreAb({ art, sperre_ab: routine?.sperre_ab });
  let abGeaendert = !!routine?.sperre_ab;
  ab.addEventListener('change', () => { abGeaendert = true; });
  const zeit = el('label', { class: 'routine-sperre__ab', attrs: { hidden: !sperre } }, ['gilt ab', ab]);
  const artWahl = tabs({ items: ARTEN, active: art, onChange: (id) => { art = id; if (!abGeaendert) ab.value = sperreAb({ art }); } });
  const sperreWahl = el('div', { class: 'field routine-sperre' }, [
    checkbox({ label: 'Sperre: App bleibt gesperrt, bis die Routine geschafft ist', checked: sperre, onChange: (an) => { sperre = an; zeit.hidden = !an; } }),
    zeit,
  ]);

  const schritte = el('textarea', {
    class: 'field__input routine-schritte-feld',
    attrs: { id: 'routine-schritte', rows: 7, placeholder: 'Wasser trinken\nDehnen\nTag planen' },
  });
  schritte.value = (routine?.schritte || []).map((s) => s.text).join('\n');

  const m = modal({
    title: routine ? 'Routine bearbeiten' : 'Neue Routine',
    content: [
      nameFeld,
      el('div', { class: 'field', attrs: { role: 'group', 'aria-label': 'Art' } }, [el('span', { class: 'field__label', text: 'Art' }), artWahl]),
      el('div', { class: 'field' }, [
        el('label', { class: 'field__label', text: 'Schritte – eine Zeile pro Schritt', attrs: { for: 'routine-schritte' } }),
        schritte,
      ]),
      sperreWahl,
    ],
    actions: [
      routine && button({ text: 'Löschen', variant: 'ghost', onClick: loeschen }),
      button({ text: 'Abbrechen', variant: 'ghost', onClick: () => m.close() }),
      button({ text: 'Speichern', variant: 'primary', onClick: speichern }),
    ].filter(Boolean),
  });

  async function speichern() {
    const n = name.value.trim();
    if (!n) return name.focus();
    const zeilen = schritte.value.split('\n').map((z) => z.trim()).filter(Boolean);
    const felder = { name: n, art, sperre, sperre_ab: abGeaendert && ab.value ? ab.value : null };
    const { id } = routine ? await aendereRoutine({ id: routine.id, ...felder }) : await neueRoutine(felder);
    await setzeSchritte({ id, schritte: routine?.schritte || [] }, zeilen);
    m.close();
  }

  async function loeschen() {
    if (!confirm(`„${routine.name}“ löschen?`)) return;
    await loescheRoutine(routine);
    m.close();
  }

  m.element.addEventListener('close', () => m.element.remove());
  m.open();
  if (!routine) requestAnimationFrame(() => name.focus());
}
