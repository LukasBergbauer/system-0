// Rechnet aus, wo die Nachbarn rund um die Mitte stehen (reine Rechnung, kein DOM).
// Ringe sind Ellipsen, damit hohe iPhone-Bildschirme oben/unten mehr Platz nutzen.
// Schmal (iPhone): ein Ring mit bis zu 8 Punkten (6, sobald Bälle mit Bild dabei sind – die brauchen mehr Platz).
// Breit (Mac): zwei Ringe, bis zu 16.
// Mehr Nachbarn als Plätze → der letzte Platz wird „+N weitere“ (entscheidet fokus.js).
// Plätze stehen gleichmäßig auf dem Ring (Lukas: strukturiert).

const PRO_RING = 8;

// Größen der Punkte in px, abhängig von der Breite der Karte.
export function groessen(breite) {
  return breite < 500
    ? { mitte: 128, breit: 92, hoch: 92, ball: 74 }
    : { mitte: 156, breit: 108, hoch: 108, ball: 86 };
}

function ring(anzahl, rx, ry, versatz = 0) {
  const punkte = [];
  const schritt = 360 / anzahl;
  for (let i = 0; i < anzahl; i++) {
    const winkel = (-90 + versatz + schritt * i) * (Math.PI / 180);
    punkte.push({ x: Math.round(Math.cos(winkel) * rx), y: Math.round(Math.sin(winkel) * ry) });
  }
  return punkte;
}

// anzahl = Nachbarn, die gezeigt werden sollen. mitBildern = mindestens ein Nachbar ist ein Ball mit Bild.
// Gibt { punkte, plaetze } zurück (plaetze = wie viele überhaupt passen; punkte hat min(anzahl, plaetze) Einträge).
export function positionen(anzahl, breite, hoehe, mitBildern = false) {
  const g = groessen(breite);
  const hoch = mitBildern ? g.ball + 40 : g.hoch; // Ball + Titel darunter
  const rx = Math.max(90, Math.min(breite / 2 - g.breit / 2 - 10, 300));
  const ry = Math.max(110, Math.min(hoehe / 2 - hoch / 2 - 20, 300));
  const zweiRinge = rx >= 230 && ry >= 200;
  const plaetze = zweiRinge ? PRO_RING * 2 : (mitBildern ? 6 : PRO_RING);
  const n = Math.min(anzahl, plaetze);

  if (n <= PRO_RING || !zweiRinge) {
    // Ein Ring; auf großen Flächen etwas näher an der Mitte, sonst wirkt es verloren.
    // Oben/unten etwas mehr Abstand, damit sich schräge Nachbarn nicht berühren.
    const s = zweiRinge ? (n <= 4 ? 0.95 : 0.88) : 1;
    return { plaetze, punkte: ring(n, rx * s, Math.min(ry, Math.max(rx * 1.6, 190)) * s) };
  }
  const aussen = n - PRO_RING;
  return {
    plaetze,
    punkte: [
      ...ring(PRO_RING, rx * 0.55, ry * 0.55),
      ...ring(aussen, rx, ry, 180 / aussen), // versetzt, damit innen und außen nicht hintereinander stehen
    ],
  };
}
