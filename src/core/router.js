// Navigation zwischen den Bereichen über Hash-Adressen: #/heute, #/einstellungen …
// Läuft auf GitHub Pages ohne Extra-Einrichtung; Zurück-Knopf und -Wischen funktionieren,
// weil jeder Wechsel ein normaler Eintrag im Browser-Verlauf ist.
//
// Ein Bereich meldet sich an mit:
//   register({ id, titel, symbol, ansicht })
//   ansicht({ signal }) → Element. signal endet, sobald die Ansicht verlassen wird
//   (zum Abmelden von Ereignissen: on('daten', fn, { signal })).
// Optional: nav: false (nicht in Tab-Leiste/Seitenleiste), ende: true (immer ganz hinten),
//   bild: Pfad oder Liste von Pfaden (Kopfbild; Liste = täglich eine andere Variante), ueber: () => Text (kleine Zeile über dem Titel, z. B. Datum),
//   spruch: true (Spruch des Tages unter dem Titel; nur Heute),
//   kurztitel: kürzerer Name für die Tab-Leiste auf dem iPhone (z. B. „Physio“).
//
// Ereignisse: 'bereiche' (neuer Bereich angemeldet), 'route' (anderer Bereich aktiv).
import { emit } from './events.js';

const START = 'heute';
const bereiche = new Map();
let aktuell = null;

export function register(bereich) {
  bereiche.set(bereich.id, bereich);
  emit('bereiche', alleBereiche());
}

export function alleBereiche() {
  return [...bereiche.values()];
}

export function aktuelleRoute() {
  return aktuell ? bereiche.get(aktuell) : null;
}

export function go(id) {
  location.hash = `#/${id}`;
}

// '#/todos/123' → 'todos' (Teile dahinter sind für spätere Detail-Ansichten frei)
function idAusHash() {
  return location.hash.replace(/^#\/?/, '').split('/')[0];
}

function startId() {
  if (bereiche.has(START)) return START;
  return alleBereiche().find((b) => b.nav !== false)?.id ?? null;
}

function aufloesen() {
  const id = idAusHash();
  if (!bereiche.has(id)) {
    const ziel = startId();
    // replace: die unbekannte Adresse soll nicht im Verlauf bleiben
    if (ziel) location.replace(`#/${ziel}`);
    return;
  }
  if (id === aktuell) return;
  aktuell = id;
  emit('route', bereiche.get(id));
}

let gestartet = false;

export function startRouter() {
  if (gestartet) return;
  gestartet = true;
  window.addEventListener('hashchange', aufloesen);
  aufloesen();
}
