// Supabase-Funktion „erinnerungen“: schickt fällige Erinnerungen als Mitteilung (Web Push) aufs iPhone/den Mac.
// Läuft jede Minute über pg_cron (Migration 020). Die App legt die Erinnerungen vorher in der Tabelle „erinnerungen“ an.
// GET  → öffentlicher VAPID-Schlüssel (für das Abonnieren in der App)
// POST → fällige Erinnerungen holen (atomar als gesendet markiert) und an alle Geräte schicken.
// Keine Geheimnisse im Code: VAPID_KEYS (JSON aus tools/vapid.html) und VAPID_KONTAKT als Secrets im Dashboard.
// SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY stellt Supabase selbst bereit.
// Anlegen: Dashboard → Edge Functions → „erinnerungen“ → diesen Text einfügen → „Verify JWT“ AUS → Deploy.
// (Ohne Login aufrufbar ist unkritisch: es wird nur verschickt, was ohnehin fällig ist, und jede Erinnerung nur einmal.)
import * as webpush from 'jsr:@negrel/webpush@0.5.0';
import { createClient } from 'npm:@supabase/supabase-js@2.117.3';

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const json = (daten: unknown, status = 200) =>
  new Response(JSON.stringify(daten), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const vapidKeys = await webpush.importVapidKeys(JSON.parse(Deno.env.get('VAPID_KEYS')!), { extractable: true });
const server = await webpush.ApplicationServer.new({
  contactInformation: Deno.env.get('VAPID_KONTAKT') || 'mailto:lukas@example.com',
  vapidKeys,
});
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return json('ok');
  if (req.method === 'GET') return json({ publicKey: await webpush.exportApplicationServerKey(vapidKeys) });
  try {
    const { data: faellig, error } = await db.rpc('erinnerungen_faellig');
    if (error) throw error;
    if (!faellig?.length) return json({ gesendet: 0 });
    const nutzer = [...new Set(faellig.map((e: { user_id: string }) => e.user_id))];
    const { data: abos, error: fehler2 } = await db.from('push_abos').select('*').in('user_id', nutzer).eq('deleted', false);
    if (fehler2) throw fehler2;
    let gesendet = 0;
    for (const e of faellig) {
      const nachricht = JSON.stringify({ titel: e.titel, text: e.text || '', ziel: e.ziel || '#/heute', id: e.id });
      for (const abo of abos.filter((a) => a.user_id === e.user_id)) {
        try {
          await server.subscribe({ endpoint: abo.endpoint, keys: { p256dh: abo.p256dh, auth: abo.auth } })
            .pushTextMessage(nachricht, { ttl: 3600, urgency: webpush.Urgency.High, topic: String(e.id).replace(/-/g, '').slice(0, 32) });
          gesendet++;
        } catch (err) {
          const status = err instanceof webpush.PushMessageError ? err.response.status : 0;
          if (status === 404 || status === 410) { // Gerät hat das Abo beendet → weich löschen
            await db.from('push_abos').update({ deleted: true, updated_at: new Date().toISOString() }).eq('id', abo.id);
          } else console.warn('Push fehlgeschlagen', status, String(err));
        }
      }
    }
    return json({ gesendet });
  } catch (fehler) {
    return json({ fehler: String(fehler) }, 500);
  }
});
