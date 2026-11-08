// Symbole: dünne Linien-SVGs, selbst gezeichnet (24 × 24, Farbe = Textfarbe).
// symbol('heute') → <svg>. Neues Modul → hier ein Symbol ergänzen.
const SVG = 'http://www.w3.org/2000/svg';

const FORMEN = {
  // Sonne
  heute: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  // Zwei Haken mit Zeilen
  todos: '<path d="M3.5 6.5l1.75 1.75L8.5 5M3.5 16.5l1.75 1.75L8.5 15M12 7h8.5M12 17h8.5"/>',
  // Schieberegler
  einstellungen: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  // Zwei Pfeile im Kreis (Abgleich)
  abgleich: '<path d="M19 12a7 7 0 0 1-12.2 4.7M5 12a7 7 0 0 1 12.2-4.7"/><path d="M17.5 3.5v4h-4M6.5 20.5v-4h4"/>',
  // Blatt mit Ecke (Export)
  export: '<path d="M14 3.5H7.5A1.5 1.5 0 0 0 6 5v14a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 18 19V7.5z"/><path d="M14 3.5v4h4"/>',
  // Person (Konto)
  konto: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5"/>',
  // Drei verbundene Punkte (PhysioZentrum / Mindmap)
  physio: '<circle cx="12" cy="6" r="2.5"/><circle cx="5.5" cy="17.5" r="2.5"/><circle cx="18.5" cy="17.5" r="2.5"/><path d="M10.8 8.2l-4.1 7.1M13.2 8.2l4.1 7.1M8 17.5h8"/>',
  // Kalenderblatt mit zwei Ringen
  kalender: '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
  // Lupe (Suchen)
  suche: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>',
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
