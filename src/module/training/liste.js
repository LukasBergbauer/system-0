// Startseite Training: Kacheln (diese Woche, Wochen in Folge), „Heute laut Plan“, „+ Einheit“, Tabs Einheiten | Pläne | Übungen.
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { tabs } from '../../ui/tabs.js';
import { list, listRow } from '../../ui/list.js';
import { kacheln, kachel } from '../../ui/kachel.js';
import { ARTEN, gruppen } from './daten.js';
import { dieseWoche, wochenSerie, verlauf, bestwert } from './rechnen.js';
import { waehleUebung } from './wahl.js';
import { plaeneListe, heutePlan } from './plaene.js';

const DATUM = new Intl.DateTimeFormat('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
export const datumText = (tag) => DATUM.format(new Date(`${tag}T12:00`));
export const artLabel = (id) => ARTEN.find((a) => a.id === id)?.label ?? 'Training';

function einheitenListe({ daten, oeffne }) {
  if (!daten.einheiten.length) return el('p', { class: 'app__note', text: 'Noch keine Einheit eingetragen.' });
  return list(daten.einheiten.map((e) => {
    const namen = gruppen(e).map((g) => daten.uebungen.get(g.uebung_id)?.name).filter(Boolean);
    const werte = [e.gefuehl && `Gefühl ${e.gefuehl}/5`, e.belastung && `RPE ${e.belastung}`].filter(Boolean).join(' · ');
    return listRow({
      title: e.titel || artLabel(e.art),
      sub: [datumText(e.datum), namen.join(', ') || 'keine Übungen'].join(' · '),
      end: werte,
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
  return [list(alle.map((u) => {
    const v = verlauf(u, daten.einheiten);
    const best = bestwert(v.flatMap((x) => x.saetze), u.messung);
    return listRow({
      title: u.name,
      sub: [u.physio && 'aus PhysioZentrum', v.length ? `${v.length}× gemacht` : 'noch nie gemacht'].filter(Boolean).join(' · '),
      end: best?.text ?? '',
      onClick: () => oeffne('uebung', u.id),
    });
  })), neu];
}

export function listeSeite(hilfen) {
  const { daten, merk, neu } = hilfen;
  const inhalt = el('div', { class: 'card training__liste' });
  const LISTEN = { einheiten: einheitenListe, plaene: plaeneListe, uebungen: uebungenListe };
  const zeige = () => inhalt.replaceChildren(...[LISTEN[merk.tab](hilfen)].flat());
  zeige();
  const serie = wochenSerie(daten.einheiten);
  const woche = dieseWoche(daten.einheiten);
  const plan = heutePlan(hilfen);

  return el('div', { class: 'training__seite' }, [
    kacheln([
      kachel({ symbol: 'training', titel: 'Diese Woche', wert: `${woche} ${woche === 1 ? 'Einheit' : 'Einheiten'}` }),
      kachel({ symbol: 'flamme', titel: 'In Folge', wert: `${serie} ${serie === 1 ? 'Woche' : 'Wochen'}` }),
    ]),
    plan,
    button({ text: '+ Einheit eintragen', variant: plan ? 'ghost' : 'primary', onClick: neu }),
    tabs({
      items: [{ id: 'einheiten', label: 'Einheiten' }, { id: 'plaene', label: 'Pläne' }, { id: 'uebungen', label: 'Übungen' }],
      active: merk.tab,
      onChange: (id) => { merk.tab = id; zeige(); },
    }),
    inhalt,
  ]);
}
