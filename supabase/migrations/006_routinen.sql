-- 006_routinen.sql – Tabellen für das Modul „Routinen“.
-- Einmal im Supabase-SQL-Editor ausführen (001_basis.sql muss schon gelaufen sein).
-- Muster wie in 001_basis.sql: gemeinsame Spalten, Index, Trigger sync_felder, RLS, grant.
-- routine_id absichtlich ohne Fremdschlüssel: Geräte laden Tabellen in beliebiger Reihenfolge hoch.

-- Routinen. art: morgen, abend oder frei. sperre: für später (Phase 5), jetzt immer false.
create table public.routinen (
  id          uuid primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null,
  art         text not null default 'frei' check (art in ('morgen', 'abend', 'frei')),
  sperre      boolean not null default false,
  reihenfolge integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted     boolean not null default false,
  server_at   timestamptz not null default now()
);

-- Schritte einer Routine, in Reihenfolge.
create table public.routine_schritte (
  id          uuid primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  routine_id  uuid not null,
  text        text not null,
  reihenfolge integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted     boolean not null default false,
  server_at   timestamptz not null default now()
);

-- Stand je Routine und Tag: geschafft = Anzahl abgehakter Schritte, fertig_am = alle Schritte erledigt.
-- Legen zwei Geräte am selben Tag je einen Eintrag an, zählt der höhere Stand.
create table public.routine_logs (
  id          uuid primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  routine_id  uuid not null,
  tag         date not null,
  geschafft   integer not null default 0,
  fertig_am   timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted     boolean not null default false,
  server_at   timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['routinen', 'routine_schritte', 'routine_logs'] loop
    execute format('create index %I on public.%I (user_id, server_at)', t || '_abgleich', t);
    execute format('create trigger %I before insert or update on public.%I for each row execute function public.sync_felder()', t || '_sync', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "nur eigene Zeilen" on public.%I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
    execute format('grant select, insert, update on public.%I to authenticated', t);
  end loop;
end $$;
