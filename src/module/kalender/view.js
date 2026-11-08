// Ansicht „Kalender“: Knopf „+ Termin“, darunter „Nächste Termine“ in Gruppen
// (Heute · Morgen · Diese Woche · Später). Vergangene Termine sind ausgeblendet.
// Zeichnet sich neu, sobald sich Termine ändern (auch durch das andere Gerät).
import { el } from '../../ui/dom.js';
import { list, listRow } from '../../ui/list.js';
import { button } from '../../ui/button.js';
import { on } from '../../core/events.js';
import { TERMINE, ladeTermine } from './daten.js';
import { gruppiere, tagText, zeitHM, letzterTag } from './zeit.js';
import { oeffneTermin } from './bearbeiten.js';

// Unterzeile: Datum (nicht bei Heute/Morgen), Ende, Ort
function unterText(t, gruppe) {
  const start = new Date(t.start);
  const bis = letzterTag(t);
  const mehrtaegig = tagText(start) !== tagText(bis);
  const teile = [];
  if (gruppe === 'woche' || gruppe === 'spaeter') teile.push(tagText(start));
  if (mehrtaegig) teile.push(`bis ${tagText(bis)}${t.ganztaegig ? '' : `, ${zeitHM(bis)}`}`);
  else if (!t.ganztaegig) teile.push(`bis ${zeitHM(bis)}`);
  if (t.ort) teile.push(t.ort);
  return teile.join(' · ');
}

function zeile(t, gruppe) {
  return listRow({
    title: t.titel,
    sub: unterText(t, gruppe),
    start: el('span', { class: 'termin-zeit', text: t.ganztaegig ? 'ganztägig' : zeitHM(new Date(t.start)) }),
    onClick: () => oeffneTermin(t),
  });
}

export function kalenderAnsicht({ signal }) {
  const inhalt = el('div', { class: 'termin-liste' });
  let stand = 0; // nur das Ergebnis des neuesten Zeichnens zählt

  async function zeichne() {
    const nr = ++stand;
    const termine = await ladeTermine();
    if (nr !== stand || signal.aborted) return;
    const gruppen = gruppiere(termine);
    inhalt.replaceChildren(
      ...(gruppen.length
        ? gruppen.map((g) => el('section', { class: 'termin-gruppe' }, [
          el('h2', { class: 'termin-gruppe__titel label', text: `${g.titel} · ${g.termine.length}` }),
          list(g.termine.map((t) => zeile(t, g.id))),
        ]))
        : [el('p', { class: 'app__note', text: 'Keine Termine. Freie Zeit.' })])
    );
  }

  on('daten', ({ table }) => {
    if (table === TERMINE) zeichne();
  }, { signal });
  zeichne();

  return el('div', { class: 'app__stack' }, [
    el('div', { class: 'termin-kopf' }, button({ text: '+ Termin', variant: 'primary', onClick: () => oeffneTermin() })),
    inhalt,
  ]);
}
