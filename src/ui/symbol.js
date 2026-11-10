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
  // Pfeil zurück in die Ablage (Wiederherstellen)
  wiederherstellen: '<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5"/><path d="M4.5 14v4a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-4"/>',
  // Glocke (Mitteilungen)
  glocke: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  // Person (Konto)
  konto: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5"/>',
  // Drei verbundene Punkte (Physio / Mindmap)
  physio: '<circle cx="12" cy="6" r="2.5"/><circle cx="5.5" cy="17.5" r="2.5"/><circle cx="18.5" cy="17.5" r="2.5"/><path d="M10.8 8.2l-4.1 7.1M13.2 8.2l4.1 7.1M8 17.5h8"/>',
  // Kalenderblatt mit zwei Ringen
  kalender: '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
  // Lupe (Suchen)
  suche: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>',
  // Vier Kacheln
  mehr: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
  // Farbpalette (Akzentfarbe)
  farbe: '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.2 0 1.8-.8 1.8-1.7 0-1.3-1.2-1.6-1.2-2.8 0-1 .8-1.7 1.8-1.7h2.1a4 4 0 0 0 4-4C20.5 6.6 16.7 3.5 12 3.5z"/><circle cx="7.5" cy="11.5" r="1"/><circle cx="10" cy="7.5" r="1"/><circle cx="15" cy="7.5" r="1"/>',
  // Flamme (Serie)
  flamme: '<path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/>',
  // Plus (Neu)
  plus: '<path d="M12 5v14M5 12h14"/>',
  // Hantel (Training)
  training: '<path d="M6 6v12M18 6v12M3 9v6M21 9v6M6 12h12"/>',
  // Zielscheibe (Ziele)
  ziele: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 12h.01"/>',
  // Kreislauf mit Haken (Routinen)
  routinen: '<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4.5v3.5h-3.5"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  // Keimling (Gewohnheiten)
  // Sprechblase mit Fragezeichen (Wissen-Quiz)
  quiz: '<path d="M12 3.5c4.7 0 8.5 3.2 8.5 7.3s-3.8 7.2-8.5 7.2c-.9 0-1.8-.1-2.6-.3L5 20l.9-3.6C4.4 15 3.5 13 3.5 10.8 3.5 6.7 7.3 3.5 12 3.5z"/><path d="M10 9a2 2 0 1 1 2.7 1.9c-.5.2-.7.6-.7 1.1v.5"/><circle cx="12" cy="14.6" r=".3"/>',
  gewohnheiten: '<path d="M12 21v-9"/><path d="M12 12c0-4 3-6.5 7-6.5 0 4-3 6.5-7 6.5zM12 14.5c0-3-2.5-5-6-5 0 3 2.5 5 6 5z"/>',
  // Aufgeschlagenes Buch (Bücher)
  buecher: '<path d="M12 6.5C10.3 5.2 7.8 4.5 4 4.5v13c3.8 0 6.3.7 8 2 1.7-1.3 4.2-2 8-2v-13c-3.8 0-6.3.7-8 2z"/><path d="M12 6.5v13"/>',
  // Kamera-Quadrat (Insta)
  insta: '<rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.6" cy="7.4" r=".4"/>',
  // Funkeln (Affirmationen)
  affirmation: '<path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9-1.9 5.1-1.9-5.1L5 10.5l5.1-1.9z"/><path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
  // Pfeil nach links (Seitenleiste einklappen)
  zurueck: '<path d="M15 6l-6 6 6 6"/>',
  prompt: '<path d="M4.5 5.5h15v10h-8l-4 3.5v-3.5h-3z"/><path d="M8.5 9l2 1.5-2 1.5"/><path d="M12.5 12h3"/>',
  verlauf: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v3h3"/><path d="M12 8v4l2.5 2"/>',
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
