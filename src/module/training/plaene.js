// Pläne in der Training-Liste: Tab „Pläne“ und Karte „Heute“ (ganz oben, großer Start je Plan-Einheit).
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { list, listRow } from '../../ui/list.js';
import { satzText } from './rechnen.js';
import { TAGE, neuerPlan, planFuerTag, gestartet } from './plan-daten.js';

// „3 × 10 × 20 kg“ – Ziel einer Übung im Plan.
export const zielText = (z) => `${z.saetze || 1} × ${satzText(z)}`;
export const namenText = (pe, uebungen) => pe.uebungen.map((z) => uebungen.get(z.uebung_id)?.name).filter(Boolean).join(', ');

export function plaeneListe({ daten, oeffne }) {
  const neu = button({ text: '+ Plan', variant: 'ghost', onClick: async () => oeffne('plan', (await neuerPlan()).id) });
  if (!daten.plaene.length) return [el('p', { class: 'app__note', text: 'Noch kein Plan. Ein Plan wiederholt sich jede Woche.' }), neu];
  return [list(daten.plaene.map((p) => {
    const pes = daten.planEinheiten.filter((pe) => pe.plan_id === p.id);
    const tage = [...new Set(pes.map((pe) => TAGE[pe.wochentag - 1].slice(0, 2)))].join(' ');
    return listRow({
      title: p.name || 'Plan',
      sub: pes.length ? `${pes.length} ${pes.length === 1 ? 'Einheit' : 'Einheiten'} · ${tage}` : 'noch leer',
      end: p.aktiv ? 'aktiv' : '',
      onClick: () => oeffne('plan', p.id),
    });
  })), neu];
}

// Karte über den Tabs: was heute laut aktivem Plan dran ist, mit Starten/Öffnen. Ohne aktiven Plan nichts.
export function heutePlan({ daten, starte }) {
  if (!daten.plaene.some((p) => p.aktiv)) return null;
  const heute = planFuerTag(daten);
  return el('section', { class: 'card training__plan-heute' }, [
    el('h3', { class: 'label', text: 'Heute' }),
    !heute.length && el('p', { class: 'training__titel', text: 'Ruhetag' }),
    ...heute.map((pe) => {
      const da = gestartet(pe, daten.einheiten);
      return el('div', { class: 'training__heute' }, [
        el('h2', { class: 'training__titel', text: pe.titel || 'Einheit' }),
        el('p', { class: 'training__zuletzt', text: namenText(pe, daten.uebungen) || 'keine Übungen' }),
        el('button', { class: 'btn btn--primary training__start', text: da ? '▶ Weiter' : '▶ Start', attrs: { type: 'button' }, on: { click: () => starte(pe) } }),
      ]);
    }),
  ]);
}
