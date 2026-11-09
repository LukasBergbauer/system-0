// Modal „Claude“: Format-Prompt kopieren, JSON importieren (Datei oder eingefügt), Export für den eigenen Agenten.
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { modal } from '../../ui/modal.js';
import { importiere, exportText } from './austausch.js';

export const FORMAT = `Gib das Ergebnis am Ende als JSON-Codeblock aus, damit ich es in meine App importieren kann. Genau dieses Format:
{"posts":[{
  "schluessel":"kurzer-eindeutiger-name (bleibt gleich, wenn wir den Post später überarbeiten)",
  "titel":"Arbeitstitel",
  "art":"reel | karussell | post | story",
  "status":"idee | arbeit | geplant | gepostet",
  "datum":"JJJJ-MM-TT (geplanter Tag, sonst weglassen)",
  "hook":"erster Satz / erste 3 Sekunden",
  "skript":"Kurzfassung in einfachem Markdown: - Szenen/Folien als Liste, **fett** für Wichtiges",
  "cta":"Handlungsaufforderung am Ende",
  "caption":"fertige Caption",
  "hashtags":"#tag1 #tag2 …",
  "notiz":"optional"
}]}
Nur Felder, die sich ändern, müssen drin sein. Zahlen nach dem Posten: {"posts":[{"schluessel":"…","zahlen":{"aufrufe":0,"reichweite":0,"likes":0,"kommentare":0,"gespeichert":0,"geteilt":0,"follower":0}}]}
Erkenntnisse: {"erkenntnisse":[{"text":"Was hat funktioniert","warum":"Warum","belege":["schluessel-1","schluessel-2"]}]}`;

async function kopiere(knopf, text, ersatz) {
  try { await navigator.clipboard.writeText(text); knopf.textContent = 'Kopiert ✓'; } catch { ersatz.textContent = text; }
}

function sichereDatei(text) {
  const datei = new File([text], `insta-export-${new Date().toLocaleDateString('sv')}.json`, { type: 'application/json' });
  const url = URL.createObjectURL(datei);
  const a = el('a', { attrs: { href: url, download: datei.name } });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function oeffneClaude() {
  const feld = el('textarea', { class: 'field__input insta-import', attrs: { id: 'insta-import', rows: 7, placeholder: '{"posts":[{"schluessel":"…","titel":"…","hook":"…"}]}' } });
  const meldung = el('p', { class: 'app__note' });
  const warn = (t) => { meldung.className = 'app__note app__note--warn'; meldung.textContent = t; };

  const datei = el('input', { attrs: { type: 'file', accept: '.json,.txt,.md,application/json,text/plain', hidden: '' } });
  datei.addEventListener('change', async () => { if (datei.files[0]) feld.value = await datei.files[0].text(); datei.value = ''; });

  const format = button({ text: 'Format kopieren', variant: 'ghost', onClick: () => kopiere(format, FORMAT, meldung) });
  const exp = button({ text: 'Export kopieren', variant: 'ghost', onClick: async () => kopiere(exp, await exportText(), meldung) });
  const los = button({ text: 'Importieren', variant: 'primary', onClick: async () => {
    los.disabled = true;
    try {
      const r = await importiere(feld.value);
      meldung.className = 'app__note';
      meldung.textContent = [r.neu && `${r.neu} neu`, r.aktualisiert && `${r.aktualisiert} aktualisiert`,
        r.erkenntnisse && `${r.erkenntnisse} Erkenntnisse`, r.falsch && `${r.falsch} übersprungen`].filter(Boolean).join(', ') || 'Nichts Neues.';
      feld.value = '';
    } catch (e) { warn(e.message); }
    los.disabled = false;
  } });

  const m = modal({
    title: 'Claude',
    content: [
      el('p', { class: 'app__note', text: 'Skripte planst du mit Claude. Format kopieren und in den Chat geben, die JSON-Antwort hier importieren. Gleicher Schlüssel überarbeitet den Post.' }),
      el('div', { class: 'insta-knoepfe' }, [format, button({ text: 'Datei wählen', variant: 'ghost', onClick: () => datei.click() }), datei]),
      el('div', { class: 'field' }, [el('label', { class: 'field__label', text: 'JSON', attrs: { for: 'insta-import' } }), feld]),
      meldung,
      el('h3', { class: 'label', text: 'Für deinen Agenten' }),
      el('p', { class: 'app__note', text: 'Alle Posts mit Zahlen und bisherigen Erkenntnissen als JSON.' }),
      el('div', { class: 'insta-knoepfe' }, [exp, button({ text: 'Als Datei sichern', variant: 'ghost', onClick: async () => sichereDatei(await exportText()) })]),
    ],
    actions: [los],
  });
  m.element.addEventListener('close', () => m.element.remove());
  m.open();
}
