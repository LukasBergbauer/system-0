// Notizen eines Buchs (in der Leseansicht unter dem Buchkopf): Knöpfe „Zitat“ (art 'absatz') und „Zusammenfassung“,
// darunter je ein Abschnitt, Einträge nach Seite sortiert; antippen = bearbeiten/löschen. notizen(buch) → Element, zeichnet sich bei 'daten' selbst neu.
import { el } from '../../ui/dom.js';
import { abschnitt } from '../../ui/abschnitt.js';
import { button } from '../../ui/button.js';
import { modal } from '../../ui/modal.js';
import { on } from '../../core/events.js';
import { NOTIZEN, ladeNotizen, speichereNotiz, loescheNotiz } from './data.js';

const ART = { absatz: 'Zitat', zusammenfassung: 'Zusammenfassung' };
const GRUPPE = { absatz: 'Zitate', zusammenfassung: 'Zusammenfassungen' };

function fenster(buch, n) {
  // Ganz simpel: „Seite [ ]“ und eine Notizbox
  const seite = el('input', { class: 'field__input buch-seiten-feld buch-seiten-feld--klein', attrs: { inputmode: 'numeric', pattern: '[0-9]*', 'aria-label': 'Seite', autocomplete: 'off' } });
  seite.value = n.seite ?? buch.seite ?? '';
  const text = el('textarea', { class: 'field__input buch-notiz-feld', attrs: { rows: 6, 'aria-label': ART[n.art], placeholder: n.art === 'absatz' ? 'Zitat …' : 'In eigenen Worten …' } });
  text.value = n.text || '';
  const m = modal({
    title: ART[n.art],
    content: [el('div', { class: 'buch-seiten-form' }, ['Seite', seite]), text],
    actions: [
      n.id && button({ text: 'Löschen', variant: 'ghost', onClick: async () => { await loescheNotiz(n.id); m.close(); } }),
      button({ text: 'Speichern', variant: 'primary', onClick: async () => {
        const t = text.value.trim();
        if (t) {
          const s = parseInt(seite.value, 10);
          await speichereNotiz({ ...n, buch_id: buch.id, text: t, seite: s >= 0 ? s : null });
        }
        m.close();
      } }),
    ].filter(Boolean),
  });
  m.element.addEventListener('close', () => m.element.remove());
  m.open();
  requestAnimationFrame(() => text.focus());
}

function eintrag(buch, n) {
  return el('button', { class: `buch-notiz buch-notiz--${n.art}`, attrs: { type: 'button' }, on: { click: () => fenster(buch, n) } }, [
    n.seite != null && el('span', { class: 'buch-notiz__seite', text: `S. ${n.seite}` }),
    el(n.art === 'absatz' ? 'blockquote' : 'p', { class: 'buch-notiz__text', text: n.text }),
  ]);
}

export function notizen(buch, signal) {
  const liste = el('div', { class: 'buch-notizen__liste' });
  const zeichne = async () => {
    const alle = await ladeNotizen(buch.id);
    liste.replaceChildren(...Object.keys(ART).flatMap((art) => {
      const teil = alle.filter((n) => n.art === art);
      return teil.length ? [el('div', { class: 'buch-notizen__gruppe' }, [abschnitt({ titel: GRUPPE[art], zahl: teil.length, tag: 'h3' }), ...teil.map((n) => eintrag(buch, n))])] : [];
    }));
  };
  on('daten', ({ table }) => table === NOTIZEN && zeichne(), { signal });
  zeichne();
  return el('section', { class: 'buch-notizen' }, [
    el('div', { class: 'knopfreihe' }, Object.entries(ART).map(([art, text]) => button({ text: `+ ${text}`, variant: art === 'absatz' ? 'primary' : 'normal', onClick: () => fenster(buch, { art }) }))),
    liste,
  ]);
}
