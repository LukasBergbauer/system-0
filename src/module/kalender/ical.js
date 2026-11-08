// iCal-Datei (.ics) von Google lesen → Termine wie unsere eigenen: { id, titel, start, ende, ganztaegig, ort, google: true }.
// Nur der Teil, den eine Anzeige braucht: Titel, Beginn, Ende, Ort, Wiederholung (wiederholung.js),
// ausgelassene Tage (EXDATE), einzeln verschobene Termine (RECURRENCE-ID), abgesagte Termine (STATUS:CANCELLED).
import { wiederhole } from './wiederholung.js';
import { plusTage } from './zeit.js';

// '20261110' → ganztägig; '20261110T170000Z' → UTC; '20261110T180000' (mit TZID) → Ortszeit des Geräts.
// shortcut: TZID wird nicht umgerechnet, stimmt also nur für Termine in der Zeitzone des Geräts (Deutschland).
export function icalZeit(wert) {
  const m = wert.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z?))?$/);
  if (!m) return null;
  const [, j, mo, t, h, mi, s, utc] = m;
  if (h === undefined) return { datum: new Date(+j, mo - 1, +t), ganztaegig: true };
  const datum = utc ? new Date(Date.UTC(+j, mo - 1, +t, +h, +mi, +s)) : new Date(+j, mo - 1, +t, +h, +mi, +s);
  return { datum, ganztaegig: false };
}

const text = (w) => w.replace(/\\n/gi, ' ').replace(/\\([,;\\])/g, '$1').trim();

// .ics-Text → Liste der Ereignisse mit ihren rohen Feldern
function ereignisse(ics) {
  const zeilen = ics.replace(/\r?\n[ \t]/g, '').split(/\r?\n/);
  const liste = [];
  let ev = null;
  let tiefe = 0; // Unterblöcke im Ereignis (z. B. VALARM) überspringen
  for (const zeile of zeilen) {
    if (zeile === 'BEGIN:VEVENT') { ev = { exdate: [] }; tiefe = 0; continue; }
    if (!ev) continue;
    if (zeile === 'END:VEVENT') { liste.push(ev); ev = null; continue; }
    if (zeile.startsWith('BEGIN:')) { tiefe++; continue; }
    if (zeile.startsWith('END:')) { tiefe--; continue; }
    if (tiefe) continue;
    const m = zeile.match(/^([A-Z-]+)(?:;[^:]*)?:(.*)$/);
    if (!m) continue;
    const [, name, wert] = m;
    if (name === 'EXDATE') ev.exdate.push(...wert.split(','));
    else ev[name] = wert;
  }
  return liste;
}

// von/bis: nur Termine, die in diesen Zeitraum fallen
export function leseIcal(ics, von, bis) {
  const roh = ereignisse(ics);
  // Einzeln geänderte oder abgesagte Termine einer Serie ersetzen den ursprünglichen Termin
  const ersetzt = new Set(roh.filter((e) => e['RECURRENCE-ID'])
    .map((e) => `${e.UID}|${+icalZeit(e['RECURRENCE-ID'])?.datum}`));

  const termine = [];
  for (const e of roh) {
    if (e.STATUS === 'CANCELLED' || !e.DTSTART) continue;
    const s = icalZeit(e.DTSTART);
    if (!s) continue;
    const ende = e.DTEND ? icalZeit(e.DTEND)?.datum : null;
    const dauer = ende ? ende - s.datum : s.ganztaegig ? plusTage(s.datum, 1) - s.datum : 0;
    const auslassen = new Set(e.exdate.map((w) => +icalZeit(w)?.datum));
    const starts = e.RRULE && !e['RECURRENCE-ID']
      ? wiederhole(s.datum, e.RRULE, bis).filter((d) => !auslassen.has(+d) && !ersetzt.has(`${e.UID}|${+d}`))
      : [s.datum];
    for (const start of starts) {
      const endeHier = s.ganztaegig ? plusTage(start, Math.round(dauer / 864e5)) : new Date(+start + dauer);
      if (start >= bis || endeHier <= von) continue;
      termine.push({
        id: `google:${e.UID}:${+start}`,
        titel: text(e.SUMMARY || '(ohne Titel)'),
        start: start.toISOString(),
        ende: endeHier.toISOString(),
        ganztaegig: s.ganztaegig,
        ort: text(e.LOCATION || ''),
        google: true,
      });
    }
  }
  return termine;
}
