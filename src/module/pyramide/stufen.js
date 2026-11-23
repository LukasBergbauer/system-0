// Pyramide als Stufen (Variante A): unten breit und kräftig, nach oben schmaler und heller.
import { el } from '../../ui/dom.js';

export function stufen(ebenen) {
  const n = ebenen.length;
  const oben = [...ebenen].reverse();
  return el('div', { class: 'pyr-stufen' }, oben.map((t, i) => el('div', {
    class: 'pyr-stufe', text: t, attrs: { style: `--b:${30 + (70 * (i + 1)) / n}%;--k:${20 + (80 * (i + 1)) / n}%` },
  })));
}
