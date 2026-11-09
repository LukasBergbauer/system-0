// Ruhiger Editor für Zusammenfassungen: großes Textfeld + kleine Leiste (Überschrift, Zitat, Liste, fett, kursiv).
// Speichert als einfaches Markdown (siehe markdown.js). Enter in einer Liste/einem Zitat setzt die Zeile fort.
// editor({ wert, onAenderung }) → { element, wert() }
import { el } from '../../ui/dom.js';

const ZEILE = [
  { text: 'Ü', titel: 'Überschrift', vor: '## ' },
  { text: '❝', titel: 'Zitat', vor: '> ' },
  { text: '•', titel: 'Liste', vor: '- ' },
];
const UM = [
  { text: 'F', titel: 'Fett', zeichen: '**', klasse: 'fett' },
  { text: 'K', titel: 'Kursiv', zeichen: '*', klasse: 'kursiv' },
];

export function editor({ wert = '', onAenderung }) {
  const feld = el('textarea', { class: 'buch-editor__feld', attrs: { 'aria-label': 'Zusammenfassung', placeholder: 'Was nimmst du aus dem Buch mit?\n\n## Kernideen\n- …\n\n> Lieblingszitat' } });
  feld.value = wert;
  // Wächst mit dem Text (kein zweiter Scrollbereich im Vollbild).
  const wachse = () => { feld.style.height = 'auto'; feld.style.height = `${feld.scrollHeight + 2}px`; };
  const melde = () => { wachse(); onAenderung?.(feld.value); };
  setTimeout(wachse); // nach dem Einhängen (rAF läuft im verdeckten Fenster nicht)

  const ersetze = (start, ende, text, auswahlA, auswahlB) => {
    feld.focus();
    feld.setRangeText(text, start, ende, 'end');
    if (auswahlA != null) feld.setSelectionRange(auswahlA, auswahlB);
    melde();
  };

  // Zeilen-Anfang an/aus für alle markierten Zeilen.
  function zeile(vor) {
    const v = feld.value;
    const a = v.lastIndexOf('\n', feld.selectionStart - 1) + 1;
    const e0 = v.indexOf('\n', feld.selectionEnd);
    const e = e0 < 0 ? v.length : e0;
    const zeilen = v.slice(a, e).split('\n');
    const alle = zeilen.every((z) => z.startsWith(vor));
    const neu = zeilen.map((z) => (alle ? z.slice(vor.length) : vor + z.replace(/^(#{1,3} |> |- )/, ''))).join('\n');
    ersetze(a, e, neu, a + neu.length, a + neu.length);
  }

  function um(zeichen) {
    const { selectionStart: a, selectionEnd: e } = feld;
    const sel = feld.value.slice(a, e);
    ersetze(a, e, zeichen + sel + zeichen, a + zeichen.length, a + zeichen.length + sel.length);
  }

  feld.addEventListener('input', melde);
  feld.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Enter' || ev.shiftKey || ev.isComposing) return;
    const v = feld.value;
    const a = v.lastIndexOf('\n', feld.selectionStart - 1) + 1;
    const m = v.slice(a, feld.selectionStart).match(/^(- |> |(\d+)\. )(.*)$/);
    if (!m) return;
    ev.preventDefault();
    if (!m[3].trim()) return ersetze(a, feld.selectionStart, ''); // leere Listenzeile → Liste beenden
    const weiter = m[2] ? `${Number(m[2]) + 1}. ` : m[1];
    ersetze(feld.selectionStart, feld.selectionEnd, `\n${weiter}`);
  });

  const knopf = (k, onClick) => el('button', {
    class: `buch-editor__knopf ${k.klasse ? `buch-editor__knopf--${k.klasse}` : ''}`, text: k.text,
    attrs: { type: 'button', title: k.titel, 'aria-label': k.titel },
    // mousedown verhindern: Fokus und Markierung bleiben im Textfeld
    on: { mousedown: (e) => e.preventDefault(), click: onClick },
  });

  const element = el('div', { class: 'buch-editor' }, [
    el('div', { class: 'buch-editor__leiste', attrs: { role: 'toolbar', 'aria-label': 'Formatieren' } }, [
      ...ZEILE.map((k) => knopf(k, () => zeile(k.vor))),
      ...UM.map((k) => knopf(k, () => um(k.zeichen))),
    ]),
    feld,
  ]);
  return { element, wert: () => feld.value, fokus: () => feld.focus() };
}
