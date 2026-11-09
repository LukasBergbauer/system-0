// Durchlauf einer Einheit als Vollbild (wie bei Routinen): ein Satz pro Schritt, große Felder mit − / +, RIR 1–4,
// „Satz fertig“ speichert und übernimmt die Werte in den nächsten offenen Satz derselben Übung.
// Am Ende „Wie war's?“: Gefühl 1–5, Notiz; Dauer = Minuten seit Anlegen der Einheit. Weiter beim ersten Satz ohne RIR.
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { chips } from '../../ui/chips.js';
import { SAETZE, EINHEITEN, MESSUNG, gruppen, aendere } from './daten.js';
import { zeigen, lesen, PLATZ } from './saetze.js';
import { zuletztText } from './rechnen.js';

const SCHRITT = { wdh: 1, gewicht: 2.5, distanz: 50, zeit: 5 };
const reihe = (n) => Array.from({ length: n }, (_, i) => ({ id: i + 1, label: String(i + 1) }));

export function starteDurchlauf(einheit, daten, { signal, onEnde } = {}) {
  const schritte = gruppen(einheit).flatMap((g) => g.saetze.map((satz, k) => ({ satz, k, n: g.saetze.length, uebung_id: g.uebung_id })));
  if (!schritte.length) return;
  let i = schritte.findIndex((s) => s.satz.rir == null);
  if (i < 0) i = schritte.length; // alles erfasst → gleich „Wie war's?“

  const dialog = el('dialog', { class: 'durchlauf', attrs: { 'aria-label': einheit.titel || 'Training' } });
  const schliessen = () => dialog.open && dialog.close();
  const uebung = (id) => daten.uebungen.get(id) ?? { name: 'Übung', messung: ['wdh'] };

  function wertFeld(satz, key) {
    const f = el('input', { class: 'field__input tdl__wert', attrs: { inputmode: key === 'zeit' ? 'text' : key === 'wdh' ? 'numeric' : 'decimal',
      placeholder: PLATZ[key], 'aria-label': MESSUNG.find((m) => m.id === key).label } });
    f.value = zeigen(key, satz[key]);
    f.addEventListener('change', () => { satz[key] = lesen(key, f.value); f.value = zeigen(key, satz[key]); });
    const plus = (d) => () => { satz[key] = Math.max(0, (satz[key] ?? 0) + d); f.value = zeigen(key, satz[key]); };
    return el('div', { class: 'tdl__feld' }, [
      el('span', { class: 'label', text: MESSUNG.find((m) => m.id === key).label }),
      el('div', { class: 'tdl__stepper' }, [
        el('button', { class: 'tdl__pm', text: '−', attrs: { type: 'button', 'aria-label': 'weniger' }, on: { click: plus(-SCHRITT[key]) } }),
        f,
        el('button', { class: 'tdl__pm', text: '+', attrs: { type: 'button', 'aria-label': 'mehr' }, on: { click: plus(SCHRITT[key]) } }),
      ]),
    ]);
  }

  function satzSchritt({ satz, k, n, uebung_id }) {
    const u = uebung(uebung_id);
    const messung = u.messung?.length ? u.messung : ['wdh'];
    const zuletzt = zuletztText(uebung_id, daten.einheiten, einheit.id, einheit.datum);
    return [
      el('div', { class: 'durchlauf__mitte tdl__mitte', attrs: { 'aria-live': 'polite' } }, [
        el('span', { class: 'durchlauf__zahl', text: `Satz ${k + 1} / ${n}` }),
        el('h2', { class: 'durchlauf__text tdl__name', text: u.name }),
        zuletzt && el('p', { class: 'tdl__zuletzt', text: zuletzt }),
        ...messung.map((key) => wertFeld(satz, key)),
        messung.includes('wdh') && el('div', { class: 'tdl__feld' }, [
          el('span', { class: 'label', text: 'RIR – Wdh. in Reserve' }),
          chips({ items: reihe(4), active: satz.rir ?? null, onChange: (rir) => { satz.rir = rir; } }),
        ]),
      ]),
      [button({ text: 'Zurück', variant: 'ghost', disabled: i === 0, onClick: () => { i--; zeichne(); } }),
        button({ text: 'Satz fertig', variant: 'primary', onClick: satzFertig })],
    ];
  }

  async function satzFertig() {
    const { satz, uebung_id } = schritte[i];
    const { wdh = null, gewicht = null, zeit = null, distanz = null } = satz;
    await aendere(SAETZE, { id: satz.id, wdh, gewicht, zeit, distanz, rir: satz.rir ?? null });
    const naechster = schritte[i + 1];
    if (naechster?.uebung_id === uebung_id && naechster.satz.rir == null) Object.assign(naechster.satz, { wdh, gewicht, zeit, distanz });
    i++;
    zeichne();
  }

  function endeSchritt() {
    const notiz = el('textarea', { class: 'field__input training__notiz', attrs: { rows: 3, placeholder: 'Notiz (optional)' } });
    notiz.value = einheit.notiz || '';
    let gefuehl = einheit.gefuehl ?? null;
    async function fertig() {
      const min = Math.round((Date.now() - new Date(einheit.created_at)) / 60000);
      await aendere(EINHEITEN, { id: einheit.id, gefuehl, notiz: notiz.value.trim(), ...(min > 0 && min < 300 && !einheit.dauer ? { dauer: min } : {}) });
      schliessen();
    }
    return [
      el('div', { class: 'durchlauf__mitte tdl__mitte' }, [
        el('span', { class: 'durchlauf__zahl', text: '✓' }),
        el('h2', { class: 'durchlauf__text', text: 'Wie war’s?' }),
        el('div', { class: 'tdl__feld' }, [el('span', { class: 'label', text: 'Gefühl (1 schlecht – 5 super)' }),
          chips({ items: reihe(5), active: gefuehl, onChange: (g) => { gefuehl = g; } })]),
        notiz,
      ]),
      [button({ text: 'Zurück', variant: 'ghost', onClick: () => { i--; zeichne(); } }),
        button({ text: 'Fertig', variant: 'primary', onClick: fertig })],
    ];
  }

  function zeichne() {
    const [mitte, fuss] = i < schritte.length ? satzSchritt(schritte[i]) : endeSchritt();
    dialog.replaceChildren(el('div', { class: 'durchlauf__box' }, [
      el('header', { class: 'durchlauf__kopf' }, [
        el('span', { class: 'label', text: einheit.titel || 'Training' }),
        el('button', { class: 'durchlauf__zu', text: '×', attrs: { type: 'button', 'aria-label': 'Schließen' }, on: { click: schliessen } }),
      ]),
      el('div', { class: 'durchlauf__punkte', attrs: { 'aria-hidden': 'true' } },
        [...schritte, null].map((_, k) => el('i', { class: k < i ? 'an' : k === i ? 'jetzt' : '' }))),
      mitte,
      el('footer', { class: 'durchlauf__fuss' }, fuss),
    ]));
  }

  dialog.addEventListener('close', () => { dialog.remove(); onEnde?.(); });
  signal?.addEventListener('abort', schliessen);
  document.body.append(dialog);
  dialog.showModal();
  zeichne();
}
