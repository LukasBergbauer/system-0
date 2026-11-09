// Seite „Plan-Einheit“: Titel, Wochentag, Übungen mit Ziel (Sätze × Werte je Messung) und „Zuletzt“.
// Autospeichern je Feld; die Übungsliste wird als Ganzes gespeichert. Zeichnet nur die Übungen neu (Fokus bleibt).
// ende(): leere Plan-Einheit (kein Titel, keine Übungen) beim Verlassen löschen.
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { input } from '../../ui/input.js';
import { chips } from '../../ui/chips.js';
import { MESSUNG, aendere, ladeAlles } from './daten.js';
import { zeigen, lesen, PLATZ } from './saetze.js';
import { waehleUebung } from './wahl.js';
import { zuletztText } from './rechnen.js';
import { PLAN_EINHEITEN, TAGE, loeschePlanEinheit } from './plan-daten.js';

function feld(label, kind) {
  return el('div', { class: 'field', attrs: { role: 'group', 'aria-label': label } }, [el('span', { class: 'field__label', text: label }), kind]);
}

export function planEinheitSeite(id, { daten, zurueck, oeffne }) {
  const pe = daten.planEinheiten.find((x) => x.id === id);
  if (!pe) return { element: el('p', { class: 'app__note', text: 'Diese Plan-Einheit gibt es nicht mehr.' }), ende: null };
  const speichere = (felder) => { Object.assign(pe, felder); return aendere(PLAN_EINHEITEN, { id, ...felder }); };
  const speichereUebungen = () => aendere(PLAN_EINHEITEN, { id, uebungen: pe.uebungen.map((z) => ({ ...z })) });

  const titel = input({ label: 'Titel', value: pe.titel, placeholder: 'z. B. Oberkörper' });
  titel.querySelector('input').addEventListener('change', (ev) => speichere({ titel: ev.target.value.trim() }));

  const box = el('div', { class: 'training__uebungen' });

  function zielZeile(z, messung) {
    const keys = ['saetze', ...messung];
    const felder = keys.map((key) => {
      const f = el('input', {
        class: 'field__input satz__feld',
        attrs: { inputmode: key === 'zeit' ? 'text' : key === 'gewicht' || key === 'distanz' ? 'decimal' : 'numeric',
          placeholder: key === 'saetze' ? '3' : PLATZ[key], 'aria-label': key === 'saetze' ? 'Sätze' : MESSUNG.find((m) => m.id === key).label },
        on: { change: () => {
          z[key] = key === 'saetze' ? lesen('wdh', f.value) : lesen(key, f.value);
          f.value = key === 'saetze' ? (z[key] ?? '') : zeigen(key, z[key]);
          speichereUebungen();
        } },
      });
      f.value = key === 'saetze' ? (z.saetze ?? '') : zeigen(key, z[key]);
      return f;
    });
    const kopf = el('div', { class: 'satz satz--kopf', attrs: { 'aria-hidden': 'true' } },
      keys.map((key) => el('span', { class: 'satz__feld label', text: key === 'saetze' ? 'Sätze' : MESSUNG.find((m) => m.id === key).label })));
    return [kopf, el('div', { class: 'satz' }, felder)];
  }

  function zeige() {
    box.replaceChildren(...pe.uebungen.map((z, i) => {
      const u = daten.uebungen.get(z.uebung_id) ?? { id: z.uebung_id, name: 'Gelöschte Übung', messung: ['wdh'] };
      const messung = u.messung?.length ? u.messung : ['wdh'];
      return el('section', { class: 'card training__block' }, [
        el('div', { class: 'training__tag-kopf' }, [
          el('button', { class: 'training__block-kopf', attrs: { type: 'button' }, on: { click: () => oeffne('uebung', u.id) } }, [
            el('span', { class: 'training__block-name', text: u.name }),
          ]),
          el('button', { class: 'satz__weg', text: '×', attrs: { type: 'button', 'aria-label': `${u.name} entfernen` },
            on: { click: () => { pe.uebungen.splice(i, 1); speichereUebungen(); zeige(); } } }),
        ]),
        zuletztText(u.id, daten.einheiten) && el('p', { class: 'training__letztes', text: zuletztText(u.id, daten.einheiten) }),
        ...zielZeile(z, messung),
      ]);
    }));
  }
  zeige();

  async function plusUebung() {
    const u = await waehleUebung(daten);
    if (!u) return;
    daten = await ladeAlles(); // neue Übung samt Physio-Namen
    pe.uebungen.push({ uebung_id: u.id, saetze: 3 });
    speichereUebungen();
    zeige();
  }

  async function loeschen() {
    if (!confirm('Diese Plan-Einheit löschen?')) return;
    await loeschePlanEinheit(id);
    zurueck();
  }

  const element = el('div', { class: 'training__seite' }, [
    button({ text: '‹ Plan', variant: 'ghost', onClick: zurueck }),
    el('section', { class: 'card training__kopf' }, [
      titel,
      feld('Wochentag', chips({ items: TAGE.map((t, i) => ({ id: i + 1, label: t.slice(0, 2) })), active: pe.wochentag,
        onChange: (wochentag) => speichere({ wochentag }) })),
    ]),
    box,
    button({ text: '+ Übung', variant: 'ghost', onClick: plusUebung }),
    button({ text: 'Plan-Einheit löschen', variant: 'ghost', onClick: loeschen }),
  ]);

  const ende = async () => { if (!pe.titel && !pe.uebungen.length) await loeschePlanEinheit(id); };
  return { element, ende };
}
