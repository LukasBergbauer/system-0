// Bereiche bearbeiten (Kosmos, Kugel „Physio“ in der Mitte antippen): die Bälle, die direkt um Physio liegen.
// Je Bereich eine Glas-Karte: Name des Balls (Mehrzahl), Name eines Eintrags (Einzahl), Felder (eine Zeile je Feld),
// nach oben schieben, löschen (nur leere Bereiche). Unten neuen Bereich anlegen. Speichert beim Verlassen eines Felds.
// Felder behalten ihren Schlüssel, solange die Bezeichnung gleich bleibt; Werte umbenannter Felder bleiben im Eintrag erhalten.
import { el } from '../../ui/dom.js';
import { ARTEN, speichereArten } from './arten.js';
import { norm } from './daten.js';
import { oeffneFlaeche } from './glas-flaeche.js';

const neueId = () => `b${crypto.randomUUID().slice(0, 8)}`;
const schluessel = (label) => norm(label).replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || neueId();

export function oeffneBereiche({ ausBubble, eintraege, signal }) {
  const liste = el('div', { class: 'tief__liste' });
  const neu = el('input', {
    class: 'tief__feld', attrs: { type: 'text', placeholder: '+ Neuer Bereich, z. B. Tests', enterkeyhint: 'done' },
  });
  const f = oeffneFlaeche({
    name: 'Bereiche', ausBubble, signal,
    inhalt: [el('h2', { class: 'tief__titel', text: 'Bereiche' }), liste, neu],
  });
  if (!f) return;

  const anzahl = (id) => eintraege().filter((e) => e.art === id).length;
  async function speichere(liste) { await speichereArten(liste); zeichne(); }

  function karte(a, i) {
    const n = anzahl(a.id);
    const eingabe = (wert, platz, aendern) => {
      const x = el('input', { class: 'bereich__feld', attrs: { type: 'text', value: wert, placeholder: platz } });
      x.addEventListener('change', () => { const v = x.value.trim(); if (v) aendern(v); else x.value = wert; });
      return x;
    };
    // ohne neu zu zeichnen, sonst verliert das nächste angetippte Feld den Fokus
    const aendere = (teil) => speichereArten(ARTEN.map((b) => (b.id === a.id ? { ...b, ...teil } : b)));
    const felder = el('textarea', { class: 'bereich__felder', attrs: { rows: Math.max(2, a.felder.length), placeholder: 'Felder, eine Zeile je Feld' } });
    felder.value = a.felder.map((x) => x.label).join('\n');
    felder.addEventListener('change', () => {
      const labels = felder.value.split('\n').map((s) => s.trim()).filter(Boolean);
      const alt = (ARTEN.find((b) => b.id === a.id) ?? a).felder;
      aendere({ felder: labels.map((label) => alt.find((x) => x.label === label) ?? { key: schluessel(label), label }) });
    });
    const hoch = el('button', { class: 'bereich__knopf', text: '↑', attrs: { type: 'button', 'aria-label': 'Nach oben', disabled: i === 0 } });
    hoch.addEventListener('click', () => {
      const l = [...ARTEN];
      [l[i - 1], l[i]] = [l[i], l[i - 1]];
      speichere(l);
    });
    const weg = el('button', { class: 'bereich__knopf', text: 'Löschen', attrs: { type: 'button' } });
    weg.addEventListener('click', () => {
      if (n) return alert(`„${a.mehrzahl}“ hat noch ${n} Einträge. Erst im Eintrag einen anderen Bereich wählen.`);
      if (ARTEN.length > 1 && confirm(`Bereich „${a.mehrzahl}“ löschen?`)) speichere(ARTEN.filter((b) => b.id !== a.id));
    });
    return el('div', { class: 'bereich' }, [
      el('div', { class: 'bereich__kopf' }, [
        eingabe(a.mehrzahl, 'Name des Balls', (v) => aendere({ mehrzahl: v })),
        el('span', { class: 'tief__zahl', text: String(n) }),
      ]),
      el('label', { class: 'bereich__zeile' }, [el('span', { text: 'Ein Eintrag heißt' }), eingabe(a.name, 'Einzahl', (v) => aendere({ name: v }))]),
      felder,
      el('div', { class: 'bereich__knoepfe' }, [hoch, weg]),
    ]);
  }

  function zeichne() {
    liste.replaceChildren(...ARTEN.map(karte));
  }

  neu.addEventListener('keydown', (e) => {
    const name = neu.value.trim();
    if (e.key !== 'Enter' || !name) return;
    neu.value = '';
    speichere([...ARTEN, { id: neueId(), name, mehrzahl: name, felder: [] }]);
  });
  zeichne();
}
