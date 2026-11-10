// Innenansicht eines Bereichs (Kosmos, Bereichs-Kugel in der Mitte antippen): Glas-Fläche (glas-flaeche.js)
// mit Suchfeld, allen Einträgen des Bereichs als Glas-Karten und Anlegen.
// Eintrag antippen → Mindmap mit ihm in der Mitte (bei Regionen als Lernpfad, lernpfad.js).
import { el } from '../../ui/dom.js';
import { on } from '../../core/events.js';
import { art as artVon } from './arten.js';
import { EINTRAEGE, ladeEintraege, neuerEintrag, norm, suche } from './daten.js';
import { oeffneMindmap } from './overlay.js';
import { oeffneFlaeche } from './glas-flaeche.js';

export function oeffneTiefe({ art, ausBubble, eintraege, signal }) {
  const name = artVon(art).mehrzahl;
  const passt = (e) => e.art === art;
  let alle = eintraege().filter(passt);

  const feld = el('input', {
    class: 'tief__feld',
    attrs: { type: 'search', placeholder: `${name} durchsuchen oder anlegen …`, enterkeyhint: 'go' },
  });
  const liste = el('div', { class: 'tief__liste' });
  const zahl = el('span', { class: 'tief__zahl' });
  const f = oeffneFlaeche({ name, ausBubble, signal, inhalt: [el('h2', { class: 'tief__titel' }, [name, zahl]), feld, liste] });
  if (!f) return;

  async function anlegen(titel) {
    const t = titel.trim();
    if (!t) return;
    const da = alle.find((e) => norm(e.titel) === norm(t));
    oeffne(da ?? await neuerEintrag(art, t));
  }
  const oeffne = (e, knopf) => oeffneMindmap({ ausKnopf: knopf, signal, mitteId: e.id, lernpfad: art === 'region' });

  function zeichne() {
    const text = feld.value.trim();
    const treffer = text ? suche(alle, text) : alle;
    zahl.textContent = String(alle.length);
    const zeilen = treffer.map((e, i) => {
      const z = el('button', { class: 'tief__zeile', attrs: { type: 'button' } }, [
        el('span', { class: 'tief__zeile-titel', text: e.titel }),
        e.kurz ? el('span', { class: 'tief__zeile-kurz', text: e.kurz }) : null,
      ]);
      z.style.setProperty('--i', Math.min(i, 12));
      z.addEventListener('click', () => oeffne(e, z));
      return z;
    });
    if (text && !alle.some((e) => norm(e.titel) === norm(text))) {
      zeilen.push(el('button', { class: 'tief__neu', text: `+ „${text}“ anlegen`, attrs: { type: 'button' }, on: { click: () => anlegen(text) } }));
    }
    if (!zeilen.length) zeilen.push(el('p', { class: 'tief__leer', text: `Noch keine ${name}. Oben tippen und anlegen.` }));
    liste.replaceChildren(...zeilen);
  }

  feld.addEventListener('input', zeichne);
  feld.addEventListener('keydown', (e) => { if (e.key === 'Enter') anlegen(feld.value); });
  on('daten', async ({ table }) => {
    if (table !== EINTRAEGE) return;
    alle = (await ladeEintraege()).filter(passt);
    if (!f.ende.aborted) zeichne();
  }, { signal: f.ende });
  zeichne();
}
