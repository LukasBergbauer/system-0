-- 005_kalender.sql – Tabelle für das Modul „Kalender“ (persönlich).
-- Einmal im Supabase-SQL-Editor ausführen (001_basis.sql muss schon gelaufen sein).
-- Muster wie in 001_basis.sql: gemeinsame Spalten, Index, Trigger sync_felder, RLS, grant.
-- Google-Termine werden NICHT hier gespeichert, nur angezeigt (Adresse liegt in `einstellungen`).

-- ---------------------------------------------------------------
-- Eigene Termine.
-- start/ende: Zeitpunkt mit Zeitzone. Ganztägig: start = 0:00 Uhr des ersten Tags (Ortszeit),
-- ende = 0:00 Uhr des Tags nach dem letzten Tag (wie bei iCal), Uhrzeit wird dann nicht angezeigt.
-- ende ist Pflicht und nie vor start (Schnelleingabe ohne Ende → 1 Stunde).
-- ---------------------------------------------------------------
create table public.termine (
  id          uuid primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titel       text not null,
  start       timestamptz not null,
  ende        timestamptz not null,
  ganztaegig  boolean not null default false,
  ort         text not null default '',
  notiz       text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted     boolean not null default false,
  server_at   timestamptz not null default now(),
  check (ende >= start)
);

create index termine_abgleich on public.termine (user_id, server_at);

create trigger termine_sync
  before insert or update on public.termine
  for each row execute function public.sync_felder();

alter table public.termine enable row level security;

create policy "nur eigene Zeilen" on public.termine
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select, insert, update on public.termine to authenticated;
