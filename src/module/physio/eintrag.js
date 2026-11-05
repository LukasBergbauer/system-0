// Eintrag-Ansicht: ein Punkt mit allen Feldern, direkt bearbeitbar, speichert automatisch.
// Oben Art-Chips, großer Titel, Kurzbeschreibung; dann die Felder der Art (arten.js), Notizen, Video-Link.
// Unten „Punkt löschen“ (mit Rückfrage, Verknüpfungen fallen mit weg) → danach geloescht().
// Werte anderer Arten bleiben in `felder` erhalten, auch wenn die Art gewechselt wird.
import { el } from '../../ui/dom.js';
import { chips } from '../../ui/chips.js';
import { ARTEN, art as artVon } from './arten.js';
import { aendereEintrag, loescheEintrag } from './daten.js';
import { textfeld } from './textfeld.js';

const WARTEN_MS = 500; // so lange nach dem letzten Tastendruck, dann wird gespeichert

const istLink = (s) => /^https?:\/\/\S+\.\S+/i.test(s.trim());

export function eintragAnsicht({ eintrag, geloescht }) {
  const id = eintrag.id;
  const felder = { ...(eintrag.felder ?? {}) };
  let art = eintrag.art;
  let titel = eintrag.titel;

  // ---------- Speichern: Änderungen sammeln, kurz warten, dann auf einmal ----------
  let offen = {};
  let timer = null;
  function speichereGleich() {
    clearTimeout(timer);
    timer = null;
    if (!Object.keys(offen).length) return;
    const teil = offen;
    offen = {};
    aendereEintrag({ id, ...teil });
  }
  function merke(teil) {
    Object.assign(offen, teil);
    clearTimeout(timer);
    timer = setTimeout(speichereGleich, WARTEN_MS);
  }

  // ---------- Felder ----------
  const titelFeld = textfeld({
    wert: titel, platzhalter: 'Titel', klasse: 'mm-eintrag__titel', einzeilig: true,
    onWert: (v) => { if (v.trim()) { titel = v.trim(); merke({ titel }); } },
  });
  // leerer Titel ist nicht erlaubt: beim Verlassen den letzten gültigen zurückholen
  titelFeld.feld.addEventListener('blur', () => { if (!titelFeld.feld.value.trim()) titelFeld.feld.value = titel; });

  const kurzFeld = textfeld({
    wert: eintrag.kurz ?? '', platzhalter: 'Kurzbeschreibung – erscheint in der Mindmap', klasse: 'mm-eintrag__kurz',
    onWert: (v) => merke({ kurz: v.trim() }),
  });

  const artFelder = el('div', { class: 'mm-eintrag__felder' });
  function zeigeArtFelder() {
    artFelder.replaceChildren(...artVon(art).felder.map((f) => textfeld({
      label: f.label, wert: felder[f.key] ?? '', platzhalter: '–',
      onWert: (v) => { felder[f.key] = v; merke({ felder: { ...felder } }); },
    })));
  }
  zeigeArtFelder();

  const notizen = textfeld({
    label: 'Notizen', wert: eintrag.text ?? '', platzhalter: '–', onWert: (v) => merke({ text: v }),
  });

  const oeffnen = el('a', { class: 'mm-eintrag__video', text: 'Video öffnen ↗', attrs: { target: '_blank', rel: 'noopener' } });
  function zeigeLink(v) {
    oeffnen.hidden = !istLink(v);
    if (!oeffnen.hidden) oeffnen.href = v.trim();
  }
  const video = textfeld({
    label: 'Video-Link', wert: eintrag.video ?? '', platzhalter: 'https://…', einzeilig: true,
    onWert: (v) => { zeigeLink(v); merke({ video: v.trim() }); },
  });
  video.feld.setAttribute('inputmode', 'url');
  video.feld.setAttribute('autocapitalize', 'off');
  zeigeLink(eintrag.video ?? '');

  const loeschen = el('button', {
    class: 'btn btn--ghost mm-eintrag__loeschen', text: 'Punkt löschen', attrs: { type: 'button' },
    on: {
      click: async () => {
        if (!confirm(`„${titel}“ löschen?\n\nSeine Verknüpfungen werden mit gelöscht.`)) return;
        clearTimeout(timer);
        offen = {};
        await loescheEintrag(id);
        geloescht();
      },
    },
  });

  const element = el('div', { class: 'mm-eintrag' }, [
    chips({
      items: ARTEN.map((a) => ({ id: a.id, label: a.name })),
      active: art,
      onChange: (neu) => { art = neu; merke({ art }); zeigeArtFelder(); },
    }),
    titelFeld,
    kurzFeld,
    el('hr', { class: 'strich' }),
    artFelder,
    notizen,
    el('div', { class: 'mm-eintrag__video-zeile' }, [video, oeffnen]),
    el('p', { class: 'app__note', text: 'Änderungen werden automatisch gespeichert.' }),
    loeschen,
  ]);
  // Verlassen eines Felds speichert sofort (z. B. vor „‹ Zurück“)
  element.addEventListener('focusout', speichereGleich);
  element.dataset.eintrag = id;
  return element;
}
