// Wochenpläne: Daten. trainingsplaene (name, aktiv, notiz), plan_einheiten (plan_id, wochentag 1–7, titel, art,
// uebungen [{ uebung_id, saetze, wdh, gewicht, zeit, distanz }], reihenfolge). Einheit aus Plan: einheiten.plan_einheit_id.
import { save, remove } from '../../core/store.js';
import { EINHEITEN, SAETZE, tagISO } from './daten.js';

export const PLAENE = 'trainingsplaene';
export const PLAN_EINHEITEN = 'plan_einheiten';
export const TAGE = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
export const wochentag = (d = new Date()) => ((d.getDay() + 6) % 7) + 1;

export const neuerPlan = () => save(PLAENE, { name: 'Neuer Plan', aktiv: false, notiz: '' });
export const neuePlanEinheit = (plan_id, wochentag) =>
  save(PLAN_EINHEITEN, { plan_id, wochentag, titel: '', art: 'kraft', uebungen: [], reihenfolge: Date.now() });

// Nur ein Plan aktiv: alle anderen abschalten.
export async function setzeAktiv(plan, an, plaene) {
  if (an) for (const p of plaene) if (p.aktiv && p.id !== plan.id) await save(PLAENE, { id: p.id, aktiv: false });
  await save(PLAENE, { id: plan.id, aktiv: an });
}

export async function loeschePlan(plan, planEinheiten) {
  for (const pe of planEinheiten) if (pe.plan_id === plan.id) await remove(PLAN_EINHEITEN, pe.id);
  await remove(PLAENE, plan.id);
}
export const loeschePlanEinheit = (id) => remove(PLAN_EINHEITEN, id);

// Plan-Einheiten des aktiven Plans für einen Tag (Standard heute).
export function planFuerTag({ plaene, planEinheiten }, tag = wochentag()) {
  const aktiv = plaene.find((p) => p.aktiv);
  return aktiv ? planEinheiten.filter((pe) => pe.plan_id === aktiv.id && pe.wochentag === tag) : [];
}

// Heute schon aus dieser Plan-Einheit gestartet?
export const gestartet = (pe, einheiten) => einheiten.find((e) => e.plan_einheit_id === pe.id && e.datum === tagISO());

// Einheit aus Plan: heute schon gestartete öffnen, sonst neu anlegen, Sätze mit den Zielwerten vorbefüllt.
export async function starte(pe, einheiten) {
  const da = gestartet(pe, einheiten);
  if (da) return da;
  const e = await save(EINHEITEN, { datum: tagISO(), art: pe.art, titel: pe.titel, notiz: '', plan_einheit_id: pe.id });
  let r = Date.now();
  for (const z of pe.uebungen) {
    for (let i = 0; i < Math.max(1, z.saetze || 1); i++) {
      await save(SAETZE, { einheit_id: e.id, uebung_id: z.uebung_id, reihenfolge: r++,
        wdh: z.wdh ?? null, gewicht: z.gewicht ?? null, zeit: z.zeit ?? null, distanz: z.distanz ?? null });
    }
  }
  return e;
}
