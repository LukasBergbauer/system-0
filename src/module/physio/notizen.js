// Schnell-Notizen (Kosmos, Knopf „Notizen“ oben): Glas-Fläche mit Feld zum schnellen Notieren und allen Notizen,
// neueste zuerst. Notizen bleiben, bis Lukas sie löscht; Text direkt bearbeitbar (speichert beim Verlassen des Felds).
// „Im Kosmos“ → Fenster zu, Notiz schwebt klein über dem Kosmos (schweben(n), siehe schwebend.js).
// Tabelle physio_notizen (text), Migration 022.
import { el } from '../../ui/dom.js';
import { on } from '../../core/events.js';
import { getAll, save, remove } from '../../core/store.js';
import { oeffneFlaeche } from './glas-flaeche.js';
import { textfeld } from './textfeld.js';

export const NOTIZEN = 'physio_notizen';

export async function ladeNotizen() {
  return (await getAll(NOTIZEN)).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

const datum = (iso) => new Date(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' });

export function oeffneNotizen({ ausBubble, signal, schweben }) {
  const neu = textfeld({ platzhalter: 'Schnell notieren …', klasse: 'notiz__neu' });
  const merken = el('button', { class: 'chip chip--aktion', text: 'Merken', attrs: { type: 'button' } });
  const liste = el('div', { class: 'tief__liste' });
  const f = oeffneFlaeche({
    name: 'Notizen', ausBubble, signal,
    inhalt: [el('h2', { class: 'tief__titel', text: 'Notizen' }), el('div', { class: 'notiz notiz--neu' }, [neu, merken]), liste],
  });
  if (!f) return;

  async function merke() {
    const text = neu.feld.value.trim();
    if (!text) return neu.feld.focus();
    neu.feld.value = '';
    neu.feld.style.height = 'auto';
    await save(NOTIZEN, { text });
  }

  function karte(n) {
    const t = textfeld({ wert: n.text });
    t.feld.addEventListener('change', () => {
      const text = t.feld.value.trim();
      if (text && text !== n.text) save(NOTIZEN, { id: n.id, text });
    });
    const weg = el('button', { class: 'bereich__knopf', text: 'Löschen', attrs: { type: 'button' } });
    weg.addEventListener('click', () => confirm('Notiz löschen?') && remove(NOTIZEN, n.id));
    const hin = el('button', { class: 'bereich__knopf', text: 'Im Kosmos', attrs: { type: 'button' } });
    hin.addEventListener('click', () => { f.schliessen(); schweben({ ...n, text: t.feld.value.trim() || n.text }); });
    const fuss = el('div', { class: 'bereich__knoepfe notiz__fuss' }, [el('span', { text: datum(n.created_at) }), el('span', { class: 'bereich__knoepfe' }, [hin, weg])]);
    return el('div', { class: 'notiz' }, [t, fuss]);
  }

  async function zeichne() {
    const alle = await ladeNotizen();
    if (f.ende.aborted) return;
    liste.replaceChildren(...(alle.length ? alle.map(karte) : [el('p', { class: 'tief__leer', text: 'Noch keine Notizen.' })]));
  }

  merken.addEventListener('click', merke);
  neu.feld.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) merke(); });
  on('daten', ({ table }) => {
    // nicht neu zeichnen, während in einer Notiz geschrieben wird
    if (table === NOTIZEN && !liste.contains(document.activeElement)) zeichne();
  }, { signal: f.ende });
  zeichne();
}
