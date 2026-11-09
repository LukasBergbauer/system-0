-- 020_erinnerungen.sql – Mitteilungen (Web Push) für Termine und Routinen.
-- Einmal im Supabase-SQL-Editor ausführen. Vorher die Edge Function „erinnerungen“ anlegen (siehe dort).
-- push_abos: ein Eintrag je Gerät, das Mitteilungen bekommt.
-- erinnerungen: plant die App (nächste 14 Tage); die Funktion schickt fällige und setzt gesendet_am.

create table public.push_abos (
  id          uuid primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  endpoint    text not null,
  p256dh      text not null,
  auth        text not null,
  geraet      text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted     boolean not null default false,
  server_at   timestamptz not null default now()
);

create table public.erinnerungen (
  id           uuid primary key,
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  zeit         timestamptz not null,
  titel        text not null,
  text         text,
  ziel         text,
  gesendet_am  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted      boolean not null default false,
  server_at    timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['push_abos', 'erinnerungen'] loop
    execute format('create index %I on public.%I (user_id, server_at)', t || '_abgleich', t);
    execute format('create trigger %I before insert or update on public.%I for each row execute function public.sync_felder()', t || '_sync', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "nur eigene Zeilen" on public.%I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
    execute format('grant select, insert, update on public.%I to authenticated', t);
  end loop;
end $$;

create index erinnerungen_offen on public.erinnerungen (zeit) where gesendet_am is null and not deleted;

-- Fällige Erinnerungen (höchstens 30 Min. verspätet) holen und im selben Schritt als gesendet markieren.
-- skip locked: zwei gleichzeitige Aufrufe schicken nichts doppelt. Nur für die Funktion (service_role).
create or replace function public.erinnerungen_faellig()
returns setof public.erinnerungen
language sql
security definer
set search_path = ''
as $$
  update public.erinnerungen e
     set gesendet_am = now(), updated_at = now()
   where e.id in (
     select id from public.erinnerungen
      where gesendet_am is null and not deleted
        and zeit <= now() and zeit > now() - interval '30 minutes'
      for update skip locked)
  returning e.*;
$$;
revoke execute on function public.erinnerungen_faellig() from public, anon, authenticated;
grant execute on function public.erinnerungen_faellig() to service_role;

-- Jede Minute die Funktion anstoßen (pg_cron + pg_net, beide im Gratis-Tarif).
create extension if not exists pg_cron;
create extension if not exists pg_net;
select cron.schedule(
  'erinnerungen-senden',
  '* * * * *',
  $$ select net.http_post(
       url := 'https://mpxccuxlzxxzycouaeji.supabase.co/functions/v1/erinnerungen',
       headers := '{"Content-Type": "application/json"}'::jsonb,
       body := '{}'::jsonb) $$
);
