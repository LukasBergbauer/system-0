// Heute: Serien (Streaks) für das Tagesfeld – Tage in Folge für Daily-Quiz, Aufbau-Gewohnheiten und Routinen, „Tage ohne“ für Abbau-Gewohnheiten.
// Reine Rechnung aus Rohdaten, liefert die längste laufende Serie. Heute noch offen zählt ab gestern („heute halten“).
import { tagISO } from './rechnen.js';
import { gewohnheitStand } from './gewohnheiten-leiste.js';

const vor = (jetzt, i) => tagISO(new Date(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate() - i));

function lauf(tage, jetzt) {
  const heute = tage.has(vor(jetzt, 0));
  let i = heute ? 0 : 1, n = 0;
  while (tage.has(vor(jetzt, i))) { n++; i++; }
  return { n, offen: !heute && n > 0 };
}

export function besteSerie(d, jetzt = new Date()) {
  const liste = [];
  liste.push({ name: 'Daily-Quiz', ziel: 'quiz', ...lauf(new Set(d.quiz.filter((r) => r.modus === 'daily').map((r) => r.tag)), jetzt) });
  const { gewohnheiten, logs } = d.gewohnheiten;
  for (const g of gewohnheiten) {
    if (g.art === 'ab') { liste.push({ name: g.name, ziel: 'gewohnheiten', n: gewohnheitStand(g, d.gewohnheiten).wert, ohne: true }); continue; }
    const tage = new Set(logs.filter((l) => l.gewohnheit_id === g.id && l.wert >= g.ziel).map((l) => l.tag));
    liste.push({ name: g.name, ziel: 'gewohnheiten', ...lauf(tage, jetzt) });
  }
  const { routinen, logs: rLogs } = d.routinen;
  for (const r of routinen) {
    const tage = new Set(rLogs.filter((l) => l.routine_id === r.id && l.fertig_am).map((l) => l.tag));
    liste.push({ name: r.name, ziel: 'routinen', ...lauf(tage, jetzt) });
  }
  return liste.filter((s) => s.n >= 2).sort((a, b) => b.n - a.n)[0] || null;
}
