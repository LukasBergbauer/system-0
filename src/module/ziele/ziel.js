// Modal „Ziel“: Titel, Warum, Zieldatum, Status, Schritte (abhaken, löschen, neu per Enter). Speichert sofort.
// neu: true → Titel fokussieren; bleibt das Ziel leer (kein Titel, keine Schritte), wird es beim Schließen gelöscht.
import { el } from '../../ui/dom.js';
import { modal } from '../../ui/modal.js';
import { input } from '../../ui/input.js';
import { tabs } from '../../ui/tabs.js';
import { button } from '../../ui/button.js';
import { checkbox } from '../../ui/checkbox.js';
import { STATUS, ladeAlles, speichereZiel, neuerSchritt, hakeSchritt, loescheSchritt, loescheZiel } from './data.js';

const finde = async (id) => (await ladeAlles()).flatMap((b) => b.ziele).find((z) => z.id === id);

export async function oeffneZiel(id, { neu = false } = {}) {
  let ziel = await finde(id);
  if (!ziel) return;
  const setze = (felder) => speichereZiel({ id, ...felder });

  const titelFeld = input({ label: 'Schritt', value: ziel.titel, placeholder: 'z. B. Halbmarathon unter 1:45' });
  const titel = titelFeld.querySelector('input');
  titel.addEventListener('change', () => setze({ titel: titel.value.trim() }));

  const warum = el('textarea', { class: 'field__input ziele-text', attrs: { id: 'ziel-warum', rows: 3, placeholder: 'Warum ist dir das wichtig?' } });
  warum.value = ziel.warum || '';
  warum.addEventListener('change', () => setze({ warum: warum.value.trim() || null }));

  const datumFeld = input({ label: 'Bis wann', type: 'date', value: ziel.zieldatum || '' });
  datumFeld.querySelector('input').addEventListener('change', (e) => setze({ zieldatum: e.target.value || null }));

  const status = tabs({ items: STATUS, active: ziel.status, onChange: (s) => setze({ status: s }) });

  const liste = el('div', { class: 'ziel-schritte' });
  const neuFeld = el('input', { class: 'field__input', attrs: { type: 'text', placeholder: '+ Teilschritt, Enter', 'aria-label': 'Neuer Teilschritt', enterkeyhint: 'done' } });
  neuFeld.addEventListener('keydown', async (e) => {
    const text = neuFeld.value.trim();
    if (e.key !== 'Enter' || !text) return;
    neuFeld.value = '';
    await neuerSchritt(id, text);
    zeigeSchritte();
  });

  async function zeigeSchritte() {
    ziel = await finde(id);
    liste.replaceChildren(...ziel.schritte.map((s) => el('div', { class: 'ziel-schritt' }, [
      checkbox({ label: s.text, checked: !!s.erledigt_am, onChange: (an) => hakeSchritt(s, an) }),
      el('button', { class: 'ziel-schritt__weg', text: '×', attrs: { type: 'button', 'aria-label': `${s.text} löschen` },
        on: { click: async () => { await loescheSchritt(s); zeigeSchritte(); } } }),
    ])));
  }

  const m = modal({
    title: neu ? 'Neuer Schritt' : 'Schritt',
    content: [
      titelFeld,
      el('div', { class: 'field' }, [el('label', { class: 'field__label', text: 'Warum', attrs: { for: 'ziel-warum' } }), warum]),
      datumFeld,
      el('div', { class: 'field', attrs: { role: 'group', 'aria-label': 'Status' } }, [el('span', { class: 'field__label', text: 'Status' }), status]),
      el('div', { class: 'field' }, [el('span', { class: 'field__label', text: 'Teilschritte' }), liste, neuFeld]),
    ],
    actions: [
      button({ text: 'Löschen', variant: 'ghost', onClick: loeschen }),
      button({ text: 'Fertig', variant: 'primary', onClick: () => m.close() }),
    ],
  });

  async function loeschen() {
    if (ziel.titel && !confirm(`„${ziel.titel}“ löschen?`)) return;
    await loescheZiel(ziel);
    m.close();
  }

  m.element.addEventListener('close', async () => {
    m.element.remove();
    const z = await finde(id);
    if (!z) return;
    const t = titel.value.trim();
    const w = warum.value.trim() || null;
    if (!t && !z.schritte.length) return loescheZiel(z);
    if (t !== z.titel || w !== (z.warum || null)) await setze({ titel: t, warum: w }); // z. B. mit Esc geschlossen
  });
  await zeigeSchritte();
  m.open();
  if (neu) requestAnimationFrame(() => titel.focus());
}
