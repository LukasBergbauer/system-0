// Arten der Einträge in Physio und ihre optionalen Felder.
// Die Felder landen in der Spalte `felder` (JSON), z. B. { dosierung: '3 × 10' }.
// Neue Art: hier ergänzen und per neuer Migration im Check bei `art` erlauben (zuletzt 018).

export const ARTEN = [
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

const NACH_ID = new Map(ARTEN.map((a) => [a.id, a]));

// Art zu einer id; unbekannte Art (z. B. von einer neueren App-Fassung) bekommt einen Ersatz.
export function art(id) {
  return NACH_ID.get(id) ?? { id, name: 'Eintrag', mehrzahl: 'Einträge', felder: [] };
}
