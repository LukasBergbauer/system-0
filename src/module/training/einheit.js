// Seite „Einheit“: Kopf (Datum, Titel), „Durchlauf starten“, Übungen mit Sätzen, „Wie war's?“ (Gefühl, Dauer, Notiz).
// Autospeichern je Feld. Zeichnet nur die Übungen neu (nach + Satz / + Übung / Löschen), damit der Fokus bleibt.
// ende(): beim Verlassen leere Einheit wegräumen.
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { input } from '../../ui/input.js';
import { chips } from '../../ui/chips.js';
import { EINHEITEN, ladeAlles, gruppen, aendere, neuerSatz, loescheEinheit, aufraeumen } from './daten.js';
import { uebungBlock } from './saetze.js';
import { waehleUebung } from './wahl.js';
import { zuletztText } from './rechnen.js';
import { starteDurchlauf } from './durchlauf.js';

const reihe = (n, von = 1) => Array.from({ length: n }, (_, i) => ({ id: i + von, label: String(i + von) }));

function feld(label, kind) {
  return el('div', { class: 'field', attrs: { role: 'group', 'aria-label': label } }, [el('span', { class: 'field__label', text: label }), kind]);
}

export function einheitSeite(id, { daten, zurueck, oeffne, signal, durchlauf, neuZeichnen }) {
  let e = daten.einheiten.find((x) => x.id === id);
  if (!e) return { element: el('p', { class: 'app__note', text: 'Diese Einheit gibt es nicht mehr.' }), ende: null };
  const speichere = (felder) => { Object.assign(e, felder); return aendere(EINHEITEN, { id, ...felder }); };

  const textFeld = (label, key, attrs = {}) => {
    const f = input({ label, value: e[key] ?? '', type: attrs.type || 'text', placeholder: attrs.placeholder || '' });
    const i = f.querySelector('input');
    if (attrs.inputmode) i.inputMode = attrs.inputmode;
    i.addEventListener('change', () => speichere({ [key]: attrs.lesen ? attrs.lesen(i.value) : i.value.trim() }));
    return f;
  };

  const notiz = el('textarea', { class: 'field__input training__notiz', attrs: { rows: 3, placeholder: 'Notiz' } });
  notiz.value = e.notiz || '';
  notiz.addEventListener('change', () => speichere({ notiz: notiz.value.trim() }));

  const uebungenBox = el('div', { class: 'training__uebungen' });
  let alles = daten;

  async function neu() {
    alles = await ladeAlles();
    e = alles.einheiten.find((x) => x.id === id) ?? e;
    zeigeUebungen();
  }

  function zeigeUebungen() {
    const vorher = alles.einheiten.filter((x) => x.id !== id && x.datum <= e.datum);
    uebungenBox.replaceChildren(...gruppen(e).map((g) => {
      const uebung = alles.uebungen.get(g.uebung_id) ?? { id: g.uebung_id, name: 'Gelöschte Übung', messung: ['wdh', 'gewicht'] };
      const letztes = vorher.map((x) => x.saetze.filter((s) => s.uebung_id === g.uebung_id)).find((s) => s.length) ?? null;
      const zuletzt = zuletztText(g.uebung_id, alles.einheiten, id, e.datum);
      return uebungBlock({ uebung, saetze: g.saetze, einheit_id: id, letztes, zuletzt, oeffne, neu });
    }));
  }
  zeigeUebungen();

  async function plusUebung() {
    const u = await waehleUebung(alles);
    if (!u) return;
    const letztes = alles.einheiten.find((x) => x.id !== id && x.saetze.some((s) => s.uebung_id === u.id));
    await neuerSatz(id, u.id, letztes?.saetze.filter((s) => s.uebung_id === u.id).at(-1));
    neu();
  }

  async function loeschen() {
    if (!confirm('Diese Einheit löschen?')) return;
    await loescheEinheit(e);
    zurueck();
  }

  const los = () => starteDurchlauf(e, alles, { signal, onEnde: neuZeichnen });
  const element = el('div', { class: 'training__seite' }, [
    button({ text: '‹ Training', variant: 'ghost', onClick: zurueck }),
    el('section', { class: 'card training__kopf training__zeile' }, [
      textFeld('Titel', 'titel', { placeholder: 'z. B. Oberkörper' }),
      textFeld('Datum', 'datum', { type: 'date', lesen: (v) => v || e.datum }),
    ]),
    e.saetze.length > 0 && el('button', { class: 'btn btn--primary training__start', text: 'Start', attrs: { type: 'button' }, on: { click: los } }),
    uebungenBox,
    button({ text: '+ Übung', variant: 'normal', onClick: plusUebung }),
    el('section', { class: 'card training__kopf' }, [
      el('h3', { class: 'label', text: 'Wie war\u2019s?' }),
      feld('Gefühl (1 schlecht – 5 super)', chips({ items: reihe(5), active: e.gefuehl ?? null, onChange: (gefuehl) => speichere({ gefuehl }) })),
      textFeld('Dauer (Min.)', 'dauer', { inputmode: 'numeric', placeholder: '60', lesen: (v) => parseInt(v, 10) || null }),
      notiz,
    ]),
    button({ text: 'Einheit löschen', variant: 'ghost', onClick: loeschen }),
  ]);
  if (durchlauf) queueMicrotask(los);

  // Beim Verlassen: aktuellen Stand holen, leere Einheit löschen.
  const ende = async () => {
    const jetzt = (await ladeAlles()).einheiten.find((x) => x.id === id);
    if (jetzt) await aufraeumen(jetzt);
  };
  return { element, ende };
}
