// Textfeld für die Eintrag-Ansicht: sieht aus wie ruhiger Text, ist aber direkt bearbeitbar.
// Wächst mit dem Inhalt mit (kein Scrollen im Feld). Label klein darüber (optional).
// textfeld({ label, wert, platzhalter, klasse, einzeilig, onWert })
import { el } from '../../ui/dom.js';

let zaehler = 0;

// Höhe an den Inhalt anpassen
function anpassen(feld) {
  feld.style.height = 'auto';
  feld.style.height = `${feld.scrollHeight}px`;
}

export function textfeld({ label, wert = '', platzhalter = '', klasse = '', einzeilig = false, onWert } = {}) {
  const id = `mm-feld-${++zaehler}`;
  const feld = el('textarea', {
    class: `mm-text ${klasse}`.trim(),
    attrs: { id, rows: 1, placeholder: platzhalter, enterkeyhint: einzeilig ? 'done' : 'enter' },
  });
  feld.value = wert;
  feld.addEventListener('input', () => {
    if (einzeilig) feld.value = feld.value.replace(/\n/g, ' ');
    anpassen(feld);
    onWert?.(feld.value);
  });
  if (einzeilig) {
    feld.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.isComposing) {
        e.preventDefault();
        feld.blur();
      }
    });
  }
  // erst messen, wenn das Feld im Dokument ist
  requestAnimationFrame(() => anpassen(feld));

  const huelle = el('div', { class: 'mm-textfeld' }, [
    label && el('label', { class: 'label', text: label, attrs: { for: id } }),
    feld,
  ]);
  huelle.feld = feld;
  return huelle;
}
