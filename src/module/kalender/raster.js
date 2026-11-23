// Zeitraster für Tag und Woche: ein Scroll-Fenster mit Stunden links (klebt), Kopf mit Tag + ganztägigen Pillen
// (klebt oben) und je Tag eine Spalte mit Glas-Blöcken (Höhe = Dauer). Überlappende stehen nebeneinander.
// Jetzt-Linie in der heutigen Spalte. Wie viele Spalten sichtbar sind, regelt CSS (--sichtbar, iPhone wischbar).
import { el } from '../../ui/dom.js';
import { plusTage, tagISO, zeitHM } from './zeit.js';

const STUNDE = 48; // px je Stunde, gleich wie --zr-stunde in kalender-raster.css

const kurz = (d, o) => d.toLocaleDateString('de-DE', o);

// Teilt die zeitlichen Termine eines Tags in Spuren: [{ t, von, bis, spur, spuren }]
function spuren(liste) {
  const fertig = [];
  let gruppe = [];
  let gruppenEnde = 0;
  let enden = [];
  const abschliessen = () => {
    gruppe.forEach((b) => { b.spuren = enden.length; });
    fertig.push(...gruppe);
    gruppe = [];
    enden = [];
  };
  liste.sort((a, b) => a.von - b.von || b.bis - a.bis).forEach((b) => {
    if (gruppe.length && b.von >= gruppenEnde) abschliessen();
    let spur = enden.findIndex((e) => e <= b.von);
    if (spur < 0) spur = enden.length;
    enden[spur] = b.bis;
    b.spur = spur;
    gruppe.push(b);
    gruppenEnde = Math.max(gruppenEnde, b.bis);
  });
  abschliessen();
  return fertig;
}

function block(b, tippen) {
  const kurzBlock = b.bis - b.von < 45;
  const knopf = el(tippen(b.t) ? 'button' : 'div', {
    class: `zr__block${b.t.google ? ' zr__block--google' : ''}${kurzBlock ? ' zr__block--kurz' : ''}`,
    attrs: { type: 'button', title: `${zeitHM(new Date(b.t.start))}–${zeitHM(new Date(b.t.ende))} ${b.t.titel}` },
    on: tippen(b.t) ? { click: tippen(b.t) } : {},
  }, [
    el('span', { class: 'zr__titel', text: b.t.titel }),
    el('span', { class: 'zr__zeit', text: `${zeitHM(new Date(b.t.start))}${b.t.ort ? ` · ${b.t.ort}` : ''}` }),
  ]);
  Object.assign(knopf.style, {
    top: `${(b.von / 60) * STUNDE}px`,
    height: `${Math.max(((b.bis - b.von) / 60) * STUNDE, 22) - 2}px`,
    left: `calc(${(b.spur / b.spuren) * 100}% + 2px)`,
    width: `calc(${100 / b.spuren}% - 4px)`,
  });
  return knopf;
}

function pille(t, tippen) {
  return el(tippen(t) ? 'button' : 'span', {
    class: `zr__pille${t.google ? ' zr__pille--google' : ''}${t.todo ? ' zr__pille--todo' : ''}`,
    text: `${t.todo ? '○ ' : ''}${t.titel}`,
    attrs: { type: 'button', title: t.titel },
    on: tippen(t) ? { click: tippen(t) } : {},
  });
}

// start = 0:00 des ersten Tags; tage = Anzahl Spalten; tippen(t) → Klick-Funktion oder null;
// lage = { top, left } zum Wiederherstellen (sonst 7 Uhr bzw. jetzt − 1 h, heutige Spalte)
export function zeitraster({ termine, start, tage, art, tippen, lage }) {
  const jetzt = new Date();
  const heute = tagISO(jetzt);
  const kopf = [el('div', { class: 'zr__ecke' })];
  const spalten = [];
  let heuteIndex = -1;

  for (let i = 0; i < tage; i++) {
    const von = plusTage(start, i);
    const bis = plusTage(von, 1);
    const anTag = termine.filter((t) => Date.parse(t.start) < +bis && Date.parse(t.ende) > +von);
    const ganz = anTag.filter((t) => t.ganztaegig || (Date.parse(t.start) <= +von && Date.parse(t.ende) >= +bis));
    const zeitlich = anTag.filter((t) => !ganz.includes(t)).map((t) => ({
      t,
      von: Math.max(0, (Date.parse(t.start) - von) / 6e4),
      bis: Math.min(1440, (Date.parse(t.ende) - von) / 6e4),
    }));
    const istHeute = tagISO(von) === heute;
    if (istHeute) heuteIndex = i;

    kopf.push(el('div', { class: `zr__kopf${istHeute ? ' zr__kopf--heute' : ''}` }, [
      el('div', { class: 'zr__datum' }, [
        el('span', { class: 'zr__wt', text: kurz(von, { weekday: tage === 1 ? 'long' : 'short' }) }),
        el('span', { class: 'zr__nr', text: von.getDate() }),
      ]),
      el('div', { class: 'zr__ganz' }, ganz.map((t) => pille(t, tippen))),
    ]));

    const spalte = el('div', { class: `zr__spalte${istHeute ? ' zr__spalte--heute' : ''}` },
      spuren(zeitlich).map((b) => block(b, tippen)));
    if (istHeute) {
      const linie = el('div', { class: 'zr__jetzt' });
      linie.style.top = `${((jetzt.getHours() * 60 + jetzt.getMinutes()) / 60) * STUNDE}px`;
      spalte.append(linie);
    }
    spalten.push(spalte);
  }

  const stunden = el('div', { class: 'zr__stunden' },
    Array.from({ length: 24 }, (_, h) => el('span', { class: 'zr__h', text: h ? `${String(h).padStart(2, '0')}:00` : '' })));
  const innen = el('div', { class: 'zr__innen' }, [...kopf, stunden, ...spalten]);
  innen.style.setProperty('--tage', tage);
  const fenster = el('div', { class: `zr zr--${art}` }, [innen]);

  // Nach dem Einhängen: Lage wiederherstellen oder sinnvoll starten
  requestAnimationFrame(() => {
    if (lage) { fenster.scrollTop = lage.top; fenster.scrollLeft = lage.left; return; }
    const ab = heuteIndex >= 0 ? Math.max(0, jetzt.getHours() - 1) : 7;
    fenster.scrollTop = ab * STUNDE;
    if (heuteIndex > 0) fenster.scrollLeft = kopf[heuteIndex + 1].offsetLeft - stunden.offsetWidth;
  });
  return fenster;
}
