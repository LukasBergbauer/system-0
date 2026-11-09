-- 013_gewohnheiten.sql – Tabellen für das Modul „Gewohnheiten“.
-- Einmal im Supabase-SQL-Editor ausführen. Muster wie 006_routinen.sql; gewohnheit_id ohne Fremdschlüssel.

-- art: auf (aufbauen) oder ab (abbauen). messart: haken, anzahl, zeit (Minuten). ziel: Tagesziel (haken = 1).
-- seit: ab wann gezählt wird (Abbauen: „Tage ohne“ ab hier).
create table public.gewohnheiten (
  id          uuid primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null,
  art         text not null default 'auf' check (art in ('auf', 'ab')),
  messart     text not null default 'haken' check (messart in ('haken', 'anzahl', 'zeit')),
  ziel        integer not null default 1,
  seit        date not null default current_date,
  reihenfolge bigint not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted     boolean not null default false,
  server_at   timestamptz not null default now()
);

-- Wert je Gewohnheit und Tag (Aufbauen). Zwei Einträge am selben Tag (zwei Geräte) → der höhere zählt.
create table public.gewohnheit_logs (
  id            uuid primary key,
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  gewohnheit_id uuid not null,
  tag           date not null,
  wert          integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted       boolean not null default false,
  server_at     timestamptz not null default now()
);

-- Rückfälle (Abbauen): Tag, angetippte Auslöser, optionale kurze Notiz.
create table public.rueckfaelle (
  id            uuid primary key,
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  gewohnheit_id uuid not null,
  tag           date not null,
  ausloeser     jsonb not null default '[]',
  notiz         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted       boolean not null default false,
  server_at     timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['gewohnheiten', 'gewohnheit_logs', 'rueckfaelle'] loop
    execute format('create index %I on public.%I (user_id, server_at)', t || '_abgleich', t);
    execute format('create trigger %I before insert or update on public.%I for each row execute function public.sync_felder()', t || '_sync', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "nur eigene Zeilen" on public.%I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
    execute format('grant select, insert, update on public.%I to authenticated', t);
  end loop;
end $$;
