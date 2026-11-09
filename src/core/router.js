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
//   kurztitel: kürzerer Name für die Tab-Leiste auf dem iPhone (z. B. „Physio“),
//   dashboard: true (eigener Kopf statt Titel, breite Fläche; nur Heute).
//
// Zusatz: '#/todos/neu' öffnet To-dos und sagt „gleich ein neues anlegen“. Der Bereich liest ihn beim Öffnen
//   mit zusatzNehmen() (siehe dort). Bekannt: todos/neu, kalender/neu, kalender/woche, physio/neu, physio/mindmap, quiz/daily,
//   und <bereich>/<id> aus der Suche (todos/<id>, kalender/<id>, physio/<id>, training/uebung:<id>, training/plaene:<id>, ziele/<id>, buecher/<id>):
//   öffnet genau diesen Eintrag.
//   Ids mit Sonderzeichen mit encodeURIComponent anhängen; zusatzNehmen() dekodiert.
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

const teile = () => location.hash.replace(/^#\/?/, '').split('/');

// '#/todos/neu' → 'todos'
function idAusHash() {
  return teile()[0];
}

// '#/todos/neu' → 'neu' (sonst null). Entfernt den Zusatz aus der Adresse (ohne neuen Verlaufseintrag),
// damit Neuladen oder Zurück ihn nicht noch einmal auslöst.
export function zusatzNehmen() {
  const [id, ...rest] = teile();
  if (!rest.length) return null;
  history.replaceState(history.state, '', `#/${id}`);
  return decodeURIComponent(rest.join('/'));
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
  // Gleicher Bereich ohne Zusatz: nichts tun. Mit Zusatz (z. B. Suche, während To-dos offen ist): neu öffnen.
  if (id === aktuell && teile().length < 2) return;
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
