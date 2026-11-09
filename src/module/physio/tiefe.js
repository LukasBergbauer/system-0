// Innenansicht einer Kugel (Kosmos, Kugel in der Mitte antippen): Die Kugel wächst über den ganzen Bildschirm
// (Kreis aus ihrer Mitte), darin ihre Einträge als Glas-Karten mit Suchfeld und Anlegen.
// art = eine Art (Kugel „Übungen“ usw.) oder null = alle Punkte (Kugel „Physio“; dort wählt man beim Anlegen die Art).
// Eintrag antippen → Mindmap mit ihm in der Mitte (bei Regionen als Lernpfad, lernpfad.js).
// Glas-Unschärfe der Karten erst nach dem Aufgehen (tief--ruhig), damit der Kreis flüssig wächst.
// Raus: „‹ Kosmos“, Esc oder Zurück-Wischen (eigener Verlaufseintrag); Kreis schrumpft zurück in die Bubble.
import { el } from '../../ui/dom.js';
import { on } from '../../core/events.js';
import { ARTEN, art as artVon } from './arten.js';
import { EINTRAEGE, ladeEintraege, neuerEintrag, norm, suche } from './daten.js';
import { oeffneMindmap } from './overlay.js';

const DAUER = 600;
const ruhig = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let offen = false;

export function oeffneTiefe({ art, ausBubble, eintraege, signal }) {
  if (offen) return;
  offen = true;
  const ende = new AbortController();
  const kennung = crypto.randomUUID();
  const name = art ? artVon(art).mehrzahl : 'Alle Punkte';
  const passt = (e) => !art || e.art === art;
  let alle = eintraege().filter(passt);

  const feld = el('input', {
    class: 'tief__feld',
    attrs: { type: 'search', placeholder: `${art ? name : 'Alles'} durchsuchen oder anlegen …`, enterkeyhint: 'go' },
  });
  const liste = el('div', { class: 'tief__liste' });
  const zahl = el('span', { class: 'tief__zahl' });
  const zurueck = el('button', { class: 'tief__zurueck', text: '‹ Kosmos', attrs: { type: 'button' } });
  const flaeche = el('div', { class: 'tief tief--erst', attrs: { role: 'dialog', 'aria-label': name } }, [
    el('div', { class: 'tief__innen' }, [
      zurueck,
      el('h2', { class: 'tief__titel' }, [name, zahl]),
      feld,
      liste,
    ]),
  ]);

  async function anlegen(titel, neueArt = art) {
    const t = titel.trim();
    if (!t || !neueArt) return;
    const da = alle.find((e) => norm(e.titel) === norm(t) && e.art === neueArt);
    oeffne(da ?? await neuerEintrag(neueArt, t));
  }
  const oeffne = (e, knopf) => oeffneMindmap({ ausKnopf: knopf, signal, mitteId: e.id, lernpfad: art === 'region' });

  function zeichne() {
    const text = feld.value.trim();
    const treffer = text ? suche(alle, text) : alle;
    zahl.textContent = String(alle.length);
    const zeilen = treffer.map((e, i) => {
      const z = el('button', { class: 'tief__zeile', attrs: { type: 'button' } }, [
        el('span', { class: 'tief__zeile-titel', text: e.titel }),
        !art && el('span', { class: 'tief__zeile-art', text: artVon(e.art).name }),
        e.kurz ? el('span', { class: 'tief__zeile-kurz', text: e.kurz }) : null,
      ]);
      z.style.setProperty('--i', Math.min(i, 12));
      z.addEventListener('click', () => oeffne(e, z));
      return z;
    });
    if (text && !alle.some((e) => norm(e.titel) === norm(text))) {
      zeilen.push(art
        ? el('button', { class: 'tief__neu', text: `+ „${text}“ anlegen`, attrs: { type: 'button' }, on: { click: () => anlegen(text) } })
        : el('div', { class: 'tief__neu tief__neu--wahl' }, [
          el('span', { text: `+ „${text}“ anlegen als` }),
          el('div', { class: 'tief__arten' }, ARTEN.map((x) => el('button', {
            class: 'tief__art', text: x.name, attrs: { type: 'button' }, on: { click: () => anlegen(text, x.id) },
          }))),
        ]));
    }
    if (!zeilen.length) zeilen.push(el('p', { class: 'tief__leer', text: `Noch keine ${name}. Oben tippen und anlegen.` }));
    liste.replaceChildren(...zeilen);
  }

  feld.addEventListener('input', zeichne);
  feld.addEventListener('keydown', (e) => { if (e.key === 'Enter') anlegen(feld.value); });
  on('daten', async ({ table }) => {
    if (table !== EINTRAEGE) return;
    alle = (await ladeEintraege()).filter(passt);
    if (!ende.signal.aborted) zeichne();
  }, { signal: ende.signal });

  // ---------- Hinein und hinaus ----------
  function mittelpunkt() {
    const r = (ausBubble.isConnected ? ausBubble : document.body).getBoundingClientRect();
    flaeche.style.setProperty('--tx', `${r.left + r.width / 2}px`);
    flaeche.style.setProperty('--ty', `${r.top + r.height / 2}px`);
    flaeche.style.setProperty('--tr', `${r.width / 2}px`);
  }

  function schliessen({ ausVerlauf } = {}) {
    if (ende.signal.aborted) return;
    ende.abort();
    if (!ausVerlauf && history.state?.kosTief === kennung) history.back();
    mittelpunkt();
    flaeche.style.setProperty('--tr', '0px'); // ganz in die Kugel zurück, ohne Rest-Scheibe
    flaeche.classList.remove('tief--da', 'tief--ruhig');
    setTimeout(() => { flaeche.remove(); offen = false; }, ruhig() ? 0 : DAUER);
    document.documentElement.classList.remove('mm-offen');
  }

  zurueck.addEventListener('click', () => schliessen());
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !document.querySelector('dialog.mm[open]')) schliessen();
  }, { signal: ende.signal });
  // Zurück-Wischen: nur schließen, wenn man vor den eigenen Eintrag zurückgeht (nicht beim Schließen der Mindmap)
  addEventListener('popstate', (e) => {
    if (e.state?.kosTief !== kennung && !document.querySelector('dialog.mm[open]')) schliessen({ ausVerlauf: true });
  }, { signal: ende.signal });
  signal?.addEventListener('abort', () => schliessen(), { signal: ende.signal });

  history.pushState({ ...history.state, kosTief: kennung }, '');
  zeichne();
  mittelpunkt();
  document.body.append(flaeche);
  document.documentElement.classList.add('mm-offen');
  void flaeche.offsetWidth; // Startkreis festhalten, dann aufgehen lassen
  flaeche.classList.add('tief--da');
  setTimeout(() => flaeche.classList.add('tief--ruhig'), ruhig() ? 0 : DAUER + 80);
  setTimeout(() => flaeche.classList.remove('tief--erst'), 1400); // beim Tippen nicht erneut hereinperlen
}
