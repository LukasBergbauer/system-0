// Heute: Training aus den Rohdaten (einheiten, saetze, trainingsplaene, plan_einheiten) – Zahlen für Kachel und Schnellaktion
// und die Leiste „Training heute“ (Plan-Einheiten des aktiven Plans; antippen startet bzw. öffnet über '#/training/plan:<id>').
import { el } from '../../ui/dom.js';
import { symbol } from '../../ui/symbol.js';
import { go } from '../../core/router.js';
import { tagISO, plusTage } from './rechnen.js';

// Wie im Training: eine Einheit zählt nur mit Inhalt (Sätze oder Dauer/Gefühl/Belastung/Notiz).
export function rechneTraining({ einheiten: alle, saetze, plaene, planEinheiten }, jetzt = new Date()) {
  const mitSatz = new Set(saetze.map((s) => s.einheit_id));
  const einheiten = alle.filter((e) => mitSatz.has(e.id) || e.dauer || e.gefuehl || e.belastung || e.notiz);
  const heute = plusTage(jetzt, 0);
  const h = tagISO(heute);
  const tag = ((heute.getDay() + 6) % 7) + 1;
  const mo = tagISO(plusTage(heute, 1 - tag));
  const aktiv = plaene.find((p) => p.aktiv);
  const geplant = aktiv ? planEinheiten.filter((pe) => pe.plan_id === aktiv.id && pe.wochentag === tag)
    .sort((a, b) => a.reihenfolge - b.reihenfolge)
    .map((pe) => ({ ...pe, fertig: einheiten.some((e) => e.plan_einheit_id === pe.id && e.datum === h) })) : [];
  const offen = geplant.find((pe) => !pe.fertig);
  const zahl = einheiten.filter((e) => e.datum >= mo && e.datum <= h).length;
  return {
    zahl,
    kurve: [6, 5, 4, 3, 2, 1, 0].map((n) => einheiten.filter((e) => e.datum === tagISO(plusTage(heute, -n))).length),
    text: !aktiv ? 'Einheiten diese Woche' : !geplant.length ? 'heute Ruhetag' : offen ? `heute: ${offen.titel || 'Einheit'}` : 'heute erledigt ✓',
    ziel: offen ? `training/plan:${offen.id}` : 'training/neu',
    geplant,
  };
}

export function trainingLeiste({ geplant }) {
  if (!geplant.length) return null;
  return el('article', { class: 'heute-karte heute-routinen' }, [
    el('div', { class: 'heute-karte__kopf' }, [el('div', {}, [el('h3', { text: 'Training' }), el('small', { text: 'heute laut Plan' })])]),
    el('div', { class: 'heute-routinen__liste' }, geplant.map((pe) => el('button', {
      class: `heute-routine${pe.fertig ? ' heute-routine--fertig' : ''}`,
      attrs: { type: 'button' },
      on: { click: () => go(`training/plan:${pe.id}`) },
    }, [
      el('span', { class: 'heute-kz__symbol' }, [symbol('training')]),
      el('span', {}, [pe.titel || 'Einheit', el('small', { text: pe.fertig ? 'Erledigt ✓' : `${pe.uebungen.length} Übungen · Starten` })]),
    ]))),
  ]);
}
