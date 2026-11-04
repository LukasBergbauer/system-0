// Kurze deutsche Sätze für die Kopfbilder (eigene Sätze, keine Zitate).
// spruchDesTages() wechselt um Mitternacht; mit versatz zeigt jeder Bereich am selben Tag einen anderen Satz.
const SPRUECHE = [
  'Ein Schritt nach dem anderen.',
  'Klein anfangen. Dranbleiben.',
  'Ruhe ist auch eine Stärke.',
  'Heute zählt.',
  'Was du heute pflegst, trägt dich morgen.',
  'Weniger Lärm, mehr Klarheit.',
  'Fokus ist eine Entscheidung.',
  'Langsam ist auch ein Tempo.',
  'Gute Tage werden gebaut, nicht gefunden.',
  'Der Körper merkt sich jede Wiederholung.',
  'Erst atmen, dann handeln.',
  'Ordnung schafft Raum.',
  'Fortschritt ist leise.',
  'Mach es einfach. Dann mach es gut.',
  'Kraft wächst in der Pause.',
  'Jeder Tag ist eine neue Seite.',
  'Wer klar plant, lebt freier.',
  'Nicht perfekt. Aber heute.',
  'Stark ist, wer weitermacht.',
  'Das Wichtige zuerst.',
];

// Tage seit 1970 nach lokaler Uhrzeit (nicht UTC), damit der Wechsel um Mitternacht passiert.
function tagNummer(datum) {
  return Math.floor(Date.UTC(datum.getFullYear(), datum.getMonth(), datum.getDate()) / 86400000);
}

export function spruchDesTages(versatz = 0, datum = new Date()) {
  const n = SPRUECHE.length;
  return SPRUECHE[(((tagNummer(datum) + versatz) % n) + n) % n];
}
