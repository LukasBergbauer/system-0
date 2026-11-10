// Kosmos: Startseite von Physio, gebaut aus derselben Fokus-Karte wie die Mindmap (fokus.js).
// Gedachte Punkte: Kern „Physio“ ↔ je Bereich ein Ball ↔ alle Einträge dieses Bereichs; dazu die echten Verknüpfungen.
// So kann man sich weiterhangeln: Ball außen antippen → schwebt in die Mitte, seine Verknüpfungen tauchen auf.
// Mitte antippen → anderes Interface: Kern = Bereiche bearbeiten (bereiche.js), Bereich = Innenansicht (tiefe.js), Eintrag = sein Text.
// Oben: Suche (Treffer antippen = Ball fliegt in die Mitte), Verlauf der Mitten (antippen = dorthin zurück)
// und „+ Verknüpfen“ (nur bei echten Einträgen): Glas-Fläche mit verknuepfen.js, danach schwebt der Punkt ein.
// Nachbar lange drücken / Rechtsklick → Verknüpfung lösen (nur zwischen echten Einträgen).
import { el } from '../../ui/dom.js';
import { ARTEN, art } from './arten.js';
import { suche, loese } from './daten.js';
import { verknuepfenAnsicht } from './verknuepfen.js';
import { oeffneFlaeche } from './glas-flaeche.js';
import { fokusKarte } from './fokus.js';
import { oeffneMindmap } from './overlay.js';
import { oeffneTiefe } from './tiefe.js';
import { oeffneBereiche } from './bereiche.js';

const KERN = 'physio';
const artId = (a) => `art:${a}`;
const zahl = (n) => (n === 1 ? '1 Eintrag' : `${n} Einträge`);

export function kosmos({ signal }) {
  let verlauf = [KERN]; // Mitten bis jetzt, letzte = aktuelle
  let echte = [];
  let echteLinks = [];
  let daten = { eintraege: [], links: [], bilder: [] };
  const mitte = () => verlauf.at(-1);

  function waehle(id) {
    const i = verlauf.indexOf(id);
    verlauf = i >= 0 ? verlauf.slice(0, i + 1) : [...verlauf, id];
    zeige();
  }

  const karte = fokusKarte({
    waehle,
    zeigeAlle: () => (mitte().startsWith('art:') ? tiefe(mitte().slice(4)) : oeffneMindmap({ signal, mitteId: mitte() })),
    mitteTippen: (id, knopf) => {
      if (id === KERN) oeffneBereiche({ ausBubble: knopf, eintraege: () => echte, signal });
      else if (id.startsWith('art:')) tiefe(id.slice(4), knopf);
      else oeffneMindmap({ ausKnopf: knopf, signal, mitteId: id, ansicht: 'eintrag' });
    },
    verknuepfen() {}, oeffnen() {}, loesbar: false,
    async loesen(a, b) {
      const echt = (x) => echte.some((e) => e.id === x.id);
      if (echt(a) && echt(b) && confirm(`Verknüpfung lösen?\n\n${a.titel} – ${b.titel}`)) await loese(a.id, b.id);
    },
  });
  karte.element.dataset.mmStart = ''; // Mindmap schrumpft beim Schließen hierhin zurück
  const buehne = el('div', { class: 'kos' }, [el('span', { class: 'kos__staub' }), karte.element]);

  // ---------- Suche ----------
  const feld = el('input', { class: 'kos__feld', attrs: { type: 'search', placeholder: 'Ball suchen …', enterkeyhint: 'go' } });
  const treffer = el('div', { class: 'kos__treffer' });
  const finde = () => suche(daten.eintraege.filter((e) => e.id !== KERN), feld.value).slice(0, 8);
  function hin(id) { feld.value = ''; feld.blur(); treffer.replaceChildren(); waehle(id); }
  feld.addEventListener('input', () => treffer.replaceChildren(...finde().map((e) => el('button', {
    class: 'kos__treffer-zeile', attrs: { type: 'button' }, on: { click: () => hin(e.id) },
  }, [e.titel, el('span', { text: e.art === 'pfad' ? 'Bereich' : art(e.art).name })]))));
  feld.addEventListener('keydown', (e) => { if (e.key === 'Enter' && finde()[0]) hin(finde()[0].id); });

  // ---------- Verlauf ----------
  const spur = el('nav', { class: 'kos__verlauf', attrs: { 'aria-label': 'Verlauf' } });
  function zeichneVerlauf() {
    spur.replaceChildren(...verlauf.map((id, i) => {
      const jetzt = i === verlauf.length - 1;
      const e = daten.eintraege.find((x) => x.id === id);
      return el('button', {
        class: `kos__schritt${jetzt ? ' kos__schritt--jetzt' : ''}`,
        text: e?.titel ?? '…',
        attrs: { type: 'button', ...(jetzt ? { 'aria-current': 'step' } : {}) },
        on: { click: () => !jetzt && waehle(id) },
      });
    }));
    spur.scrollLeft = spur.scrollWidth;
  }

  // ---------- Verknüpfen ----------
  const plus = el('button', { class: 'chip chip--aktion kos__plus', text: '+ Verknüpfen', attrs: { type: 'button' } });
  plus.addEventListener('click', () => {
    const m = echte.find((e) => e.id === mitte());
    if (!m) return;
    let f = null;
    const ansicht = verknuepfenAnsicht({ stand: { eintraege: echte, links: echteLinks }, mitte: m, fertig: () => f?.schliessen() });
    f = oeffneFlaeche({ name: `Mit ${m.titel} verknüpfen`, ausBubble: plus, signal, inhalt: [ansicht] });
  });

  const oben = el('div', { class: 'kos__oben' }, [
    el('div', { class: 'kos__suche' }, [feld, treffer]),
    el('div', { class: 'kos__zeile' }, [spur, plus]),
  ]);

  function tiefe(a, knopf) {
    oeffneTiefe({ art: a, ausBubble: knopf ?? karte.element, eintraege: () => echte, signal });
  }

  function zeige() {
    const da = new Set(daten.eintraege.map((e) => e.id));
    verlauf = verlauf.filter((id) => da.has(id)); // gelöschte fallen raus
    if (!verlauf.length) verlauf = [KERN];
    karte.zeige(daten.eintraege, daten.links, mitte(), daten.bilder);
    zeichneVerlauf();
    plus.hidden = !echte.some((e) => e.id === mitte());
  }

  return {
    element: el('div', { class: 'kos__rahmen' }, [oben, buehne]),
    daten(eintraege, links, bilder) {
      echte = eintraege;
      echteLinks = links;
      const kern = { id: KERN, art: 'kern', titel: 'Physio', label: 'Bereiche', kurz: '' };
      const arten = ARTEN.map((a) => ({
        id: artId(a.id), art: 'pfad', titel: a.mehrzahl, label: zahl(eintraege.filter((e) => e.art === a.id).length), kurz: '',
      }));
      const bekannt = new Set(ARTEN.map((a) => a.id));
      daten = {
        eintraege: [kern, ...arten, ...eintraege],
        links: [
          ...arten.map((a) => ({ a_id: KERN, b_id: a.id })),
          ...eintraege.filter((e) => bekannt.has(e.art)).map((e) => ({ a_id: artId(e.art), b_id: e.id })),
          ...links,
        ],
        bilder,
      };
      zeige();
    },
  };
}
