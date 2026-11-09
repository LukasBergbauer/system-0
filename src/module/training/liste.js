// Startseite Training: Wochen-Leiste (Einheiten / Ziel als Balken), „Heute“ mit großem Start, „+ Freies Training“, Tabs Einheiten | Pläne | Übungen.
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { tabs } from '../../ui/tabs.js';
import { list, listRow } from '../../ui/list.js';
import { ARTEN, gruppen } from './daten.js';
import { dieseWoche, wochenSerie, verlauf, bestwert, zuletztText, datumText } from './rechnen.js';
import { waehleUebung } from './wahl.js';
import { plaeneListe, heutePlan } from './plaene.js';
import { planFuerTag } from './plan-daten.js';

const artLabel = (id) => ARTEN.find((a) => a.id === id)?.label ?? 'Training';
const mehrzahl = (n, eins, viele) => `${n} ${n === 1 ? eins : viele}`;

// Ziel = Einheiten im aktiven Plan pro Woche, sonst 3.
function wochenLeiste(daten) {
  const woche = dieseWoche(daten.einheiten);
  const ziel = [1, 2, 3, 4, 5, 6, 7].reduce((n, t) => n + planFuerTag(daten, t).length, 0) || 3;
  const serie = wochenSerie(daten.einheiten);
  return el('section', { class: 'card training__woche' }, [
    el('div', { class: 'training__woche-kopf' }, [
      el('span', { class: 'label', text: 'Diese Woche' }),
      el('b', { text: `${woche} / ${ziel}` }),
    ]),
    el('div', { class: 'training__balken', attrs: { role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': ziel, 'aria-valuenow': woche } },
      el('i', { attrs: { style: `width:${Math.min(100, (woche / ziel) * 100)}%` } })),
    serie > 1 && el('p', { class: 'training__zahlen', text: `${mehrzahl(serie, 'Woche', 'Wochen')} in Folge` }),
  ]);
}

function einheitenListe({ daten, oeffne }) {
  if (!daten.einheiten.length) return el('p', { class: 'app__note', text: 'Noch keine Einheit eingetragen.' });
  return list(daten.einheiten.map((e) => {
    const namen = gruppen(e).map((g) => daten.uebungen.get(g.uebung_id)?.name).filter(Boolean);
    return listRow({
      title: e.titel || artLabel(e.art),
      sub: [datumText(e.datum), namen.join(', ') || 'keine Übungen'].join(' · '),
      end: e.gefuehl ? `${e.gefuehl}/5` : '',
      onClick: () => oeffne('einheit', e.id),
    });
  }));
}

function uebungenListe({ daten, oeffne }) {
  const alle = [...daten.uebungen.values()].sort((a, b) => a.name.localeCompare(b.name, 'de'));
  const neu = button({ text: '+ Übung', variant: 'ghost', onClick: async () => {
    const u = await waehleUebung(daten);
    if (u) oeffne('uebung', u.id);
  } });
  if (!alle.length) return [el('p', { class: 'app__note', text: 'Noch keine Übungen. Sie entstehen beim Eintragen oder hier.' }), neu];
  return [list(alle.map((u) => listRow({
    title: u.name,
    sub: zuletztText(u.id, daten.einheiten) || 'noch nie gemacht',
    end: bestwert(verlauf(u, daten.einheiten).flatMap((x) => x.saetze), u.messung)?.text ?? '',
    onClick: () => oeffne('uebung', u.id),
  }))), neu];
}

export function listeSeite(hilfen) {
  const { daten, merk, neu } = hilfen;
  const inhalt = el('div', { class: 'card training__liste' });
  const LISTEN = { einheiten: einheitenListe, plaene: plaeneListe, uebungen: uebungenListe };
  const zeige = () => inhalt.replaceChildren(...[LISTEN[merk.tab](hilfen)].flat());
  zeige();

  return el('div', { class: 'training__seite' }, [
    wochenLeiste(daten),
    heutePlan(hilfen),
    button({ text: '+ Freies Training', variant: 'normal', onClick: neu }),
    tabs({
      items: [{ id: 'einheiten', label: 'Einheiten' }, { id: 'plaene', label: 'Pläne' }, { id: 'uebungen', label: 'Übungen' }],
      active: merk.tab,
      onChange: (id) => { merk.tab = id; zeige(); },
    }),
    inhalt,
  ]);
}
