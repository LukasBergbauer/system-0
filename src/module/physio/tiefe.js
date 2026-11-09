// Innenansicht einer Bubble: Die Bubble wächst über den ganzen Bildschirm (Kreis aus ihrer Mitte),
// darin alle Einträge der Art mit Suchfeld und Anlegen. Eintrag antippen → Mindmap mit ihm in der Mitte
// (bei Regionen als Lernpfad, lernpfad.js).
// Raus: „‹ Kosmos“, Esc oder Zurück-Wischen (eigener Verlaufseintrag); Kreis schrumpft zurück in die Bubble.
import { el } from '../../ui/dom.js';
import { on } from '../../core/events.js';
import { art as artVon } from './arten.js';
import { EINTRAEGE, ladeEintraege, neuerEintrag, norm, suche } from './daten.js';
import { oeffneMindmap } from './overlay.js';

const DAUER = 560;
const ruhig = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let offen = false;

export function oeffneTiefe({ art, ausBubble, eintraege, signal }) {
  if (offen) return;
  offen = true;
  const ende = new AbortController();
  const kennung = crypto.randomUUID();
  const a = artVon(art);
  let alle = eintraege().filter((e) => e.art === art);

  const feld = el('input', {
    class: 'tief__feld',
    attrs: { type: 'search', placeholder: `${a.mehrzahl} durchsuchen oder anlegen …`, enterkeyhint: 'go' },
  });
  const liste = el('div', { class: 'tief__liste' });
  const zahl = el('span', { class: 'tief__zahl' });
  const zurueck = el('button', { class: 'tief__zurueck', text: '‹ Kosmos', attrs: { type: 'button' } });
  const flaeche = el('div', { class: 'tief', attrs: { role: 'dialog', 'aria-label': a.mehrzahl } }, [
    el('div', { class: 'tief__innen' }, [
      zurueck,
      el('h2', { class: 'tief__titel' }, [a.mehrzahl, zahl]),
      feld,
      liste,
    ]),
  ]);

  async function anlegen(titel) {
    const t = titel.trim();
    if (!t) return;
    const da = alle.find((e) => norm(e.titel) === norm(t));
    oeffne(da ?? await neuerEintrag(art, t));
  }
  const oeffne = (e, knopf) => oeffneMindmap({ ausKnopf: knopf, signal, mitteId: e.id, lernpfad: art === 'region' });

  function zeichne() {
    const text = feld.value.trim();
    const treffer = text ? suche(alle, text) : alle;
    zahl.textContent = String(alle.length);
    const zeilen = treffer.map((e) => {
      const z = el('button', { class: 'tief__zeile', attrs: { type: 'button' } }, [
        el('span', { class: 'tief__zeile-titel', text: e.titel }),
        e.kurz ? el('span', { class: 'tief__zeile-kurz', text: e.kurz }) : null,
      ]);
      z.addEventListener('click', () => oeffne(e, z));
      return z;
    });
    if (text && !alle.some((e) => norm(e.titel) === norm(text))) {
      zeilen.push(el('button', {
        class: 'tief__neu', text: `+ „${text}“ anlegen`, attrs: { type: 'button' }, on: { click: () => anlegen(text) },
      }));
    }
    if (!zeilen.length) zeilen.push(el('p', { class: 'tief__leer', text: `Noch keine ${a.mehrzahl}. Oben tippen und anlegen.` }));
    liste.replaceChildren(...zeilen);
  }

  feld.addEventListener('input', zeichne);
  feld.addEventListener('keydown', (e) => { if (e.key === 'Enter') anlegen(feld.value); });
  on('daten', async ({ table }) => {
    if (table !== EINTRAEGE) return;
    alle = (await ladeEintraege()).filter((e) => e.art === art);
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
    flaeche.classList.remove('tief--da');
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
  requestAnimationFrame(() => requestAnimationFrame(() => flaeche.classList.add('tief--da')));
}
