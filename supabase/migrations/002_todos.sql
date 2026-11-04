-- 002_todos.sql – Tabellen für das Modul „To-dos“.
-- Einmal im Supabase-SQL-Editor ausführen (001_basis.sql muss schon gelaufen sein).
-- Muster wie in 001_basis.sql: gemeinsame Spalten, Index, Trigger sync_felder, RLS, grant.

-- ---------------------------------------------------------------
-- Bereiche der To-dos (z. B. Praxis, Training, Privat, Insta).
-- Heißt nicht „bereiche“, damit es nicht mit den App-Bereichen der Navigation verwechselt wird.
-- ---------------------------------------------------------------
create table public.todo_bereiche (
  id          uuid primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null,
  reihenfolge integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted     boolean not null default false,
  server_at   timestamptz not null default now()
);

create index todo_bereiche_abgleich on public.todo_bereiche (user_id, server_at);

create trigger todo_bereiche_sync
  before insert or update on public.todo_bereiche
  for each row execute function public.sync_felder();

alter table public.todo_bereiche enable row level security;

create policy "nur eigene Zeilen" on public.todo_bereiche
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select, insert, update on public.todo_bereiche to authenticated;

-- ---------------------------------------------------------------
-- To-dos.
-- prio: 1 hoch, 2 mittel, 3 niedrig. faellig_am: nur Datum, optional.
-- erledigt_am: leer = offen.
-- bereich_id absichtlich ohne Fremdschlüssel: Geräte laden Tabellen in beliebiger Reihenfolge hoch,
-- ein To-do darf also kurz vor seinem Bereich ankommen. Unbekannter Bereich = „ohne Bereich“.
-- ---------------------------------------------------------------
create table public.todos (
  id          uuid primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titel       text not null,
  notiz       text not null default '',
  prio        smallint not null default 2 check (prio between 1 and 3),
  faellig_am  date,
  bereich_id  uuid,
  erledigt_am timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted     boolean not null default false,
  server_at   timestamptz not null default now()
);

create index todos_abgleich on public.todos (user_id, server_at);

create trigger todos_sync
  before insert or update on public.todos
  for each row execute function public.sync_felder();

alter table public.todos enable row level security;

create policy "nur eigene Zeilen" on public.todos
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select, insert, update on public.todos to authenticated;
