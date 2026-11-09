// Gleiten der Punkte in der Fokus-Karte, flüssig auch auf dem iPhone („FLIP“-Technik):
// 1. Wo stehen die Punkte gerade, und wie groß sind sie? (auch mitten in einer laufenden Bewegung)
// 2. Neuen Zustand sofort setzen: endgültige Größe und Position, ohne Übergang.
// 3. Jeden Punkt per Verschieben + Skalieren optisch wieder an den alten Platz setzen.
// 4. Übergang einschalten und nur dieses Verschieben/Skalieren auf null laufen lassen.
// So muss das Gerät pro Bild nichts neu berechnen (keine Breite/Höhe), das übernimmt die Grafikeinheit.
//
// gleite(ebene, knoepfe, aendern, spaeter): aendern() setzt Klassen und Ziel-Positionen (über setzeZiel).
// spaeter = ms, um die neue Punkte erst nach den anderen losschweben.

// Ziel eines Punkts (Abstand zur Mitte der Karte in px). Merkt sich die Grund-Verschiebung.
export function setzeZiel(knopf, { x, y }) {
  knopf.ziel = { x, y };
  knopf.basis = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
  knopf.style.transform = knopf.basis;
}

const mitteVon = (r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });

export function gleite(ebene, knoepfe, aendern, spaeter = 0) {
  // 1. vorher messen (nur Punkte, die schon da sind)
  const vorher = new Map();
  for (const knopf of knoepfe) vorher.set(knopf, knopf.getBoundingClientRect());

  // 2. neuen Zustand ohne Übergang setzen
  ebene.classList.add('mm-karte__knoten--still');
  aendern();

  // 3. optisch zurück an den alten Platz
  for (const knopf of ebene.querySelectorAll('.mm-knoten:not(.mm-knoten--weg)')) {
    const alt = vorher.get(knopf);
    if (!alt) {
      // neu: aus der Mitte heraus, klein und unsichtbar
      const { x, y } = knopf.ziel ?? { x: 0, y: 0 };
      knopf.style.transform = `${knopf.basis} translate(${-x}px, ${-y}px) scale(0.5)`;
      knopf.classList.add('mm-knoten--neu');
      if (spaeter) {
        knopf.style.transitionDelay = `${spaeter}ms`;
        setTimeout(() => knopf.style.removeProperty('transition-delay'), spaeter + 50);
      }
      continue;
    }
    const neu = knopf.getBoundingClientRect();
    if (!neu.width || !neu.height) continue;
    const a = mitteVon(alt);
    const n = mitteVon(neu);
    const dx = a.x - n.x;
    const dy = a.y - n.y;
    const sx = alt.width / neu.width;
    const sy = alt.height / neu.height;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01) continue;
    knopf.style.transform = `${knopf.basis} translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
  }

  // 4. Startzustand festhalten, dann mit Übergang ans Ziel
  void ebene.getBoundingClientRect();
  ebene.classList.remove('mm-karte__knoten--still');
  for (const knopf of ebene.querySelectorAll('.mm-knoten:not(.mm-knoten--weg)')) {
    knopf.classList.remove('mm-knoten--neu');
    knopf.style.transform = knopf.basis;
  }
}
