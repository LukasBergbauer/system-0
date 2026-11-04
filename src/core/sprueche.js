// Kurze deutsche Sätze für die Kopfbilder (eigene Sätze, keine Zitate).
// spruchDesTages() wechselt um Mitternacht; mit versatz zeigt jeder Bereich am selben Tag einen anderen Satz.
// desTages(liste) wählt genauso aus einer beliebigen Liste (z. B. Bild-Varianten).
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

// Ein Eintrag aus einer Liste, der täglich um Mitternacht wechselt (z. B. Spruch oder Kopfbild-Variante).
export function desTages(liste, versatz = 0, datum = new Date()) {
  const n = liste.length;
  return n ? liste[(((tagNummer(datum) + versatz) % n) + n) % n] : undefined;
}

export function spruchDesTages(versatz = 0, datum = new Date()) {
  return desTages(SPRUECHE, versatz, datum);
}
