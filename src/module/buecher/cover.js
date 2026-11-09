// Cover-Bilder: eigenes Foto verkleinern, oder bei Open Library suchen (kostenlos, ohne Key).
//   verkleinere(blob)        → JPEG-Blob, lange Seite höchstens 600 px
//   sucheCover(titel, autor) → [{ titel, autor, url }] (höchstens 6, nur Treffer mit Cover)
//   ladeCover(url)           → verkleinerter Blob (zum Speichern im Gerät, damit es offline da ist)
const MAX = 600;

export async function verkleinere(blob) {
  const url = URL.createObjectURL(blob);
  try {
    const bild = new Image();
    await new Promise((ok, fehler) => {
      bild.onload = ok;
      bild.onerror = () => fehler(new Error('Das Bild lässt sich nicht lesen'));
      bild.src = url;
    });
    const f = Math.min(1, MAX / Math.max(bild.naturalWidth, bild.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(bild.naturalWidth * f);
    c.height = Math.round(bild.naturalHeight * f);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bild, 0, 0, c.width, c.height);
    return await new Promise((ok, fehler) => c.toBlob((b) => (b ? ok(b) : fehler(new Error('Bild nicht umwandelbar'))), 'image/jpeg', 0.85));
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function sucheCover(titel, autor) {
  const p = new URLSearchParams({ title: titel, limit: '20', fields: 'title,author_name,cover_i' });
  if (autor) p.set('author', autor);
  const antwort = await fetch(`https://openlibrary.org/search.json?${p}`);
  if (!antwort.ok) throw new Error('Open Library antwortet nicht');
  const { docs = [] } = await antwort.json();
  return docs.filter((d) => d.cover_i).slice(0, 6).map((d) => ({
    titel: d.title, autor: d.author_name?.[0] || '', url: `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`,
  }));
}

export async function ladeCover(url) {
  const antwort = await fetch(url);
  if (!antwort.ok) throw new Error('Cover nicht geladen');
  return verkleinere(await antwort.blob());
}
