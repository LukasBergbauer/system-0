// Physio-Datenbank (Knopf „Datenbank“ unter dem Kosmos): Vault mit Lernzetteln, unabhängig von der Mindmap.
// Lernzettel sind Markdown-Dateien in lernzettel/physio/, Liste in lernzettel/physio/index.json
// ([{ datei, titel, kurz, thema, datum }], neueste oben). Claude Code legt sie über den Prompt „Lernzettel → Physio“ an.
// Offline: sw.js merkt sich jede geladene Datei (Netz zuerst, sonst Cache).
import { el } from '../../ui/dom.js';
import { zeigeMarkdown } from '../../ui/markdown.js';
import { oeffneFlaeche } from './glas-flaeche.js';
import { norm } from './daten.js';

const ORDNER = new URL('../../../lernzettel/physio/', import.meta.url);
const datum = (d) => new Date(d).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' });

async function lade(datei, art) {
  const r = await fetch(new URL(datei, ORDNER), { cache: 'no-cache' });
  if (!r.ok) throw new Error(r.status);
  return art === 'json' ? r.json() : r.text();
}

export function oeffneDatenbank({ ausBubble, signal }) {
  const feld = el('input', { class: 'tief__feld', attrs: { type: 'search', placeholder: 'Lernzettel durchsuchen …' } });
  const zahl = el('span', { class: 'tief__zahl' });
  const liste = el('div', { class: 'tief__liste' });
  const titel = el('h2', { class: 'tief__titel' }, ['Datenbank', zahl]);
  const f = oeffneFlaeche({ name: 'Datenbank', ausBubble, signal, inhalt: [titel, feld, liste] });
  if (!f) return;
  let alle = [];

  function zeichne() {
    const text = norm(feld.value.trim());
    const treffer = alle.filter((z) => !text || norm(`${z.titel} ${z.kurz ?? ''} ${z.thema ?? ''}`).includes(text));
    zahl.textContent = String(alle.length);
    liste.replaceChildren(...treffer.map((z, i) => {
      const k = el('button', { class: 'tief__zeile', attrs: { type: 'button' } }, [
        el('span', { class: 'tief__zeile-art', text: [z.thema, z.datum && datum(z.datum)].filter(Boolean).join(' · ') }),
        el('span', { class: 'tief__zeile-titel', text: z.titel }),
        z.kurz ? el('span', { class: 'tief__zeile-kurz', text: z.kurz }) : null,
      ]);
      k.style.setProperty('--i', Math.min(i, 12));
      k.addEventListener('click', () => zeigeZettel(z));
      return k;
    }));
    if (!treffer.length) liste.append(el('p', { class: 'tief__leer', text: alle.length ? 'Nichts gefunden.' : 'Noch keine Lernzettel. Datei + Prompt „Lernzettel → Physio“ an Claude Code geben.' }));
  }

  async function zeigeZettel(z) {
    const zurueck = el('button', { class: 'chip lernzettel__zurueck', text: '‹ Alle Lernzettel', attrs: { type: 'button' } });
    zurueck.addEventListener('click', () => { feld.hidden = false; zeichne(); });
    feld.hidden = true;
    liste.replaceChildren(zurueck, el('p', { class: 'tief__leer', text: 'Lädt …' }));
    try {
      liste.replaceChildren(zurueck, el('article', { class: 'lernzettel' }, zeigeMarkdown(await lade(z.datei), 'buch-text lernzettel__text')));
    } catch {
      liste.replaceChildren(zurueck, el('p', { class: 'tief__leer', text: 'Lernzettel nicht erreichbar (offline noch nie geöffnet?).' }));
    }
    zurueck.scrollIntoView({ block: 'center' });
  }

  feld.addEventListener('input', zeichne);
  lade('index.json', 'json').then((liste) => { alle = Array.isArray(liste) ? liste : []; }).catch(() => {}).finally(zeichne);
}
