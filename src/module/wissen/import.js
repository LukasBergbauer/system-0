// „Fragen importieren“: JSON aus einem Claude-Chat einfügen. Prompt zum Kopieren steht oben im Modal.
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { modal } from '../../ui/modal.js';
import { THEMEN, importiere } from './data.js';

const PROMPT = `Erstelle 50 neue Quizfragen auf Deutsch zum Thema <THEMA>, gemischte Schwierigkeit, fachlich korrekt.
Antworte nur mit einer JSON-Liste, ohne weiteren Text, in genau diesem Format:
[{"thema":"<THEMA>","f":"Frage?","a":["richtige Antwort","falsch","falsch","falsch"],"e":"kurze Erklärung (1–2 Sätze)"}]
Die erste Antwort ist immer die richtige. Die falschen Antworten sollen plausibel und ähnlich lang sein.
Mögliche Themen: ${THEMEN.map((t) => t.name).join(', ')} (oder ein neues).`;

export function oeffneImport(vorhandene) {
  const feld = el('textarea', { class: 'field__input quiz-import', attrs: { id: 'quiz-import', rows: 8, placeholder: '[{"thema":"Geschichte","f":"…","a":["…","…","…","…"],"e":"…"}]' } });
  const meldung = el('p', { class: 'app__note' });
  const kopieren = button({ text: 'Prompt kopieren', variant: 'ghost', onClick: async () => {
    try { await navigator.clipboard.writeText(PROMPT); kopieren.textContent = 'Kopiert ✓'; } catch { meldung.textContent = PROMPT; }
  } });
  const los = button({ text: 'Importieren', variant: 'primary', onClick: async () => {
    los.disabled = true;
    try {
      const r = await importiere(feld.value, vorhandene);
      meldung.className = 'app__note';
      meldung.textContent = `${r.neu} neu${r.doppelt ? `, ${r.doppelt} schon vorhanden` : ''}${r.falsch ? `, ${r.falsch} unvollständig übersprungen` : ''}.`;
      if (r.neu) feld.value = '';
    } catch (e) {
      meldung.className = 'app__note app__note--warn';
      meldung.textContent = e.message;
    }
    los.disabled = false;
  } });

  modal({
    title: 'Fragen importieren',
    content: [
      el('p', { class: 'app__note', text: 'Prompt kopieren, in einem Claude-Chat einfügen (<THEMA> ersetzen), die Antwort hier einfügen.' }),
      kopieren,
      el('div', { class: 'field' }, [el('label', { class: 'field__label', text: 'JSON', attrs: { for: 'quiz-import' } }), feld]),
      meldung,
    ],
    actions: [los],
  }).open();
}
