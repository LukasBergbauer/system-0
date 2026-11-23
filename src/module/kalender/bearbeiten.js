// Modal „Termin“: neu anlegen (ohne termin) oder bearbeiten/löschen.
// Felder: Titel, ganztägig, Beginn (Tag + Uhrzeit), Ende (Tag + Uhrzeit), Wiederholen, Ort, Notiz.
// Wiederholter Termin: Bearbeiten/Löschen gilt für die ganze Serie.
// Ganztägig: Uhrzeiten ausgeblendet, „Ende“ ist der letzte Tag (gespeichert wird 0:00 Uhr des Folgetags).
import { el } from '../../ui/dom.js';
import { modal } from '../../ui/modal.js';
import { input } from '../../ui/input.js';
import { checkbox } from '../../ui/checkbox.js';
import { button } from '../../ui/button.js';
import { speichereTermin, loescheTermin } from './daten.js';
import { wiederholungFeld } from './wiederholung-feld.js';
import { tagISO, zeitHM, ausTagZeit, plusTage, letzterTag } from './zeit.js';

// Neuer Termin: nächste volle Stunde, 1 Stunde lang.
function vorlage() {
  const start = new Date();
  start.setHours(start.getHours() + 1, 0, 0, 0);
  const ende = new Date(+start + 3600e3);
  return { titel: '', start: start.toISOString(), ende: ende.toISOString(), ganztaegig: false, ort: '', notiz: '' };
}

// Tag + Uhrzeit nebeneinander
function zeitpunkt(label, d) {
  const tag = input({ label, type: 'date', value: tagISO(d) });
  const zeit = input({ label: 'Uhrzeit', type: 'time', value: zeitHM(d) });
  return {
    element: el('div', { class: 'termin-zeitpunkt' }, [tag, zeit]),
    tag: tag.querySelector('input'),
    zeit: zeit.querySelector('input'),
    zeitFeld: zeit,
  };
}

export function oeffneTermin(termin) {
  const neu = !termin;
  const t = termin || vorlage();

  const titelFeld = input({ label: 'Titel', value: t.titel, placeholder: 'z. B. Training' });
  const titel = titelFeld.querySelector('input');
  let ganztaegig = t.ganztaegig;
  const ganz = checkbox({ label: 'Ganztägig', checked: ganztaegig, onChange: (an) => { ganztaegig = an; zeigeZeiten(); } });
  const beginn = zeitpunkt('Beginn', new Date(t.start));
  const ende = zeitpunkt('Ende', t.ganztaegig ? letzterTag(t) : new Date(t.ende));
  const wdh = wiederholungFeld(t.wiederholung);
  const ortFeld = input({ label: 'Ort', value: t.ort });
  const notiz = el('textarea', { class: 'field__input', attrs: { rows: 3, id: 'termin-notiz' } });
  notiz.value = t.notiz || '';

  function zeigeZeiten() {
    beginn.zeitFeld.hidden = ganztaegig;
    ende.zeitFeld.hidden = ganztaegig;
  }
  zeigeZeiten();

  const m = modal({
    title: neu ? 'Neuer Termin' : 'Termin bearbeiten',
    content: [
      titelFeld,
      ganz,
      beginn.element,
      ende.element,
      wdh.element,
      ortFeld,
      el('div', { class: 'field' }, [el('label', { class: 'field__label', text: 'Notiz', attrs: { for: 'termin-notiz' } }), notiz]),
    ],
    actions: [
      !neu && button({ text: 'Löschen', variant: 'ghost', onClick: loeschen }),
      button({ text: 'Abbrechen', variant: 'ghost', onClick: () => m.close() }),
      button({ text: 'Speichern', onClick: speichern }),
    ].filter(Boolean),
  });

  async function speichern() {
    const neuerTitel = titel.value.trim();
    if (!neuerTitel) return titel.focus();
    if (!beginn.tag.value) return beginn.tag.focus();
    const endTag = ende.tag.value || beginn.tag.value;
    let s;
    let e;
    if (ganztaegig) {
      s = ausTagZeit(beginn.tag.value);
      e = plusTage(ausTagZeit(endTag), 1);
      if (e <= s) e = plusTage(s, 1); // Ende vor Beginn → eintägig
    } else {
      s = ausTagZeit(beginn.tag.value, beginn.zeit.value || '00:00');
      e = ausTagZeit(endTag, ende.zeit.value || beginn.zeit.value || '00:00');
      if (e < s) e = new Date(+s + 3600e3); // Ende vor Beginn → 1 Stunde
    }
    await speichereTermin({
      ...(neu ? {} : { id: t.id }),
      titel: neuerTitel,
      start: s.toISOString(),
      ende: e.toISOString(),
      ganztaegig,
      ort: ortFeld.querySelector('input').value.trim(),
      notiz: notiz.value.trim(),
      // Spalte nur mitschicken, wenn genutzt (vor Migration 019 bleibt der Abgleich so heil)
      ...(wdh.wert() || t.wiederholung ? { wiederholung: wdh.wert() } : {}),
    });
    m.close();
  }

  async function loeschen() {
    if (!confirm(`„${t.titel}“${t.wiederholung ? ' mit allen Wiederholungen' : ''} löschen?`)) return;
    await loescheTermin(t.id);
    m.close();
  }

  titel.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.isComposing) speichern();
  });
  m.element.addEventListener('close', () => m.element.remove());
  m.open();
  if (neu) titel.focus();
}
