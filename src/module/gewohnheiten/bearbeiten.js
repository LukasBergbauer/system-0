// Modal „Gewohnheit“: Name, Aufbauen/Abbauen, Messart + Tagesziel (Aufbauen) bzw. „Ohne seit“ (Abbauen), Löschen.
// g = null → neue Gewohnheit.
import { el } from '../../ui/dom.js';
import { modal } from '../../ui/modal.js';
import { input } from '../../ui/input.js';
import { tabs } from '../../ui/tabs.js';
import { button } from '../../ui/button.js';
import { ARTEN, MESSARTEN, tagISO, speichereGewohnheit, loescheGewohnheit } from './data.js';

const gruppe = (label, inhalt) =>
  el('div', { class: 'field', attrs: { role: 'group', 'aria-label': label } }, [el('span', { class: 'field__label', text: label }), inhalt]);

export function oeffneBearbeiten(g = null) {
  let art = g?.art || 'auf';
  let messart = g?.messart || 'haken';

  const nameFeld = input({ label: 'Name', value: g?.name || '', placeholder: 'z. B. Lesen' });
  const name = nameFeld.querySelector('input');
  const zielFeld = input({ label: 'Ziel pro Tag', type: 'number', value: String(g?.ziel ?? 1) });
  const ziel = zielFeld.querySelector('input');
  ziel.min = '1';
  const seitFeld = input({ label: 'Ohne seit', type: 'date', value: g?.seit || tagISO() });
  const seit = seitFeld.querySelector('input');
  const messFeld = gruppe('Messart', tabs({ items: MESSARTEN, active: messart, onChange: (id) => { messart = id; zeige(); } }));

  function zeige() {
    messFeld.hidden = art !== 'auf';
    zielFeld.hidden = art !== 'auf' || messart === 'haken';
    zielFeld.querySelector('label').textContent = messart === 'zeit' ? 'Ziel pro Tag (Minuten)' : 'Ziel pro Tag';
    seitFeld.hidden = art !== 'ab';
  }

  const m = modal({
    title: g ? 'Gewohnheit bearbeiten' : 'Neue Gewohnheit',
    content: [
      nameFeld,
      gruppe('Art', tabs({ items: ARTEN, active: art, onChange: (id) => { art = id; zeige(); } })),
      messFeld, zielFeld, seitFeld,
    ],
    actions: [
      g && button({ text: 'Löschen', variant: 'ghost', onClick: loeschen }),
      button({ text: 'Abbrechen', variant: 'ghost', onClick: () => m.close() }),
      button({ text: 'Speichern', variant: 'primary', onClick: speichern }),
    ].filter(Boolean),
  });
  zeige();

  async function speichern() {
    const n = name.value.trim();
    if (!n) return name.focus();
    const auf = art === 'auf';
    await speichereGewohnheit({
      ...(g ? { id: g.id } : {}), name: n, art,
      messart: auf ? messart : 'haken',
      ziel: auf && messart !== 'haken' ? Math.max(1, parseInt(ziel.value, 10) || 1) : 1,
      seit: art === 'ab' ? seit.value || tagISO() : g?.seit || tagISO(),
    });
    m.close();
  }

  async function loeschen() {
    if (!confirm(`„${g.name}“ löschen?`)) return;
    await loescheGewohnheit(g);
    m.close();
  }

  m.element.addEventListener('close', () => m.element.remove());
  m.open();
  if (!g) requestAnimationFrame(() => name.focus());
}
