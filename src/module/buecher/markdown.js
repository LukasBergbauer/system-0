// Einfaches Markdown → Elemente (ohne innerHTML, also sicher).
// Zeilen: # / ## / ### Überschrift, > Zitat, - oder * Liste, 1. Nummernliste, --- Linie, Leerzeile = neuer Absatz.
// Im Text: **fett**, *kursiv*.
import { el } from '../../ui/dom.js';

function inline(text) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/).filter(Boolean).map((t) => {
    if (t.startsWith('**') && t.endsWith('**') && t.length > 4) return el('strong', { text: t.slice(2, -2) });
    if (t.startsWith('*') && t.endsWith('*') && t.length > 2) return el('em', { text: t.slice(1, -1) });
    return t;
  });
}

const mitUmbruch = (zeilen) => zeilen.flatMap((z, i) => (i ? [el('br'), ...inline(z)] : inline(z)));

export function zeigeMarkdown(text) {
  const bloecke = [];
  let art = null;
  let zeilen = [];
  const fertig = () => {
    if (!zeilen.length) return;
    if (art === 'zitat') bloecke.push(el('blockquote', {}, el('p', {}, mitUmbruch(zeilen))));
    else if (art === 'ul' || art === 'ol') bloecke.push(el(art, {}, zeilen.map((z) => el('li', {}, inline(z)))));
    else bloecke.push(el('p', {}, mitUmbruch(zeilen)));
    zeilen = [];
    art = null;
  };
  const sammle = (neu, inhalt) => {
    if (art !== neu) fertig();
    art = neu;
    zeilen.push(inhalt);
  };

  for (const roh of (text || '').split('\n')) {
    const z = roh.trimEnd();
    let m;
    if (!z.trim()) fertig();
    else if ((m = z.match(/^(#{1,3})\s+(.*)$/))) { fertig(); bloecke.push(el(`h${m[1].length + 1}`, {}, inline(m[2]))); }
    else if (/^-{3,}$/.test(z.trim())) { fertig(); bloecke.push(el('hr')); }
    else if ((m = z.match(/^>\s?(.*)$/))) sammle('zitat', m[1]);
    else if ((m = z.match(/^\s*[-*]\s+(.*)$/))) sammle('ul', m[1]);
    else if ((m = z.match(/^\s*\d+[.)]\s+(.*)$/))) sammle('ol', m[1]);
    else sammle('p', z);
  }
  fertig();
  return el('div', { class: 'buch-text' }, bloecke);
}
