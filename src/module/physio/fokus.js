// Fokus-Karte: ein Punkt in der Mitte, seine Verknüpfungen als Wolken-Bubbles ringsum (feste Plätze).
// Antippen eines Nachbarn → waehle(id): diese Bubble schwebt in die Mitte, alle anderen blenden aus,
// danach perlen die neuen Nachbarn aus der Mitte heraus.
// Linien: gebogene Lichtfäden Mitte → Nachbar (enden am Rand der Bubble); fein auch zwischen verknüpften Nachbarn.
// Mitte antippen → mitteTippen(id, knopf) (anderes Interface, z. B. Text). Neue Nachbarn tauchen nacheinander auf.
// Unten: „Text“ → oeffnen() (Eintrag), „+ Verknüpfen“ → verknuepfen(). Nachbar lange drücken/Rechtsklick → loesen(mitte, nachbar).
// Punkte mit Titelbild sind runde Bälle (knoten.js); dann passen auf dem iPhone 6 statt 8 in den Ring.
// const k = fokusKarte({ waehle, zeigeAlle, verknuepfen, loesen, oeffnen }); k.zeige(eintraege, links, mitteId, bilder, nur);
// nur = Set von ids (Lernpfad: nur diese Nachbarn zeigen) oder null
import { el } from '../../ui/dom.js';
import { nachbarn } from './daten.js';
import { groessen, positionen } from './fokus-layout.js';
import { knoten, fuelleKnoten, fuelleMehr } from './knoten.js';
import { gleite, setzeZiel } from './gleiten.js';
import { titelbilder } from './bilder.js';
import { tipps } from './tipps.js';

const SVG = 'http://www.w3.org/2000/svg';
const MEHR = 'mehr';
const AUSBLENDEN_MS = 400;
const NEUE_SPAETER_MS = 320; // neue Nachbarn erst, wenn die alten weg sind
// Dauer des Gleitens, muss zu --mm-gleiten in physio-karte.css passen. Der Text eines Punkts, der die Rolle
// wechselt (Nachbar ↔ Mitte), ist währenddessen aus (Schrift springt unsichtbar um) und blendet schon kurz
// vor dem Ankommen wieder ein, damit nichts „einrastet“.
const GLEITEN_MS = 900;
const TEXT_EIN_MS = Math.round(GLEITEN_MS * 0.55);
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const paar = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);

export function fokusKarte({ waehle, zeigeAlle, verknuepfen, loesen, oeffnen, mitteTippen, loesbar = true }) {
  const tipp = tipps({ loesbar });
  const linien = document.createElementNS(SVG, 'svg');
  linien.setAttribute('class', 'mm-karte__linien');
  linien.setAttribute('aria-hidden', 'true');
  const ebene = el('div', { class: 'mm-karte__knoten' });
  const fuss = el('div', { class: 'mm-karte__fuss' });
  const text = el('button', {
    class: 'mm-karte__text', text: 'Text', attrs: { type: 'button' }, on: { click: () => oeffnen() },
  });
  const plus = el('button', {
    class: 'chip chip--aktion mm-karte__plus', text: '+ Verknüpfen',
    attrs: { type: 'button' }, on: { click: () => verknuepfen() },
  });
  const element = el('div', { class: 'mm-karte' }, [linien, ebene, fuss, tipp.element]);

  const knoepfe = new Map(); // id → Knopf (bleibt über Wechsel hinweg erhalten)
  let stand = null; // { eintraege, links, mitteId }
  let alteMitte = null;

  function tippen(id) {
    if (!stand) return;
    if (id === stand.mitteId) { tipp.lerne('mitte'); return mitteTippen?.(id, knoepfe.get(id)); }
    if (id === MEHR) zeigeAlle();
    else waehle(id);
  }

  function lang(id) {
    if (!stand || id === stand.mitteId || id === MEHR) return;
    const finde = (x) => stand.eintraege.find((e) => e.id === x);
    const mitte = finde(stand.mitteId);
    const nachbar = finde(id);
    if (mitte && nachbar) { tipp.lerne('loesen'); loesen(mitte, nachbar); }
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
    knopf.wechselTimer = setTimeout(() => knopf.classList.remove('mm-knoten--wechsel'), TEXT_EIN_MS);
  }

  function entferne(id, knopf) {
    knoepfe.delete(id);
    knopf.classList.add('mm-knoten--weg');
    knopf.disabled = true;
    setTimeout(() => knopf.remove(), AUSBLENDEN_MS);
  }

  // Gebogener Faden von Rand zu Rand (Bubbles sind Glas, die Linie soll nicht hindurchscheinen)
  function faden(a, b, ra, rb, i, klasse = '') {
    const dx = b.x - a.x; const dy = b.y - a.y; const l = Math.hypot(dx, dy) || 1;
    const ux = dx / l; const uy = dy / l;
    if (l <= ra + rb + 4) return '';
    const s = { x: a.x + ux * ra, y: a.y + uy * ra };
    const e = { x: b.x - ux * rb, y: b.y - uy * rb };
    const bogen = (i % 2 ? 1 : -1) * l * (0.08 + (i % 3) * 0.03);
    const c = { x: (s.x + e.x) / 2 - uy * bogen, y: (s.y + e.y) / 2 + ux * bogen };
    const r = (v) => Math.round(v);
    return `<path${klasse} d="M${r(s.x)} ${r(s.y)} Q${r(c.x)} ${r(c.y)} ${r(e.x)} ${r(e.y)}"/>`;
  }

  function zeichneLinien(w, h, ziele, links, neueMitte) {
    const verbunden = new Set(links.map((l) => paar(l.a_id, l.b_id)));
    const radius = (id) => (knoepfe.get(id)?.offsetWidth ?? 0) / 2;
    const nb = ziele.filter((z) => z.id !== MEHR && z.id !== stand.mitteId);
    const rm = radius(stand.mitteId);
    const weit = Math.max(1, ...nb.map((z) => Math.hypot(z.x, z.y)));
    const striche = [`<defs><radialGradient id="mm-faden" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="${Math.round(weit)}">`
      + '<stop offset="0" stop-opacity=".6"/><stop offset="1" stop-opacity=".14"/></radialGradient></defs>'];
    nb.forEach((z, i) => striche.push(faden({ x: 0, y: 0 }, z, rm, radius(z.id), i)));
    for (let i = 0; i < nb.length; i++) {
      for (let j = i + 1; j < nb.length; j++) {
        if (verbunden.has(paar(nb[i].id, nb[j].id))) {
          striche.push(faden(nb[i], nb[j], radius(nb[i].id), radius(nb[j].id), i + j, ' class="quer"'));
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
      // Linien blenden mit den neuen Punkten ein
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
    const titel = titelbilder(stand.bilder);
    const mitte = eintraege.find((e) => e.id === mitteId);
    if (!mitte) return;

    const g = groessen(w);
    element.style.setProperty('--mm-mitte', `${g.mitte}px`);
    element.style.setProperty('--mm-breit', `${g.breit}px`);
    element.style.setProperty('--mm-hoch', `${g.hoch}px`);
    element.style.setProperty('--mm-ball', `${g.ball}px`);
    ebene.style.height = linien.style.height = `${h}px`;

    const alle = nachbarn(mitteId, eintraege, links).filter((e) => !stand.nur || stand.nur.has(e.id));
    const { punkte, plaetze } = positionen(alle.length, w, h, alle.some((e) => titel.has(e.id)));
    const zuViele = alle.length > plaetze;
    const sichtbar = zuViele ? alle.slice(0, plaetze - 1) : alle;

    const ziele = [{ id: mitteId, x: 0, y: 0, eintrag: mitte }];
    sichtbar.forEach((e, i) => ziele.push({ id: e.id, ...punkte[i], eintrag: e }));
    if (zuViele) ziele.push({ id: MEHR, ...punkte[plaetze - 1], mehr: alle.length - sichtbar.length });

    const neueMitte = mitteId !== alteMitte;
    const wechsel = neueMitte && alteMitte !== null && !reduceMotion();
    // Wegfallende vorher aussortieren: sie blenden mit Übergang aus (nicht im Schritt ohne Übergang).
    // Neue Mitte: alle außer der angetippten Bubble gehen, die neuen Nachbarn kommen danach.
    const ids = new Set(wechsel ? [mitteId] : ziele.map((z) => z.id));
    for (const [id, knopf] of knoepfe) if (!ids.has(id)) entferne(id, knopf);
    // gleite: misst vorher, setzt den neuen Stand ohne Übergang und lässt dann nur Verschieben/Skalieren laufen
    gleite(ebene, [...knoepfe.values()], () => {
      for (const z of ziele) {
        let knopf = knoepfe.get(z.id);
        if (!knopf) {
          knopf = knoten(z.id, tippen, lang);
          ebene.append(knopf);
          knoepfe.set(z.id, knopf);
        }
        if (z.mehr) fuelleMehr(knopf, z.mehr);
        else fuelleKnoten(knopf, z.eintrag, titel.get(z.id));
        rolle(knopf, z.id === mitteId);
        setzeZiel(knopf, z);
      }
    }, wechsel ? NEUE_SPAETER_MS : 0);

    zeichneLinien(w, h, ziele, links, neueMitte);
    const n = alle.length;
    fuss.replaceChildren(
      mitte.kurz && el('span', { class: 'mm-karte__kurz', text: mitte.kurz }),
      el('span', { class: 'app__note', text: stand.nur
        ? (n ? `${n} nächste${n === 1 ? 'r Schritt' : ' Schritte'}` : 'Ende des Pfads')
        : (n ? (n === 1 ? '1 Verknüpfung' : `${n} Verknüpfungen`) : 'Noch keine Verknüpfungen') }),
      el('div', { class: 'mm-karte__knoepfe' }, [text, plus]),
    );
    alteMitte = mitteId;
    tipp.zeige(sichtbar.length, fuss.offsetHeight + 8);
  }

  // Größe ändert sich (Drehen, Fenster) → nur neu anordnen
  new ResizeObserver(() => render()).observe(element);

  function zeige(eintraege, links, mitteId, bilder = [], nur = null) {
    stand = { eintraege, links, mitteId, bilder, nur };
    render();
  }

  return { element, zeige };
}
