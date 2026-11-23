// Monatsansicht: Pfeile ‹ › mit Monatsname (antippen = dieser Monat), Glas-Raster Mo–So mit Punkten je Termin
// (Mac: Uhrzeit + kurzer Titel, „+n“), darunter die Termine des gewählten Tags. Tag antippen wechselt die Liste
// darunter, gewählten Tag nochmal antippen = Tagesansicht (onTagAnsicht).
import { abschnitt } from '../../ui/abschnitt.js';
import { el } from '../../ui/dom.js';
import { list } from '../../ui/list.js';
import { plusTage, tagISO, zeitHM } from './zeit.js';
import { montag, navKopf } from './woche.js';

export const monatsErster = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const amTag = (t, von) => Date.parse(t.start) < +plusTage(von, 1) && Date.parse(t.ende) > +von;
const sortiert = (liste) => liste.sort((a, b) => !!b.ganztaegig - !!a.ganztaegig || Date.parse(a.start) - Date.parse(b.start));

// start = 1. des Monats; tag = gewählter Tag (oder null); onTag(d) merkt die Wahl
export function monatAnsicht({ termine, start, tag, onWechsel, onTag, onTagAnsicht, zeile }) {
  const heute = tagISO(new Date());
  const erster = montag(start);
  const wochen = Math.ceil(((start - erster) / 864e5 + new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate()) / 7);
  let gewaehlt = tag && tag.getMonth() === start.getMonth() ? tag : (heute.startsWith(tagISO(start).slice(0, 7)) ? new Date() : start);
  gewaehlt = new Date(gewaehlt.getFullYear(), gewaehlt.getMonth(), gewaehlt.getDate());
  const tagListe = el('section', { class: 'termin-gruppe monat__liste' });

  const zellen = Array.from({ length: wochen * 7 }, (_, i) => {
    const d = plusTage(erster, i);
    const anTag = sortiert(termine.filter((t) => amTag(t, d)));
    const z = el('button', {
      class: `monat__tag${d.getMonth() !== start.getMonth() ? ' monat__tag--fremd' : ''}${tagISO(d) === heute ? ' monat__tag--heute' : ''}`,
      attrs: { type: 'button', 'aria-label': `${d.toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })}, ${anTag.length} Einträge` },
      on: { click: () => waehle(d, z) },
    }, [
      el('span', { class: 'monat__zahl', text: d.getDate() }),
      el('span', { class: 'monat__punkte' }, [
        ...anTag.slice(0, 3).map((t) => el('i', {
          class: `monat__punkt${t.google ? ' monat__punkt--google' : ''}${t.todo ? ' monat__punkt--todo' : ''}`,
          text: `${t.ganztaegig ? '' : `${zeitHM(new Date(t.start))} `}${t.titel}`,
        })),
        anTag.length > 3 && el('i', { class: 'monat__mehr', text: `+${anTag.length - 3}` }),
      ]),
    ]);
    z.datum = d;
    return z;
  });

  function waehle(d, zelle) {
    if (zelle.classList.contains('monat__tag--an')) { onTagAnsicht(d); return; }
    gewaehlt = d;
    onTag(d);
    zellen.forEach((z) => z.classList.toggle('monat__tag--an', z === zelle));
    const anTag = sortiert(termine.filter((t) => amTag(t, d)));
    tagListe.replaceChildren(
      abschnitt({ titel: d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }), symbol: 'kalender' }),
      anTag.length ? list(anTag.map(zeile)) : el('p', { class: 'woche__leer', text: 'Frei.' }),
    );
  }
  waehle(gewaehlt, zellen.find((z) => +z.datum === +gewaehlt));

  const name = start.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  return el('div', { class: 'woche monat' }, [
    navKopf({
      text: name,
      titel: 'Dieser Monat',
      zurueck: () => onWechsel(new Date(start.getFullYear(), start.getMonth() - 1, 1)),
      vor: () => onWechsel(new Date(start.getFullYear(), start.getMonth() + 1, 1)),
      jetzt: () => onWechsel(monatsErster(new Date())),
    }),
    el('div', { class: 'monat__raster' }, [
      ...['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((w) => el('span', { class: 'monat__wt label', text: w })),
      ...zellen,
    ]),
    tagListe,
  ]);
}
