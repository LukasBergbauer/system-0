// Die beiden Navigationen: Seitenleiste (Mac, ab 768 px) und schwebende Kapsel (iPhone).
// Beide sind normale Links auf #/<id>, der aktive Eintrag hat aria-current="page".
// Unter dem aktiven Eintrag gleitet eine weiße Pille (.nav__zeiger) mit. Sie bleibt beim Neuzeichnen erhalten,
// nur der Inhalt (.nav__inhalt) wird ersetzt – so kann sie von Eintrag zu Eintrag gleiten.
import { el } from '../ui/dom.js';
import { symbol } from '../ui/symbol.js';
import { MEHR } from './nav-plan.js';

// kurz = true (Kapsel): kurzer Name, falls der Bereich einen hat („Physio“ statt „PhysioZentrum“).
// zahl: kleine Zahl rechts am Eintrag (nur Seitenleiste, z. B. offene To-dos), 0 = keine.
function link(bereich, klasse, aktiv, kurz = false, zahl = 0) {
  return el('a', {
    class: klasse,
    attrs: { href: `#/${bereich.id}`, 'aria-current': aktiv ? 'page' : false },
  }, [
    symbol(bereich.symbol),
    el('span', { class: 'nav__text', text: (kurz && bereich.kurztitel) || bereich.titel }),
    zahl > 0 && el('span', { class: 'nav-side__zahl', text: String(zahl) }),
  ]);
}

const SYNC_TEXT = { neu: 'noch nicht abgeglichen', läuft: 'gleicht ab …', ok: 'synchronisiert', fehler: 'Abgleich fehlgeschlagen' };

// Suchfeld: zurzeit nur Optik (die Suche kommt in Schritt e)
function suche() {
  return el('button', { class: 'nav-side__suche', attrs: { type: 'button', 'aria-label': 'Suchen' } }, [
    symbol('suche'),
    el('span', { class: 'nav__text', text: 'Suchen …' }),
  ]);
}

function profil(sync) {
  return el('div', { class: `nav-side__profil nav-side__profil--${sync.state === 'läuft' ? 'laeuft' : sync.state}` }, [
    el('span', { class: 'nav-side__avatar', text: 'L' }),
    el('div', { class: 'nav__text' }, [
      el('b', { text: 'Lukas' }),
      el('small', { text: SYNC_TEXT[sync.state] ?? 'offline' }),
    ]),
  ]);
}

// Pille unter den aktiven Eintrag schieben (beim ersten Mal ohne Gleiten)
function zeigerSetzen(nav) {
  const z = nav.querySelector('.nav__zeiger');
  const a = nav.querySelector('[aria-current="page"]');
  if (!a || !a.offsetWidth) { z.style.opacity = '0'; return; }
  const n = nav.getBoundingClientRect(), r = a.getBoundingClientRect();
  const x = r.left - n.left - nav.clientLeft, y = r.top - n.top - nav.clientTop;
  if (!z.dataset.da) z.style.transition = 'none';
  Object.assign(z.style, { opacity: '1', width: `${r.width}px`, height: `${r.height}px`, transform: `translate(${x}px, ${y}px)` });
  if (!z.dataset.da) { z.dataset.da = '1'; requestAnimationFrame(() => requestAnimationFrame(() => (z.style.transition = ''))); }
}

// Gerüst einmal anlegen: Zeiger + Inhalt. Neu ausrichten, wenn sich die Größe ändert (Einklappen, Fenster).
function inhalt(nav) {
  if (!nav.firstChild) {
    nav.append(el('span', { class: 'nav__zeiger', attrs: { 'aria-hidden': 'true' } }), el('div', { class: 'nav__inhalt' }));
    new ResizeObserver(() => zeigerSetzen(nav)).observe(nav);
  }
  return nav.lastChild;
}

function klappe() {
  return el('button', {
    class: 'nav-side__klappe',
    attrs: { type: 'button', 'aria-label': 'Seitenleiste ein- oder ausklappen' },
    on: { click: (e) => {
      const shell = e.currentTarget.closest('.shell');
      shell.classList.toggle('shell--schmal');
      try { localStorage.setItem('leiste', shell.classList.contains('shell--schmal') ? 'zu' : 'auf'); } catch {}
    } },
  }, [symbol('zurueck')]);
}

// zahlen: { <bereich-id>: Zahl } für die kleinen Zahlen am Eintrag; sync: Status aus core/sync.js
export function renderSide(nav, plan, aktivId, { zahlen = {}, sync }) {
  inhalt(nav).replaceChildren(
    el('div', { class: 'nav-side__marke' }, [
      el('span', { class: 'nav-side__logo', text: '0' }),
      el('div', { class: 'nav__text' }, [el('b', { text: 'System 0' }), el('small', { text: 'Lukas' })]),
    ]),
    klappe(),
    suche(),
    ...plan.abschnitte.flatMap((a) => [
      el('div', { class: 'nav-side__abschnitt', text: a.titel }),
      ...a.bereiche.map((b) => link(b, 'nav-side__link', b.id === aktivId, false, zahlen[b.id])),
    ]),
    profil(sync),
  );
  zeigerSetzen(nav);
}

export function renderTabs(nav, plan, aktivId) {
  const imMehr = aktivId === MEHR.id || plan.mehr.some((b) => b.id === aktivId);
  const eintraege = plan.tabs.map((b) => link(b, 'nav-tabs__link', b.id === aktivId, true));
  if (plan.mehr.length > 0) eintraege.push(link(MEHR, 'nav-tabs__link', imMehr));
  inhalt(nav).replaceChildren(...eintraege);
  zeigerSetzen(nav);
}
