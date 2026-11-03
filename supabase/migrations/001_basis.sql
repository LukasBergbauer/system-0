-- 001_basis.sql – Grundlage für den Abgleich (Sync) und erste Tabelle „einstellungen“.
-- Einmal im Supabase-SQL-Editor ausführen.

-- ---------------------------------------------------------------
-- Hilfsfunktion für jede Tabelle (als Trigger):
-- * server_at = Zeitpunkt, an dem der Server die Zeile bekommen hat.
--   Danach fragen die Geräte „was ist neu seit …?“ (Server-Uhr, keine Uhren-Probleme).
-- * Konflikt: Ist die ankommende Änderung älter (updated_at) als die gespeicherte,
--   wird sie ignoriert. Neuester updated_at gewinnt.
-- * user_id und created_at bleiben bei Änderungen unverändert.
-- ---------------------------------------------------------------
create or replace function public.sync_felder()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    if new.updated_at < old.updated_at then
      return null; -- ältere Änderung: nicht übernehmen
    end if;
    new.user_id := old.user_id;
    new.created_at := old.created_at;
  end if;
  new.server_at := clock_timestamp();
  return new;
end;
$$;

-- ---------------------------------------------------------------
-- Tabelle einstellungen (Schlüssel/Wert)
-- ---------------------------------------------------------------
create table public.einstellungen (
  id          uuid primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  schluessel  text not null,
  wert        jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted     boolean not null default false,
  server_at   timestamptz not null default now()
);

create index einstellungen_abgleich on public.einstellungen (user_id, server_at);

create trigger einstellungen_sync
  before insert or update on public.einstellungen
  for each row execute function public.sync_felder();

-- Row Level Security: nur eigene Zeilen sehen und ändern.
alter table public.einstellungen enable row level security;

create policy "nur eigene Zeilen" on public.einstellungen
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Zugriff über die App (gelöscht wird nur weich, daher kein delete).
grant select, insert, update on public.einstellungen to authenticated;
