// Ansicht „Wissen-Quiz“: Daily-Box mittig (Text + großer Start), darunter Endlos als schmaler Balken mit allen Themen,
// Statistik je Thema über die volle Breite, „Fragen importieren“.
// '#/quiz/daily' (von Heute) startet das Daily direkt, wenn es noch offen ist.
import { el } from '../../ui/dom.js';
import { button } from '../../ui/button.js';
import { chips } from '../../ui/chips.js';
import { on } from '../../core/events.js';
import { zusatzNehmen } from '../../core/router.js';
import { FRAGEN, ERGEBNISSE, DAILY_ANZAHL, RUNDE_ANZAHL, ladeAlles, themenVon, themaName, dailyFragen, endlosFragen, dailyHeute, serie, statistik, speichereErgebnis } from './data.js';
import { starteRunde, raster } from './runde.js';
import { oeffneImport } from './import.js';

const karte = (titel, unter, inhalt) => el('article', { class: 'routine quiz-karte' }, [
  el('div', {}, [el('h2', { class: 'routine__name', text: titel }), unter && el('p', { class: 'routine__stand', text: unter })]),
  ...inhalt,
]);
const tageText = (n) => `${n} ${n === 1 ? 'Tag' : 'Tage'}`;

export function quizAnsicht({ signal }) {
  const box = el('div', { class: 'routinen quiz' });
  let stand = 0;
  let thema = null; // Endlos: null = alle Themen
  let autoDaily = zusatzNehmen() === 'daily';

  async function zeichne() {
    const nr = ++stand;
    let d;
    try { d = await ladeAlles(); } catch {
      box.replaceChildren(el('p', { class: 'app__note app__note--warn', text: 'Fragen konnten nicht geladen werden.' }));
      return;
    }
    if (nr !== stand || signal.aborted) return;
    const { fragen, ergebnisse } = d;
    const heute = dailyHeute(ergebnisse);
    const n = serie(ergebnisse);

    const daily = () => starteRunde({
      titel: 'Daily-Quiz', fragen: dailyFragen(fragen, ergebnisse), signal,
      unterzeile: `Serie: ${tageText(n + 1)}`,
      onFertig: (a) => speichereErgebnis('daily', a),
    });
    // Immer frisch laden: die gerade gespeicherte Runde zählt bei „Neue Runde“ schon als gesehen.
    const endlos = async () => {
      const x = await ladeAlles();
      starteRunde({ titel: thema ? themaName(thema) : 'Endlos', fragen: endlosFragen(x.fragen, x.ergebnisse, thema), teilweise: true, signal,
        onFertig: (a) => speichereErgebnis('endlos', a), nochmal: () => setTimeout(endlos, 50) });
    };

    const themen = themenVon(fragen);
    const stat = statistik(fragen, ergebnisse);
    const gesehenAlle = stat.reduce((s, x) => s + x.gesehen, 0);

    const themenChips = chips({ items: [{ id: null, label: 'Alle' }, ...themen.map((t) => ({ id: t, label: themaName(t) }))], active: thema, onChange: (t) => { thema = t; } });
    themenChips.classList.add('chips--umbruch');

    box.replaceChildren(
      el('article', { class: 'routine quiz-daily' }, [
        el('span', { class: 'label', text: heute ? 'Heute geschafft' : 'Jeden Tag neu' }),
        el('h2', { class: 'quiz-daily__titel', text: 'Daily-Quiz' }),
        el('p', { class: 'quiz-daily__text', text: heute
          ? `${heute.richtig} von ${heute.gesamt} richtig. Morgen warten ${DAILY_ANZAHL} neue Fragen auf dich.`
          : `${DAILY_ANZAHL} neue Fragen, jede aus einem anderen Thema – jeden Tag andere. Nach jeder Antwort gibt es eine kurze Erklärung. Dauert etwa zwei Minuten und hält deine Serie am Laufen.` }),
        heute ? raster(heute.antworten) : button({ text: 'Daily starten', variant: 'primary', onClick: daily }),
        el('p', { class: 'routine__serie', text: n ? `Serie: ${tageText(n)}` : 'Noch keine Serie – heute anfangen' }),
      ]),
      el('article', { class: 'routine quiz-endlos' }, [
        el('div', { class: 'quiz-endlos__kopf' }, [
          el('div', {}, [el('h2', { class: 'routine__name', text: 'Endlos' }),
            el('p', { class: 'routine__stand', text: `Runden à ${RUNDE_ANZAHL} Fragen · neue zuerst, falsche öfter` })]),
          button({ text: 'Runde starten', variant: 'primary', onClick: endlos }),
        ]),
        themenChips,
      ]),
      karte('Statistik', `${gesehenAlle} von ${fragen.length} Fragen gesehen`, [
        el('ul', { class: 'quiz-stat' }, stat.map((s) => el('li', {}, [
          el('span', { text: themaName(s.thema) }),
          el('small', { text: `${s.gesehen}/${s.gesamt}${s.beantwortet ? ` · ${Math.round((100 * s.richtig) / s.beantwortet)} %` : ''}` }),
          el('span', { class: 'routine__balken' }, [el('i', { attrs: { style: `width:${s.gesamt ? (100 * s.gesehen) / s.gesamt : 0}%` } })]),
        ]))),
      ]),
      button({ text: 'Fragen importieren', variant: 'ghost', onClick: () => oeffneImport(fragen) }),
    );

    if (autoDaily) { autoDaily = false; if (!heute) daily(); }
  }

  on('daten', ({ table }) => (table === FRAGEN || table === ERGEBNISSE) && zeichne(), { signal });
  zeichne();
  return box;
}
