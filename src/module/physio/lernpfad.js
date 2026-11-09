// Lernpfad: Schritt für Schritt von der Region bis zur Übung. Die Karte zeigt dann nur die nächste Stufe
// (gibt es dort nichts Verknüpftes, die übernächste usw.); oben eine Leiste mit den gewählten Schritten.
// Keine eigenen Daten: nur die vorhandenen Verknüpfungen. pfad = ids vom Start bis zur Mitte.
import { el } from '../../ui/dom.js';
import { art } from './arten.js';
import { nachbarn } from './daten.js';

const STUFEN = [['region'], ['krankheitsbild'], ['muskel', 'trainingsform'], ['uebung']];

// ids, die als nächste Schritte gezeigt werden (leer = Ende des Pfads)
export function naechste(pfad, eintraege, links) {
  const mitte = eintraege.find((e) => e.id === pfad.at(-1));
  if (!mitte) return new Set();
  const nb = nachbarn(mitte.id, eintraege, links).filter((e) => !pfad.includes(e.id));
  for (let s = STUFEN.findIndex((a) => a.includes(mitte.art)) + 1; s < STUFEN.length; s++) {
    const treffer = nb.filter((e) => STUFEN[s].includes(e.art));
    if (treffer.length) return new Set(treffer.map((e) => e.id));
  }
  return new Set();
}

// Leiste: Schritte antippen = zurück dorthin, ✕ = Pfad beenden (ganze Mindmap um die Mitte)
export function pfadLeiste({ pfad, eintraege, weiter, gehe, beenden }) {
  const schritte = pfad.map((id, i) => {
    const e = eintraege.find((x) => x.id === id);
    const letzter = i === pfad.length - 1;
    return el('button', {
      class: `mm-pfad__schritt${letzter ? ' mm-pfad__schritt--jetzt' : ''}`,
      attrs: { type: 'button', ...(letzter ? { 'aria-current': 'step' } : {}) },
      on: { click: () => !letzter && gehe(i) },
    }, [el('span', { class: 'mm-pfad__art', text: art(e?.art).name }), e?.titel ?? '…']);
  });
  return el('nav', { class: 'mm-pfad', attrs: { 'aria-label': 'Lernpfad' } }, [
    el('div', { class: 'mm-pfad__schritte' }, schritte),
    el('span', { class: 'mm-pfad__hinweis', text: weiter ? 'Nächsten Schritt wählen' : 'Ziel erreicht · „Text“ öffnet den Eintrag' }),
    el('button', { class: 'mm-pfad__ende', text: '✕ Pfad', attrs: { type: 'button', 'aria-label': 'Lernpfad beenden' }, on: { click: beenden } }),
  ]);
}
