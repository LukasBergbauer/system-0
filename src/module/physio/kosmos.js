// Kosmos: Startseite des PhysioZentrums. In der Mitte der Kern „Physio“ (öffnet die Mindmap),
// drumherum je Pfad eine schwebende Glas-Bubble. Hover (bzw. erstes Tippen) = in die Bubble eindringen
// (sie kommt nach vorn, Innenraum mit den letzten Einträgen erscheint, die anderen weichen zurück),
// Rausgehen = umgekehrt. Klick (bzw. zweites Tippen) = ganz hinein (tiefe.js).
import { el } from '../../ui/dom.js';
import { art } from './arten.js';
import { oeffneTiefe } from './tiefe.js';
import { oeffneMindmap } from './overlay.js';
import { schwebeTakt } from './schweben.js';

// x/y in % der Bühne: breit (Mac) und schmal (iPhone hochkant); bewusst etwas schief. g = Größe
const PFADE = [
  { art: 'krankheitsbild', x: 28, y: 22, xs: 26, ys: 27, g: 1.08 },
  { art: 'trainingsform', x: 73, y: 29, xs: 77, ys: 33, g: 0.94 },
  { art: 'muskel', x: 33, y: 79, xs: 24, ys: 67, g: 1 },
  { art: 'uebung', x: 67, y: 72, xs: 72, ys: 75, g: 1.12 },
  { art: 'region', x: 11, y: 45, xs: 46, ys: 10, klein: true, g: 1.06 },
  { art: 'technik', x: 89, y: 58, xs: 56, ys: 91, klein: true, g: 0.92 },
];
const kannHover = () => matchMedia('(hover: hover)').matches;

export function kosmos({ signal }) {
  let drin = null; // Bubble, in der man gerade ist
  let eintraege = [];

  const kern = el('button', { class: 'kos__kern', attrs: { type: 'button', 'data-mm-start': '' } }, [
    el('span', { class: 'kos__kern-licht' }),
    el('span', { class: 'kos__kern-name', text: 'Physio' }),
    el('span', { class: 'kos__kern-text', text: 'Mindmap' }),
  ]);
  kern.addEventListener('click', () => oeffneMindmap({ ausKnopf: kern, signal }));

  const bubbles = PFADE.map((p, i) => {
    const a = art(p.art);
    const zahl = el('span', { class: 'kos__zahl', text: '0' });
    const liste = el('ul', { class: 'kos__liste' });
    const b = el('button', {
      class: `kos__bubble${p.klein ? ' kos__bubble--klein' : ''}`,
      attrs: { type: 'button', 'aria-label': a.mehrzahl },
    }, [
      el('span', { class: 'kos__schwebe' }, [
        el('span', { class: 'kos__haut' }),
        el('span', { class: 'kos__aussen' }, [zahl, el('span', { class: 'kos__name', text: a.mehrzahl })]),
        el('span', { class: 'kos__innen' }, [el('span', { class: 'kos__innen-name', text: a.mehrzahl }), liste]),
      ]),
    ]);
    const st = b.style;
    st.setProperty('--x', `${p.x}%`); st.setProperty('--y', `${p.y}%`);
    st.setProperty('--xs', `${p.xs}%`); st.setProperty('--ys', `${p.ys}%`);
    st.setProperty('--g', p.g);
    schwebeTakt(st, i);
    st.setProperty('--tiefe', p.klein ? 0.5 : 1);
    b.pfad = p; b.zahl = zahl; b.liste = liste;

    if (kannHover()) {
      b.addEventListener('mouseenter', () => rein(b));
      b.addEventListener('mouseleave', () => raus());
    }
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!kannHover() && drin !== b) return rein(b); // iPhone: erstes Tippen = eindringen
      oeffneTiefe({ art: p.art, ausBubble: b, eintraege: () => eintraege, signal });
      if (!kannHover()) raus();
    });
    return b;
  });

  const buehne = el('div', { class: 'kos' }, [
    el('span', { class: 'kos__staub' }),
    el('span', { class: 'kos__bahn kos__bahn--1' }),
    el('span', { class: 'kos__bahn kos__bahn--2' }),
    kern,
    ...bubbles,
  ]);
  buehne.addEventListener('click', () => raus()); // iPhone: daneben tippen = raus

  // Parallaxe: Maus verschiebt die Bubbles je nach Tiefe ein wenig
  buehne.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = buehne.getBoundingClientRect();
    buehne.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    buehne.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  }, { signal });

  function rein(b) {
    if (drin === b) return;
    drin?.classList.remove('kos__bubble--drin');
    drin = b;
    const m = mitte(b);
    for (const o of bubbles) {
      if (o === b) { o.style.removeProperty('--wx'); o.style.removeProperty('--wy'); continue; }
      const z = mitte(o); const dx = z.x - m.x; const dy = z.y - m.y; const l = Math.hypot(dx, dy) || 1;
      o.style.setProperty('--wx', `${(dx / l) * 28}px`); // weicht zurück
      o.style.setProperty('--wy', `${(dy / l) * 28}px`);
    }
    b.classList.remove('kos__bubble--raus');
    b.classList.add('kos__bubble--drin');
    buehne.classList.add('kos--fokus');
  }

  function raus() {
    if (!drin) return;
    const b = drin; drin = null;
    b.classList.remove('kos__bubble--drin');
    b.classList.add('kos__bubble--raus'); // Membran schließt sich hinter einem
    setTimeout(() => b.classList.remove('kos__bubble--raus'), 600);
    buehne.classList.remove('kos--fokus');
    for (const o of bubbles) { o.style.removeProperty('--wx'); o.style.removeProperty('--wy'); }
  }

  const mitte = (n) => { const r = n.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };

  return {
    element: buehne,
    daten(neu) {
      eintraege = neu;
      for (const b of bubbles) {
        const eigene = neu.filter((e) => e.art === b.pfad.art);
        b.zahl.textContent = String(eigene.length);
        const letzte = [...eigene].sort((x, y) => y.updated_at.localeCompare(x.updated_at)).slice(0, 3);
        b.liste.replaceChildren(...(letzte.length
          ? letzte.map((e) => el('li', { text: e.titel }))
          : [el('li', { class: 'kos__leer', text: 'Noch leer' })]));
      }
    },
  };
}
