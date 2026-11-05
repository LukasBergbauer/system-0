// Fokus-Karte: ein Punkt in der Mitte, seine Verknüpfungen schweben ringsum.
// Antippen eines Nachbarn → waehle(id): derselbe Knopf gleitet in die Mitte, die alte Mitte
// rutscht zu den Nachbarn, nicht mehr verbundene Punkte blenden aus, neue schweben aus der Mitte ein.
// Linien: Mitte → jeder Nachbar; fein auch zwischen Nachbarn, die untereinander verknüpft sind.
// Mitte antippen → oeffnen(). Unten: „+ Verknüpfen“ → verknuepfen(). Nachbar lange drücken/Rechtsklick → loesen(mitte, nachbar).
// const k = fokusKarte({ waehle, zeigeAlle, verknuepfen, loesen }); k.zeige(eintraege, links, mitteId);
import { el } from '../../ui/dom.js';
import { nachbarn } from './daten.js';
import { groessen, positionen } from './fokus-layout.js';
import { knoten, fuelleKnoten, fuelleMehr } from './knoten.js';

const SVG = 'http://www.w3.org/2000/svg';
const MEHR = 'mehr';
const AUSBLENDEN_MS = 400;
// Dauer des Gleitens, muss zu --mm-gleiten in physio-karte.css passen. So lange ist der Text eines Punkts,
// der die Rolle wechselt (Nachbar ↔ Mitte), ausgeblendet: Schrift und Größe springen dann unsichtbar um.
const GLEITEN_MS = 650;
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const paar = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);

export function fokusKarte({ waehle, zeigeAlle, verknuepfen, loesen, oeffnen }) {
  const linien = document.createElementNS(SVG, 'svg');
  linien.setAttribute('class', 'mm-karte__linien');
  linien.setAttribute('aria-hidden', 'true');
  const ebene = el('div', { class: 'mm-karte__knoten' });
  const fuss = el('div', { class: 'mm-karte__fuss' });
  const plus = el('button', {
    class: 'chip chip--aktion mm-karte__plus', text: '+ Verknüpfen',
    attrs: { type: 'button' }, on: { click: () => verknuepfen() },
  });
  const element = el('div', { class: 'mm-karte' }, [linien, ebene, fuss]);

  const knoepfe = new Map(); // id → Knopf (bleibt über Wechsel hinweg erhalten)
  let stand = null; // { eintraege, links, mitteId }
  let alteMitte = null;

  function tippen(id) {
    if (!stand) return;
    if (id === stand.mitteId) oeffnen(); // Mitte antippen: Eintrag öffnen
    else if (id === MEHR) zeigeAlle();
    else waehle(id);
  }

  function lang(id) {
    if (!stand || id === stand.mitteId || id === MEHR) return;
    const finde = (x) => stand.eintraege.find((e) => e.id === x);
    const mitte = finde(stand.mitteId);
    const nachbar = finde(id);
    if (mitte && nachbar) loesen(mitte, nachbar);
  }

  function setzePosition(knopf, { x, y }) {
    knopf.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
  }

  // Rolle wechselt (Nachbar → Mitte oder umgekehrt): Text kurz ausblenden, nach dem Gleiten wieder einblenden.
  function rolle(knopf, istMitte) {
    const neu = istMitte ? 'mitte' : 'nachbar';
    const alt = knopf.dataset.rolle;
    knopf.dataset.rolle = neu;
    knopf.classList.toggle('mm-knoten--mitte', istMitte);
    if (!alt || alt === neu || reduceMotion()) return;
    clearTimeout(knopf.wechselTimer);
    knopf.classList.add('mm-knoten--wechsel');
    knopf.wechselTimer = setTimeout(() => knopf.classList.remove('mm-knoten--wechsel'), GLEITEN_MS);
  }

  function entferne(id, knopf) {
    knoepfe.delete(id);
    knopf.classList.add('mm-knoten--weg');
    knopf.disabled = true;
    setTimeout(() => knopf.remove(), AUSBLENDEN_MS);
  }

  function zeichneLinien(w, h, ziele, links, neueMitte) {
    const verbunden = new Set(links.map((l) => paar(l.a_id, l.b_id)));
    const nb = ziele.filter((z) => z.id !== MEHR && z.id !== stand.mitteId);
    const striche = nb.map((z) => `<line x1="0" y1="0" x2="${z.x}" y2="${z.y}"/>`);
    for (let i = 0; i < nb.length; i++) {
      for (let j = i + 1; j < nb.length; j++) {
        if (verbunden.has(paar(nb[i].id, nb[j].id))) {
          striche.push(`<line class="quer" x1="${nb[i].x}" y1="${nb[i].y}" x2="${nb[j].x}" y2="${nb[j].y}"/>`);
        }
      }
    }
    if (neueMitte && linien.childElementCount && !reduceMotion()) {
      // alte Linien nicht schlagartig weg, sondern kurz ausblenden
      const alt = linien.cloneNode(true);
      alt.setAttribute('class', 'mm-karte__linien mm-karte__linien--alt');
      linien.before(alt);
      setTimeout(() => alt.remove(), AUSBLENDEN_MS);
    }
    linien.setAttribute('viewBox', `${-w / 2} ${-h / 2} ${w} ${h}`);
    linien.innerHTML = striche.join('');
    if (neueMitte) {
      // Linien erst einblenden, wenn die Punkte angekommen sind
      linien.classList.remove('mm-karte__linien--ein');
      void linien.getBoundingClientRect();
      linien.classList.add('mm-karte__linien--ein');
    }
  }

  function render() {
    const w = element.clientWidth;
    const h = element.clientHeight - fuss.offsetHeight;
    if (!stand || !w || !h) return;
    const { eintraege, links, mitteId } = stand;
    const mitte = eintraege.find((e) => e.id === mitteId);
    if (!mitte) return;

    const g = groessen(w);
    element.style.setProperty('--mm-mitte', `${g.mitte}px`);
    element.style.setProperty('--mm-breit', `${g.breit}px`);
    element.style.setProperty('--mm-hoch', `${g.hoch}px`);
    ebene.style.height = linien.style.height = `${h}px`;

    const alle = nachbarn(mitteId, eintraege, links);
    const { punkte, plaetze } = positionen(alle.length, w, h);
    const zuViele = alle.length > plaetze;
    const sichtbar = zuViele ? alle.slice(0, plaetze - 1) : alle;

    const ziele = [{ id: mitteId, x: 0, y: 0, eintrag: mitte }];
    sichtbar.forEach((e, i) => ziele.push({ id: e.id, ...punkte[i], eintrag: e }));
    if (zuViele) ziele.push({ id: MEHR, ...punkte[plaetze - 1], mehr: alle.length - sichtbar.length });

    const ids = new Set(ziele.map((z) => z.id));
    for (const [id, knopf] of knoepfe) if (!ids.has(id)) entferne(id, knopf);

    const neueMitte = mitteId !== alteMitte;
    for (const z of ziele) {
      let knopf = knoepfe.get(z.id);
      if (!knopf) {
        knopf = knoten(z.id, tippen, lang);
        knopf.classList.add('mm-knoten--neu');
        setzePosition(knopf, { x: 0, y: 0 }); // startet in der Mitte und schwebt nach außen
        ebene.append(knopf);
        knoepfe.set(z.id, knopf);
        void knopf.getBoundingClientRect(); // Startzustand festhalten, sonst gibt es keinen Übergang
        knopf.classList.remove('mm-knoten--neu');
      }
      if (z.mehr) fuelleMehr(knopf, z.mehr);
      else fuelleKnoten(knopf, z.eintrag);
      rolle(knopf, z.id === mitteId);
      setzePosition(knopf, z);
    }

    zeichneLinien(w, h, ziele, links, neueMitte);
    const n = alle.length;
    fuss.replaceChildren(
      mitte.kurz && el('span', { class: 'mm-karte__kurz', text: mitte.kurz }),
      el('span', { class: 'app__note', text: n ? (n === 1 ? '1 Verknüpfung' : `${n} Verknüpfungen`) : 'Noch keine Verknüpfungen' }),
      plus,
    );
    alteMitte = mitteId;
  }

  // Größe ändert sich (Drehen, Fenster) → nur neu anordnen
  new ResizeObserver(() => render()).observe(element);

  function zeige(eintraege, links, mitteId) {
    stand = { eintraege, links, mitteId };
    render();
  }

  return { element, zeige };
}
