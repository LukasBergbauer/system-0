// Startseite Training: „Heute“ mit großem Start, eine Zeile Wochen-Zahlen, „+ Freies Training“, Tabs Einheiten | Pläne | Übungen.
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { tabs } from '../../ui/tabs.js';
import { list, listRow } from '../../ui/list.js';
import { ARTEN, gruppen } from './daten.js';
import { dieseWoche, wochenSerie, verlauf, bestwert, zuletztText, datumText } from './rechnen.js';
import { waehleUebung } from './wahl.js';
import { plaeneListe, heutePlan } from './plaene.js';

const artLabel = (id) => ARTEN.find((a) => a.id === id)?.label ?? 'Training';
const mehrzahl = (n, eins, viele) => `${n} ${n === 1 ? eins : viele}`;

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
  const woche = dieseWoche(daten.einheiten);
  const serie = wochenSerie(daten.einheiten);

  return el('div', { class: 'training__seite' }, [
    heutePlan(hilfen),
    el('p', { class: 'training__zahlen', text: `Diese Woche ${mehrzahl(woche, 'Einheit', 'Einheiten')} · ${mehrzahl(serie, 'Woche', 'Wochen')} in Folge` }),
    button({ text: '+ Freies Training', variant: 'normal', onClick: neu }),
    tabs({
      items: [{ id: 'einheiten', label: 'Einheiten' }, { id: 'plaene', label: 'Pläne' }, { id: 'uebungen', label: 'Übungen' }],
      active: merk.tab,
      onChange: (id) => { merk.tab = id; zeige(); },
    }),
    inhalt,
  ]);
}
