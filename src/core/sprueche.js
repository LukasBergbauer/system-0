// Japanische Sprichwörter für die Kopfbilder: japanisch + freie deutsche Übersetzung.
// spruchDesTages() wechselt um Mitternacht; mit versatz zeigt jeder Bereich am selben Tag einen anderen Spruch.
const SPRUECHE = [
  { jp: '一期一会', de: 'Jede Begegnung ist einmalig.' },
  { jp: '七転び八起き', de: 'Siebenmal fallen, achtmal aufstehen.' },
  { jp: '継続は力なり', de: 'Dranbleiben ist Stärke.' },
  { jp: '千里の道も一歩から', de: 'Auch ein Weg von tausend Meilen beginnt mit einem Schritt.' },
  { jp: '塵も積もれば山となる', de: 'Auch Staub wird, Stück für Stück, zum Berg.' },
  { jp: '石の上にも三年', de: 'Drei Jahre auf einem Stein, und er wird warm. Geduld trägt.' },
  { jp: '急がば回れ', de: 'Hast du es eilig, nimm den Umweg.' },
  { jp: '猿も木から落ちる', de: 'Auch Affen fallen mal vom Baum.' },
  { jp: '初心忘るべからず', de: 'Vergiss nie den Geist des Anfängers.' },
  { jp: '雨降って地固まる', de: 'Nach dem Regen wird der Boden fest.' },
  { jp: '案ずるより産むが易し', de: 'Tun ist leichter als sich sorgen.' },
  { jp: '為せば成る', de: 'Wer es angeht, schafft es.' },
  { jp: '笑う門には福来る', de: 'Wo gelacht wird, kommt das Glück hinein.' },
  { jp: '十人十色', de: 'Zehn Menschen, zehn Farben.' },
  { jp: '習うより慣れろ', de: 'Üben bringt mehr als nur lernen.' },
  { jp: '備えあれば憂いなし', de: 'Wer vorbereitet ist, muss sich nicht sorgen.' },
  { jp: '明日は明日の風が吹く', de: 'Morgen weht der Wind von morgen.' },
  { jp: '花鳥風月', de: 'Blume, Vogel, Wind und Mond: die Schönheit der Natur.' },
  { jp: '一石二鳥', de: 'Ein Stein, zwei Vögel.' },
  { jp: '能ある鷹は爪を隠す', de: 'Der kluge Falke verbirgt seine Krallen.' },
];

// Tage seit 1970 nach lokaler Uhrzeit (nicht UTC), damit der Wechsel um Mitternacht passiert.
function tagNummer(datum) {
  return Math.floor(Date.UTC(datum.getFullYear(), datum.getMonth(), datum.getDate()) / 86400000);
}

export function spruchDesTages(versatz = 0, datum = new Date()) {
  const n = SPRUECHE.length;
  return SPRUECHE[(((tagNummer(datum) + versatz) % n) + n) % n];
}
