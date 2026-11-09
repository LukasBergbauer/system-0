// Ansicht „Wissen-Quiz“: Karte Daily, Karte Endlos (mit Themenwahl), Statistik je Thema, „Fragen importieren“.
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

    box.replaceChildren(el('div', { class: 'routinen__raster' }, [
      karte('Daily-Quiz', heute ? `Heute ${heute.richtig} von ${heute.gesamt} richtig` : `${DAILY_ANZAHL} neue Fragen für heute`, [
        heute ? raster(heute.antworten) : button({ text: 'Daily starten', variant: 'primary', onClick: daily }),
        el('p', { class: 'routine__serie', text: n ? `Serie: ${tageText(n)}` : 'Noch keine Serie' }),
      ]),
      karte('Endlos', `Runden à ${RUNDE_ANZAHL} Fragen · neue zuerst, falsche öfter`, [
        chips({ items: [{ id: null, label: 'Alle' }, ...themen.map((t) => ({ id: t, label: themaName(t) }))], active: thema, onChange: (t) => { thema = t; } }),
        button({ text: 'Runde starten', variant: 'primary', onClick: endlos }),
      ]),
      karte('Statistik', `${gesehenAlle} von ${fragen.length} Fragen gesehen`, [
        el('ul', { class: 'quiz-stat' }, stat.map((s) => el('li', {}, [
          el('span', { text: themaName(s.thema) }),
          el('small', { text: `${s.gesehen}/${s.gesamt}${s.beantwortet ? ` · ${Math.round((100 * s.richtig) / s.beantwortet)} %` : ''}` }),
          el('span', { class: 'routine__balken' }, [el('i', { attrs: { style: `width:${s.gesamt ? (100 * s.gesehen) / s.gesamt : 0}%` } })]),
        ]))),
      ]),
    ]), button({ text: 'Fragen importieren', variant: 'ghost', onClick: () => oeffneImport(fragen) }));

    if (autoDaily) { autoDaily = false; if (!heute) daily(); }
  }

  on('daten', ({ table }) => (table === FRAGEN || table === ERGEBNISSE) && zeichne(), { signal });
  zeichne();
  return box;
}
