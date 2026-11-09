// Suche über To-dos, Termine, Physio-Punkte, Trainings-Übungen und -Pläne, Ziele, Affirmationen: Suchfeld oben in der Seitenleiste oder ⌘K / Strg+K.
// Liest nur über core/ (store, Google-Zwischenspeicher). Ein Treffer öffnet seinen Bereich über den
// Router-Zusatz #/<bereich>/<id>; der Bereich liest ihn mit zusatzNehmen() und öffnet den Eintrag.
// Enter öffnet den ersten Treffer, Esc schließt.
import { el } from '../ui/dom.js';
import { modal } from '../ui/modal.js';
import { list, listRow } from '../ui/list.js';
import { getAll } from '../core/store.js';
import { getMeta } from '../core/sync-local.js';
import { go } from '../core/router.js';

const MAX = 6; // Treffer je Gruppe
const norm = (s) => (s || '').toLocaleLowerCase('de');
const datum = (iso) => new Date(iso).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const naehe = (iso) => Math.abs(new Date(iso) - Date.now()); // Termine: zuerst die zeitlich nächsten

// Alle durchsuchbaren Einträge, schon in der Reihenfolge, in der sie erscheinen sollen.
async function laden() {
  const [todos, termine, google, physio, uebungen, plaene, planEinheiten, zielBereiche, ziele, affs] = await Promise.all([
    getAll('todos'), getAll('termine'), getMeta('kalender:google'), getAll('physio_eintraege'),
    getAll('training_uebungen'), getAll('trainingsplaene'), getAll('plan_einheiten'), getAll('ziel_bereiche'), getAll('lebensziele'), getAll('affirmationen'),
  ]);
  const physioName = new Map(physio.map((p) => [p.id, p.titel]));
  const uebungName = (u) => (u.physio_id && physioName.get(u.physio_id)) || u.name || 'Übung';
  const alleTermine = [...termine, ...(google?.termine ?? [])].sort((a, b) => naehe(a.start) - naehe(b.start));
  return [
    {
      titel: 'To-dos', bereich: 'todos',
      eintraege: [...todos].sort((a, b) => !!a.erledigt_am - !!b.erledigt_am).map((t) => ({
        id: t.id, titel: t.titel, text: t.notiz,
        sub: t.erledigt_am ? 'Erledigt' : t.faellig_am ? `Fällig ${datum(t.faellig_am)}` : '',
      })),
    },
    {
      titel: 'Termine', bereich: 'kalender',
      eintraege: alleTermine.map((t) => ({
        id: t.id, titel: t.titel, text: `${t.ort || ''} ${t.notiz || ''}`,
        sub: [datum(t.start), t.ort, t.google && 'Google'].filter(Boolean).join(' · '),
      })),
    },
    {
      titel: 'Physio-Punkte', bereich: 'physio',
      eintraege: [...physio].sort((a, b) => a.titel.localeCompare(b.titel, 'de')).map((e) => ({
        id: e.id, titel: e.titel, text: `${e.kurz || ''} ${e.text || ''}`, sub: e.kurz,
      })),
    },
    {
      titel: 'Trainings-Übungen', bereich: 'training',
      eintraege: uebungen.map((u) => ({ id: `uebung:${u.id}`, titel: uebungName(u), text: u.notiz, sub: u.physio_id ? 'aus PhysioZentrum' : '' }))
        .sort((a, b) => a.titel.localeCompare(b.titel, 'de')),
    },
    {
      titel: 'Trainingspläne', bereich: 'training',
      eintraege: plaene.map((p) => {
        const titel = planEinheiten.filter((pe) => pe.plan_id === p.id).map((pe) => pe.titel).filter(Boolean).join(', ');
        return { id: `plaene:${p.id}`, titel: p.name || 'Plan', text: titel, sub: [p.aktiv && 'aktiv', titel].filter(Boolean).join(' · ') };
      }),
    },
    {
      titel: 'Ziele', bereich: 'ziele',
      eintraege: [
        ...ziele.map((z) => ({ id: z.id, titel: z.titel || 'Ziel', text: z.warum, sub: zielBereiche.find((b) => b.id === z.bereich_id)?.name })),
        ...zielBereiche.map((b) => ({ id: b.id, titel: b.name, text: b.vision, sub: 'Bereich' })),
      ],
    },
    {
      titel: 'Affirmationen', bereich: 'affirmationen',
      eintraege: affs.map((a) => ({ id: a.id, titel: a.text, sub: ziele.find((z) => z.id === a.lebensziel_id)?.titel })),
    },
  ];
}

// Alle Wörter müssen vorkommen (Titel oder Text). Titel, die mit dem Suchwort beginnen, zuerst.
function finde(gruppen, suchtext) {
  const woerter = norm(suchtext).split(/\s+/).filter(Boolean);
  if (!woerter.length) return [];
  return gruppen.map((g) => {
    const treffer = g.eintraege.filter((e) => {
      const alles = norm(`${e.titel} ${e.text}`);
      return woerter.every((w) => alles.includes(w));
    });
    const vorn = (e) => (norm(e.titel).startsWith(woerter[0]) ? 0 : 1);
    return { ...g, treffer: treffer.sort((a, b) => vorn(a) - vorn(b)).slice(0, MAX) };
  }).filter((g) => g.treffer.length);
}

let fenster = null; // das gerade offene Such-Fenster (wird beim Schließen entfernt)

export function oeffneSuche() {
  if (fenster?.element.open) return fenster.close();
  let gruppen = [];
  const feld = el('input', {
    class: 'field__input suche__feld',
    attrs: { type: 'search', placeholder: 'To-dos, Termine, Physio …', 'aria-label': 'Suchen', enterkeyhint: 'go' },
  });
  const ergebnis = el('div', { class: 'suche__ergebnis' });
  fenster = modal({ title: 'Suchen', content: [feld, ergebnis] });
  fenster.element.classList.add('suche');
  fenster.element.addEventListener('close', () => fenster.element.remove());

  const oeffne = (bereich, id) => { fenster.close(); go(`${bereich}/${encodeURIComponent(id)}`); };

  function zeige() {
    const text = feld.value.trim();
    const gefunden = finde(gruppen, text);
    if (!text) return ergebnis.replaceChildren(el('p', { class: 'app__note', text: 'Suche in To-dos, Terminen und Physio-Punkten.' }));
    if (!gefunden.length) return ergebnis.replaceChildren(el('p', { class: 'app__note', text: 'Nichts gefunden.' }));
    ergebnis.replaceChildren(...gefunden.map((g) => el('section', { class: 'suche__gruppe' }, [
      el('h3', { class: 'label', text: g.titel }),
      list(g.treffer.map((e) => listRow({ title: e.titel, sub: e.sub, onClick: () => oeffne(g.bereich, e.id) }))),
    ])));
  }

  feld.addEventListener('input', zeige);
  feld.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const erste = finde(gruppen, feld.value)[0];
    if (erste) oeffne(erste.bereich, erste.treffer[0].id);
  });

  zeige();
  fenster.open();
  feld.focus();
  laden().then((g) => { gruppen = g; zeige(); });
}

// ⌘K (Mac) bzw. Strg+K: Suche auf oder zu. signal endet mit dem App-Rahmen (nach dem Abmelden keine Suche).
export function sucheTaste(signal) {
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      oeffneSuche();
    }
  }, { signal });
}
