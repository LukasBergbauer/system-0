// Heute bearbeiten: festes Raster, je Feld „−“ (entfernen), Griff oben rechts (verschieben auf einen anderen Platz)
// und Ecke unten rechts (in Rastergrößen größer/kleiner ziehen). „+ Feld“ öffnet die Auswahl (katalog.js → auswahl).
// Nur Pointer-Ereignisse auf den kleinen Griffen (touch-action: none) – der Rest der Seite scrollt normal.
import { el } from '../../ui/dom.js';
import { symbol } from '../../ui/symbol.js';
import { modal } from '../../ui/modal.js';
import { ARTEN, auswahl } from './katalog.js';
import { MAX_H } from './layout.js';

const knopf = (klasse, label, inhalt) => el('button', { class: klasse, attrs: { type: 'button', 'aria-label': label } }, inhalt);

// Griffe an eine Feld-Hülle hängen (i = Platz im Layout)
export function griffe(huelle, i) {
  huelle.dataset.i = i;
  huelle.append(
    knopf('feld-weg', 'Feld entfernen', [el('i')]),
    knopf('feld-griff feld-griff--bewegen', 'Feld verschieben', [el('i'), el('i'), el('i')]),
    knopf('feld-griff feld-griff--groesse', 'Größe ändern', []),
  );
}

export function plusFeld(klick) {
  return el('button', { class: 'feld feld--w1 feld--h1 feld-plus', attrs: { type: 'button' }, on: { click: klick } }, [symbol('plus'), 'Feld']);
}

function masse(raster) {
  const s = getComputedStyle(raster);
  const spalten = s.gridTemplateColumns.split(' ').length;
  const luecke = parseFloat(s.columnGap) || 0;
  return { spalten, luecke, zeile: parseFloat(s.gridAutoRows.match(/[\d.]+/)?.[0]) || 150, spalte: (raster.clientWidth - luecke * (spalten - 1)) / spalten };
}

const klassen = (h, w, hh) => {
  h.className = h.className.replace(/feld--[wh]\d/g, '').trim() + ` feld--w${w} feld--h${hh}`;
};

// box = Hülle der Ansicht; aendern: { entfernen(i), verschieben(reihenfolge), groesse(i, w, h) }
export function bearbeitbar(box, aendern, signal) {
  box.addEventListener('click', (e) => {
    const weg = e.target.closest('.feld-weg');
    if (weg) aendern.entfernen(Number(weg.parentElement.dataset.i));
  }, { signal });

  box.addEventListener('pointerdown', (e) => {
    const griff = e.target.closest('.feld-griff');
    if (!griff || e.button > 0) return;
    e.preventDefault();
    const huelle = griff.parentElement;
    const raster = huelle.parentElement;
    const m = masse(raster);
    const start = { x: e.clientX, y: e.clientY, w: Number(huelle.style.getPropertyValue('--w')), h: Number(huelle.style.getPropertyValue('--h')) };
    const groesse = griff.classList.contains('feld-griff--groesse');
    let ziel = null, neu = { w: start.w, h: start.h };
    huelle.classList.add('feld--zieht');
    griff.setPointerCapture(e.pointerId);

    const bewegen = (ev) => {
      if (groesse) {
        neu = {
          w: Math.min(m.spalten, Math.max(1, Math.round(Math.min(start.w, m.spalten) + (ev.clientX - start.x) / (m.spalte + m.luecke)))),
          h: Math.min(MAX_H, Math.max(1, Math.round(start.h + (ev.clientY - start.y) / (m.zeile + m.luecke)))),
        };
        klassen(huelle, neu.w, neu.h);
        return;
      }
      // Verschieben: Feld unter dem Finger suchen, davor bzw. dahinter einreihen (nur einmal je Ziel)
      const unter = document.elementsFromPoint(ev.clientX, ev.clientY).find((x) => x.matches?.('.feld[data-i]') && x !== huelle);
      if (!unter || unter === ziel) return;
      ziel = unter;
      const kinder = [...raster.children];
      unter[kinder.indexOf(unter) > kinder.indexOf(huelle) ? 'after' : 'before'](huelle);
    };
    const ende = () => {
      griff.removeEventListener('pointermove', bewegen);
      huelle.classList.remove('feld--zieht');
      if (groesse) {
        if (neu.w !== start.w || neu.h !== start.h) aendern.groesse(Number(huelle.dataset.i), neu.w, neu.h);
      } else {
        aendern.verschieben([...raster.querySelectorAll('.feld[data-i]')].map((f) => Number(f.dataset.i)));
      }
    };
    griff.addEventListener('pointermove', bewegen);
    griff.addEventListener('lostpointercapture', ende, { once: true });
  }, { signal });
}

// Auswahl-Fenster: Gruppen mit Feldern, Antippen fügt hinzu
export function hinzufuegen(d, waehlen) {
  const m = modal({
    title: 'Feld hinzufügen',
    content: auswahl(d).map((g) => el('section', { class: 'feld-wahl' }, [
      el('p', { class: 'label', text: g.titel }),
      el('div', { class: 'feld-wahl__liste' }, g.eintraege.map((e) => el('button', {
        class: 'feld-wahl__knopf', attrs: { type: 'button', 'data-bereich': ARTEN[e.typ].bereich },
        on: { click: () => { m.close(); waehlen({ typ: e.typ, ...(e.ref ? { ref: e.ref } : {}), w: e.w, h: e.h }); } },
      }, [el('span', { class: 'feld-symbol' }, [symbol(ARTEN[e.typ].symbol)]), el('span', { text: e.titel }), el('small', { text: `${e.w}×${e.h}` })]))),
    ])),
  });
  m.open();
}
