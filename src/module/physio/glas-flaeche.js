// Glas-Fläche (Kugel in der Mitte antippen): wächst als Kreis aus der Kugel über den ganzen Bildschirm,
// schrumpft beim Schließen zurück hinein. Raus: „‹ Kosmos“, Esc oder Zurück-Wischen (eigener Verlaufseintrag).
// Glas-Unschärfe erst nach dem Aufgehen (tief--ruhig), damit der Kreis flüssig wächst. Stile: physio-tiefe.css.
// const f = oeffneFlaeche({ name, ausBubble, inhalt, signal }); f.ende = AbortSignal (zu); f.schliessen()
import { el } from '../../ui/dom.js';

const DAUER = 600;
const ruhig = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let offen = false;

export function oeffneFlaeche({ name, ausBubble, inhalt, signal }) {
  if (offen) return null;
  offen = true;
  const ende = new AbortController();
  const kennung = crypto.randomUUID();
  const zurueck = el('button', { class: 'tief__zurueck', text: '‹ Kosmos', attrs: { type: 'button' } });
  const flaeche = el('div', { class: 'tief tief--erst', attrs: { role: 'dialog', 'aria-label': name } }, [
    el('div', { class: 'tief__innen' }, [zurueck, ...inhalt]),
  ]);

  function mittelpunkt() {
    const r = (ausBubble?.isConnected ? ausBubble : document.body).getBoundingClientRect();
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
  mittelpunkt();
  document.body.append(flaeche);
  document.documentElement.classList.add('mm-offen');
  void flaeche.offsetWidth; // Startkreis festhalten, dann aufgehen lassen
  flaeche.classList.add('tief--da');
  setTimeout(() => flaeche.classList.add('tief--ruhig'), ruhig() ? 0 : DAUER + 80);
  setTimeout(() => flaeche.classList.remove('tief--erst'), 1400); // beim Tippen nicht erneut hereinperlen
  return { ende: ende.signal, schliessen };
}
