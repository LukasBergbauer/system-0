// Suche im Mindmap-Overlay: Suchfeld oben, darunter Treffer (Titel + Art).
// Leeres Feld: alle Punkte (bzw. alle der Art), wie in jeder Liste des Kosmos. Noch gar nichts da: gleich „Neuer Punkt“.
// Kein Auto-Fokus: Tastatur/Fokus-Rahmen erst beim Antippen (sonst ruckelt das Öffnen).
// Unter den Treffern: „+ „…“ anlegen“ (Titel = Suchtext). Gewählter Punkt → waehle(id).
// stand = { eintraege, links, suchtext } aus overlay.js (suchtext bleibt beim Zurückkehren erhalten).
// art (optional) = nur diese Art: leeres Feld zeigt alle ihre Punkte, Anlegen mit dieser Art (Kosmos → Art-Kugel).
import { el } from '../../ui/dom.js';
import { list, listRow } from '../../ui/list.js';
import { art as artVon } from './arten.js';
import { suche } from './daten.js';
import { anlegenForm } from './anlegen.js';

const MAX_TREFFER = 30;

export function trefferZeile(e, waehle) {
  return listRow({
    title: e.titel,
    sub: e.kurz || null,
    end: el('span', { class: 'label', text: artVon(e.art).name }),
    onClick: () => waehle(e.id),
  });
}

export function suchAnsicht({ stand, waehle, art = null }) {
  const name = art && artVon(art).mehrzahl;
  const feld = el('input', {
    class: 'field__input mm-suche__feld',
    attrs: {
      type: 'search', placeholder: art ? `${name} durchsuchen …` : 'Suchen …', autocomplete: 'off', autocapitalize: 'off',
      enterkeyhint: 'search', 'aria-label': 'Mindmap durchsuchen',
    },
    on: { input: () => { if (!art) stand.suchtext = feld.value; zeichne(); } },
  });
  feld.value = art ? '' : stand.suchtext;
  const ergebnis = el('div', { class: 'mm-suche__ergebnis' });
  let formOffen = false; // „Neuer Punkt“ wird gerade ausgefüllt → nicht wegzeichnen

  function angelegt(neu) {
    stand.eintraege = [...stand.eintraege, neu]; // sofort bekannt, auch bevor neu geladen ist
    if (!art) stand.suchtext = '';
    waehle(neu.id);
  }

  function zeigeForm() {
    formOffen = true;
    const form = anlegenForm({ titel: feld.value.trim(), art, onAngelegt: angelegt });
    ergebnis.replaceChildren(form);
    form.querySelector('input').focus();
  }

  function zeichne() {
    formOffen = false;
    const text = feld.value.trim();
    const alle = art ? stand.eintraege.filter((e) => e.art === art) : stand.eintraege;

    if ((art || alle.length) && !text) {
      ergebnis.replaceChildren(
        el('p', { class: 'label', text: `${name || 'Alle Punkte'} · ${alle.length}` }),
        alle.length ? list(alle.map((e) => trefferZeile(e, waehle))) : el('p', { class: 'mm-suche__hinweis', text: `Noch keine ${name}.` }),
        neuKnopf('+ Neu'),
      );
      return;
    }

    if (!alle.length && !text) {
      formOffen = true;
      ergebnis.replaceChildren(
        el('p', { class: 'mm-suche__hinweis', text: 'Noch leer. Lege deinen ersten Punkt an.' }),
        anlegenForm({ art, onAngelegt: angelegt }),
      );
      return;
    }

    const treffer = suche(alle, text);
    ergebnis.replaceChildren(...[
      treffer.length
        ? list(treffer.slice(0, MAX_TREFFER).map((e) => trefferZeile(e, waehle)))
        : el('p', { class: 'mm-suche__hinweis', text: 'Nichts gefunden.' }),
      treffer.length > MAX_TREFFER &&
        el('p', { class: 'app__note', text: `${treffer.length - MAX_TREFFER} weitere – genauer suchen` }),
      neuKnopf(`+ „${text}“ anlegen`),
    ].filter(Boolean));
  }

  function neuKnopf(text) {
    return el('button', { class: 'chip chip--aktion mm-suche__neu', text, attrs: { type: 'button' }, on: { click: zeigeForm } });
  }

  const element = el('div', { class: 'mm-suche mm-suche--feld' }, [feld, ergebnis]);
  element.dataset.art = art ?? '';
  // Neu zeichnen, wenn sich Daten ändern (z. B. durch das andere Gerät) – außer beim Ausfüllen.
  element.aktualisiere = () => { if (!formOffen) zeichne(); };
  zeichne();
  return element;
}
