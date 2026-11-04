// Symbole: dünne Linien-SVGs, selbst gezeichnet (24 × 24, Farbe = Textfarbe).
// symbol('heute') → <svg>. Neues Modul → hier ein Symbol ergänzen.
const SVG = 'http://www.w3.org/2000/svg';

const FORMEN = {
  // Sonne
  heute: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  // Schieberegler
  einstellungen: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  // Vier Kacheln
  mehr: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
};

const ERSATZ = '<circle cx="12" cy="12" r="8"/>';

export function symbol(name) {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('class', 'symbol');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = FORMEN[name] ?? ERSATZ;
  return svg;
}
