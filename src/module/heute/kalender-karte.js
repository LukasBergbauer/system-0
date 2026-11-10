// Heute: Kalender-Karte – großes Tagesdatum, Wochenleiste Mo–So, bis zu 3 Termine des gewählten Tags.
// Tag antippen = Termine dieses Tags (nur in der Karte, nichts wird gespeichert). Heute: nächster Termin „Als Nächstes“.
import { el, append } from '../../ui/dom.js';
import { go } from '../../core/router.js';
import { amTag, plusTage, tagISO } from './rechnen.js';

const WOCHENTAG = new Intl.DateTimeFormat('de-DE', { weekday: 'long' });
const MONAT = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' });
const UHR = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });
const MAX = 3;

function terminZeile(t, naechster) {
  return el('button', { class: 'heute-termin', attrs: { type: 'button' }, on: { click: () => go('kalender') } }, [
    el('time', { text: t.ganztaegig ? 'ganzt.' : UHR.format(new Date(t.start)) }),
    el('span', { class: 'heute-termin__strich' }),
    el('span', { class: 'heute-termin__text' }, [el('b', { text: t.titel || 'Termin' }), t.ort && el('small', { text: t.ort })]),
    naechster && el('em', { text: 'Als Nächstes' }),
  ]);
}

export function kalenderKarte(termine, jetzt = new Date()) {
  const heute = plusTage(jetzt, 0);
  const montag = plusTage(heute, -((heute.getDay() + 6) % 7));
  const karte = el('article', { class: 'heute-karte heute-kal' });

  function zeige(tag) {
    const amTagListe = termine.filter((t) => amTag(t, tag))
      .sort((a, b) => !!b.ganztaegig - !!a.ganztaegig || Date.parse(a.start) - Date.parse(b.start));
    const istHeute = +tag === +heute;
    const naechster = istHeute ? amTagListe.find((t) => !t.ganztaegig && Date.parse(t.ende || t.start) > +jetzt) : null;
    const n = amTagListe.length;
    karte.replaceChildren(
      el('div', { class: 'heute-kal__datum' }, [
        el('b', { text: String(tag.getDate()).padStart(2, '0') }),
        el('div', {}, [
          el('strong', { text: WOCHENTAG.format(tag) }),
          el('small', { text: `${MONAT.format(tag)} · ${n === 1 ? '1 Termin' : `${n} Termine`}` }),
        ]),
      ]),
      el('div', { class: 'heute-kal__woche' }, [0, 1, 2, 3, 4, 5, 6].map((i) => {
        const d = plusTage(montag, i);
        const klasse = `heute-kal__tag${+d === +heute ? ' heute-kal__tag--heute' : ''}${+d === +tag ? ' heute-kal__tag--an' : ''}`;
        return el('button', { class: klasse, attrs: { type: 'button', 'aria-label': tagISO(d) }, on: { click: () => zeige(d) } },
          [el('small', { text: 'MDMDFSS'[i] }), String(d.getDate())]);
      })),
    );
    append(karte, [
      n ? amTagListe.slice(0, MAX).map((t) => terminZeile(t, t === naechster))
        : el('p', { class: 'heute-leer', text: istHeute ? 'Heute keine Termine.' : 'Keine Termine an diesem Tag.' }),
      n > MAX && el('button', { class: 'heute-mehr', text: `+ ${n - MAX} weitere`, attrs: { type: 'button' }, on: { click: () => go('kalender') } }),
    ]);
  }

  zeige(heute);
  return karte;
}
