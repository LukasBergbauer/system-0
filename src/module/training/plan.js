// Seite „Plan“: Name, Schalter „Aktiv“, Mo–So mit ihren Einheiten (antippen → Plan-Einheit), „+ Einheit“ je Tag.
// Name speichert beim Verlassen des Felds; Neuzeichnen nur nach Anlegen (neuZeichnen).
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { input } from '../../ui/input.js';
import { checkbox } from '../../ui/checkbox.js';
import { list, listRow } from '../../ui/list.js';
import { aendere } from './daten.js';
import { PLAENE, TAGE, setzeAktiv, loeschePlan, neuePlanEinheit } from './plan-daten.js';
import { namenText } from './plaene.js';

export function planSeite(id, { daten, zurueck, oeffne }) {
  const plan = daten.plaene.find((p) => p.id === id);
  if (!plan) return el('p', { class: 'app__note', text: 'Diesen Plan gibt es nicht mehr.' });

  const name = input({ label: 'Name', value: plan.name, placeholder: 'z. B. Hyrox Grundlage' });
  name.querySelector('input').addEventListener('change', (ev) => aendere(PLAENE, { id, name: ev.target.value.trim() }));

  const tage = TAGE.map((tag, i) => {
    const pes = daten.planEinheiten.filter((pe) => pe.plan_id === id && pe.wochentag === i + 1);
    return el('section', { class: 'card training__tag' }, [
      el('div', { class: 'training__tag-kopf' }, [
        el('h3', { class: 'label', text: tag }),
        button({ text: '+ Einheit', variant: 'ghost', onClick: async () => oeffne('plan-einheit', (await neuePlanEinheit(id, i + 1)).id) }),
      ]),
      pes.length
        ? list(pes.map((pe) => listRow({ title: pe.titel || 'Einheit', sub: namenText(pe, daten.uebungen) || 'keine Übungen',
          onClick: () => oeffne('plan-einheit', pe.id) })))
        : el('p', { class: 'training__zuletzt', text: 'Ruhetag' }),
    ]);
  });

  async function loeschen() {
    if (!confirm('Diesen Plan löschen?')) return;
    await loeschePlan(plan, daten.planEinheiten);
    zurueck();
  }

  return el('div', { class: 'training__seite' }, [
    button({ text: '‹ Training', variant: 'ghost', onClick: zurueck }),
    el('section', { class: 'card training__kopf' }, [
      name,
      checkbox({ label: 'Aktiv (gilt für Heute)', checked: plan.aktiv, onChange: (an) => setzeAktiv(plan, an, daten.plaene) }),
    ]),
    ...tage,
    button({ text: 'Plan löschen', variant: 'ghost', onClick: loeschen }),
  ]);
}
