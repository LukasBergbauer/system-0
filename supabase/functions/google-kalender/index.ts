// Supabase-Funktion „google-kalender“: holt Lukas' geheime iCal-Adresse von Google und gibt sie an System 0 weiter.
// Nötig, weil Google Browsern den direkten Abruf verbietet (kein CORS-Kopf). Speichert nichts.
// Nur mit gültigem Login (JWT-Prüfung der Funktion eingeschaltet lassen) und nur für calendar.google.com.
// Anlegen: Supabase-Dashboard → Edge Functions → neue Funktion „google-kalender“ → diesen Text einfügen → Deploy.

const ERLAUBT = 'https://calendar.google.com/calendar/ical/';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const antwort = (text: string, status = 200, typ = 'text/plain; charset=utf-8') =>
  new Response(text, { status, headers: { ...CORS, 'Content-Type': typ } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return antwort('ok');
  try {
    const { adresse } = await req.json();
    if (typeof adresse !== 'string' || !adresse.startsWith(ERLAUBT)) {
      return antwort('Das ist keine iCal-Adresse von Google Kalender.', 400);
    }
    const google = await fetch(adresse);
    if (!google.ok) return antwort(`Google antwortet mit Fehler ${google.status}.`, 502);
    return antwort(await google.text(), 200, 'text/calendar; charset=utf-8');
  } catch (fehler) {
    return antwort(`Fehler in der Funktion: ${fehler}`, 500);
  }
});
