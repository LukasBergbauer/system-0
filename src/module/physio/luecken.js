// Lücken finden (Kosmos, Physio in der Mitte, Knopf „Lücken“): zeigt, wo in der Datenbank noch etwas fehlt.
// Gruppen: ohne Verknüpfung, ohne Inhalt (nur Titel), Krankheitsbild/Muskel ohne verknüpfte Übung.
// Punkt antippen → Fenster zu, Ball fliegt im Kosmos in die Mitte (hin(id)).
import { el } from '../../ui/dom.js';
import { art } from './arten.js';
import { nachbarn } from './daten.js';
import { oeffneFlaeche } from './glas-flaeche.js';

const OHNE_UEBUNG = ['krankheitsbild', 'muskel'];
const leer = (e) => !e.kurz?.trim() && !e.text?.trim() && !e.video?.trim()
  && !Object.values(e.felder ?? {}).some((v) => String(v ?? '').trim());

export function luecken(eintraege, links) {
  const nb = new Map(eintraege.map((e) => [e.id, nachbarn(e.id, eintraege, links)]));
  return [
    { titel: 'Ohne Verknüpfung', punkte: eintraege.filter((e) => !nb.get(e.id).length) },
    { titel: 'Nur Titel, noch kein Inhalt', punkte: eintraege.filter(leer) },
    {
      titel: 'Ohne verknüpfte Übung',
      punkte: eintraege.filter((e) => OHNE_UEBUNG.includes(e.art) && !nb.get(e.id).some((x) => x.art === 'uebung')),
    },
  ];
}

export const anzahlLuecken = (eintraege, links) => new Set(luecken(eintraege, links).flatMap((g) => g.punkte.map((e) => e.id))).size;

export function oeffneLuecken({ ausBubble, eintraege, links, hin, signal }) {
  const gruppen = luecken(eintraege, links).filter((g) => g.punkte.length);
  let f = null;
  const zeile = (e) => el('button', { class: 'tief__zeile', attrs: { type: 'button' }, on: { click: () => { f?.schliessen(); hin(e.id); } } }, [
    el('span', { class: 'tief__zeile-art', text: art(e.art).name }),
    el('span', { class: 'tief__zeile-titel', text: e.titel }),
  ]);
  const inhalt = gruppen.length
    ? gruppen.map((g) => el('section', { class: 'tief__liste' }, [
      el('p', { class: 'label', text: `${g.titel} · ${g.punkte.length}` }),
      ...g.punkte.map(zeile),
    ]))
    : [el('p', { class: 'tief__leer', text: 'Keine Lücken – alles verknüpft und gefüllt.' })];
  f = oeffneFlaeche({ name: 'Lücken', ausBubble, signal, inhalt: [el('h2', { class: 'tief__titel', text: 'Lücken' }), ...inhalt] });
}
