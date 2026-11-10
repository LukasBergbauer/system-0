// Ansicht „Verknüpfen“: mit der Mitte einen vorhandenen Punkt verbinden oder einen neuen anlegen.
// Oben Art-Chips (für neue Punkte), darunter ein Feld „Titel oder suchen …“.
// Beim Tippen: passende vorhandene Punkte → antippen verknüpft.
// Enter / „Anlegen“: gibt es den Titel schon, wird dieser Punkt verknüpft (keine Doppelten), sonst neu angelegt.
// Darunter optional „Notiz zur Verknüpfung“ (z. B. „häufigste Ursache“), steht später klein auf dem Faden.
// Danach fertig() → zurück zur Karte, wo der Punkt einschwebt.
import { el } from '../../ui/dom.js';
import { chips } from '../../ui/chips.js';
import { list, listRow } from '../../ui/list.js';
import { button } from '../../ui/button.js';
import { ARTEN, art as artVon } from './arten.js';
import { nachbarn, suche, norm, neuerEintrag, verknuepfe } from './daten.js';
import { letzteArt, merkeArt } from './anlegen.js';

const MAX_TREFFER = 20;

export function verknuepfenAnsicht({ stand, mitte, fertig }) {
  let art = letzteArt();
  let laeuft = false;
  const schonDa = new Set(nachbarn(mitte.id, stand.eintraege, stand.links).map((e) => e.id));

  const feld = el('input', {
    class: 'field__input mm-suche__feld',
    attrs: {
      type: 'search', placeholder: 'Titel oder suchen …', autocomplete: 'off',
      enterkeyhint: 'done', 'aria-label': `Punkt mit ${mitte.titel} verknüpfen`,
    },
    on: { input: () => zeichne() },
  });
  const notiz = el('input', {
    class: 'field__input mm-verknuepfen__notiz',
    attrs: { type: 'text', placeholder: 'Notiz zur Verknüpfung (optional), z. B. häufigste Ursache', autocomplete: 'off', enterkeyhint: 'done' },
  });
  const ergebnis = el('div', { class: 'mm-suche__ergebnis' });
  const anlegen = button({ text: 'Anlegen', variant: 'primary', onClick: () => los() });

  // Ein Punkt wird verknüpft (vorhanden oder neu); doppelter Tipp während des Speicherns zählt nicht.
  async function verbinde(eintragOderNull) {
    if (laeuft) return;
    laeuft = true;
    let ziel = eintragOderNull;
    if (!ziel) {
      merkeArt(art);
      ziel = await neuerEintrag(art, feld.value.trim());
      stand.eintraege = [...stand.eintraege, ziel]; // sofort bekannt, auch bevor neu geladen ist
    }
    await verknuepfe(mitte.id, ziel.id, notiz.value.trim());
    fertig();
  }

  function los() {
    const t = norm(feld.value.trim());
    if (!t) return feld.focus();
    const gleich = stand.eintraege.find((e) => e.id !== mitte.id && norm(e.titel) === t);
    verbinde(gleich ?? null);
  }

  function zeichne() {
    const text = feld.value.trim();
    anlegen.textContent = text ? `„${text}“ anlegen` : 'Anlegen';
    if (!text) {
      ergebnis.replaceChildren(el('p', { class: 'mm-suche__hinweis', text: 'Neuen Titel tippen – oder einen vorhandenen Punkt suchen.' }));
      return;
    }
    const treffer = suche(stand.eintraege, text).filter((e) => e.id !== mitte.id).slice(0, MAX_TREFFER);
    ergebnis.replaceChildren(...[
      treffer.length > 0 && el('p', { class: 'label', text: 'Vorhanden' }),
      treffer.length > 0 && list(treffer.map((e) => listRow({
        title: e.titel,
        sub: schonDa.has(e.id) ? 'schon verknüpft' : artVon(e.art).name,
        end: el('span', { class: 'label', text: schonDa.has(e.id) ? '✓' : 'Verknüpfen' }),
        onClick: () => verbinde(e),
      }))),
    ].filter(Boolean));
  }

  notiz.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); los(); } });
  feld.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.isComposing) return;
    e.preventDefault();
    los();
  });

  const element = el('div', { class: 'mm-suche mm-verknuepfen' }, [
    el('p', { class: 'label', text: `Mit ${mitte.titel} verknüpfen` }),
    chips({
      items: ARTEN.map((a) => ({ id: a.id, label: a.name })),
      active: art,
      onChange: (id) => { art = id; feld.focus(); },
    }),
    feld,
    notiz,
    el('div', { class: 'mm-anlegen__aktion' }, anlegen),
    ergebnis,
  ]);
  element.dataset.mitte = mitte.id;
  zeichne();
  requestAnimationFrame(() => feld.focus({ preventScroll: true }));
  return element;
}
