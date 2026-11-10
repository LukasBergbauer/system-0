// Bereiche (Arten) der Einträge in Physio und ihre optionalen Felder. Lukas legt sie selbst fest (bereiche.js);
// gespeichert als Liste in der Einstellung `physio_bereiche`, ohne Einstellung gilt STANDARD.
// Die Felder landen in der Spalte `felder` (JSON), z. B. { dosierung: '3 × 10' }. Spalte `art` ist frei (Migration 021).
// ARTEN wird beim Laden an Ort und Stelle ersetzt, damit alle Importe immer den aktuellen Stand sehen.
import { getSetting, setSetting } from '../../core/einstellungen.js';

const SCHLUESSEL = 'physio_bereiche';

const STANDARD = [
  {
    id: 'uebung',
    name: 'Übung',
    mehrzahl: 'Übungen',
    felder: [
      { key: 'ausgangsstellung', label: 'Ausgangsstellung' },
      { key: 'durchfuehrung', label: 'Durchführung' },
      { key: 'dosierung', label: 'Dosierung' },
      { key: 'fehler', label: 'Häufige Fehler' },
    ],
  },
  {
    id: 'krankheitsbild',
    name: 'Krankheitsbild',
    mehrzahl: 'Krankheitsbilder',
    felder: [
      { key: 'ursache', label: 'Ursache' },
      { key: 'symptome', label: 'Symptome' },
      { key: 'tests', label: 'Tests' },
      { key: 'behandlung', label: 'Behandlung' },
    ],
  },
  {
    id: 'trainingsform',
    name: 'Trainingsform',
    mehrzahl: 'Trainingsformen',
    felder: [
      { key: 'ziel', label: 'Ziel' },
      { key: 'dosierung', label: 'Belastung / Dosierung' },
      { key: 'prinzipien', label: 'Prinzipien' },
    ],
  },
  {
    id: 'muskel',
    name: 'Muskel',
    mehrzahl: 'Muskeln',
    felder: [
      { key: 'ursprung', label: 'Ursprung' },
      { key: 'ansatz', label: 'Ansatz' },
      { key: 'funktion', label: 'Funktion' },
      { key: 'innervation', label: 'Innervation' },
    ],
  },
  { id: 'region', name: 'Region', mehrzahl: 'Regionen', felder: [] },
  {
    id: 'technik',
    name: 'Technik',
    mehrzahl: 'Techniken',
    felder: [
      { key: 'ziel', label: 'Ziel' },
      { key: 'durchfuehrung', label: 'Durchführung' },
      { key: 'kontraindikationen', label: 'Kontraindikationen' },
    ],
  },
];

export const ARTEN = structuredClone(STANDARD);

export async function ladeArten() {
  const liste = await getSetting(SCHLUESSEL);
  if (Array.isArray(liste) && liste.length) ARTEN.splice(0, ARTEN.length, ...liste);
  return ARTEN;
}

export function speichereArten(liste) {
  ARTEN.splice(0, ARTEN.length, ...liste);
  return setSetting(SCHLUESSEL, liste);
}

// Art zu einer id; unbekannte Art (gelöschter Bereich, neuere App-Fassung) bekommt einen Ersatz.
export function art(id) {
  return ARTEN.find((a) => a.id === id) ?? { id, name: 'Eintrag', mehrzahl: 'Einträge', felder: [] };
}
