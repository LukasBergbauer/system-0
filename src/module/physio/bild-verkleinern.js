// Verkleinert ein Foto im Browser, bevor es gespeichert wird.
//   groß:  lange Seite höchstens 1200 px (für den Eintrag; Lukas' Wahl, spart Speicher: ~130 KB statt ~240 KB)
//   klein: Quadrat 320 px, mittig zugeschnitten (für den Ball in der Mindmap)
// Beides als JPEG. Über <img> geladen, damit die Drehung aus dem Foto (EXIF) überall stimmt, auch in Safari.
// verkleinere(datei) → { gross: Blob, klein: Blob, breite, hoehe }

const GROSS = 1200;
const KLEIN = 320;

async function ladeBild(datei) {
  const url = URL.createObjectURL(datei);
  try {
    const bild = new Image();
    // onload statt decode(): decode() wartet in einem gerade nicht sichtbaren Fenster unter Umständen ewig
    await new Promise((fertig, fehler) => {
      bild.onload = fertig;
      bild.onerror = () => fehler(new Error('Das ist kein Bild, das sich lesen lässt'));
      bild.src = url;
    });
    return bild;
  } finally {
    // erst nach dem Zeichnen freigeben wäre genauer; decode() hat die Pixel aber schon
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}

function alsJpeg(canvas, qualitaet) {
  return new Promise((fertig, fehler) => {
    canvas.toBlob((blob) => (blob ? fertig(blob) : fehler(new Error('Bild konnte nicht umgewandelt werden'))),
      'image/jpeg', qualitaet);
  });
}

function leinwand(breite, hoehe) {
  const c = document.createElement('canvas');
  c.width = breite;
  c.height = hoehe;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  return [c, ctx];
}

export async function verkleinere(datei) {
  const bild = await ladeBild(datei);
  const w = bild.naturalWidth;
  const h = bild.naturalHeight;
  if (!w || !h) throw new Error('Das ist kein Bild, das sich lesen lässt');

  // groß: nur verkleinern, nie vergrößern
  const f = Math.min(1, GROSS / Math.max(w, h));
  const breite = Math.round(w * f);
  const hoehe = Math.round(h * f);
  const [cg, xg] = leinwand(breite, hoehe);
  xg.drawImage(bild, 0, 0, breite, hoehe);

  // klein: größtes mittiges Quadrat
  const seite = Math.min(w, h);
  const [ck, xk] = leinwand(KLEIN, KLEIN);
  xk.drawImage(bild, (w - seite) / 2, (h - seite) / 2, seite, seite, 0, 0, KLEIN, KLEIN);

  const [gross, klein] = await Promise.all([alsJpeg(cg, 0.82), alsJpeg(ck, 0.8)]);
  return { gross, klein, breite, hoehe };
}
