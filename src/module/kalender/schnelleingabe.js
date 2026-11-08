// Schnelleingabe oben: z. B. „Mo 18 Uhr Training“. Darunter zeigt eine Zeile, was erkannt wurde.
// Enter legt den Termin an, das Feld bleibt im Fokus für den nächsten.
import { el } from '../../ui/dom.js';
import { input } from '../../ui/input.js';
import { speichereTermin } from './daten.js';
import { erkenne } from './erkennen.js';
import { tagText, zeitHM, letzterTag } from './zeit.js';

// „Mo., 9. Nov. · 18:00–19:00 · Training“
function vorschauText(r) {
  const bis = letzterTag(r);
  const mehrtaegig = tagText(r.start) !== tagText(bis);
  let wann = tagText(r.start);
  if (r.ganztaegig) wann += ' · ganztägig';
  else wann += ` · ${zeitHM(r.start)}–${mehrtaegig ? `${tagText(bis)}, ` : ''}${zeitHM(r.ende)}`;
  return r.titel ? `${wann} · ${r.titel}` : `${wann} · Titel fehlt`;
}

export function schnelleingabe() {
  const feld = input({ placeholder: 'z. B. Mo 18 Uhr Training' });
  const eingabe = feld.querySelector('input');
  eingabe.setAttribute('aria-label', 'Neuer Termin');
  eingabe.setAttribute('enterkeyhint', 'enter');
  const vorschau = el('p', { class: 'termin-vorschau', attrs: { 'aria-live': 'polite' } });

  eingabe.addEventListener('input', () => {
    const text = eingabe.value.trim();
    vorschau.textContent = text ? vorschauText(erkenne(text)) : '';
  });

  eingabe.addEventListener('keydown', async (e) => {
    if (e.key !== 'Enter' || e.isComposing) return;
    e.preventDefault();
    const r = erkenne(eingabe.value.trim());
    if (!r.titel) return;
    eingabe.value = '';
    vorschau.textContent = '';
    await speichereTermin({
      titel: r.titel,
      start: r.start.toISOString(),
      ende: r.ende.toISOString(),
      ganztaegig: r.ganztaegig,
      ort: '',
      notiz: '',
    });
  });

  return el('div', { class: 'termin-schnell' }, [feld, vorschau]);
}
