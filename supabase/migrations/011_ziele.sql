-- 011_ziele.sql – Tabellen für das Modul „Lebensziele“.
-- Einmal im Supabase-SQL-Editor ausführen. Muster wie 006_routinen.sql (ohne Fremdschlüssel, reihenfolge = bigint).

-- Bereiche (Ordner) mit Vision.
create table public.ziel_bereiche (
  id          uuid primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null,
  vision      text,
  reihenfolge bigint not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted     boolean not null default false,
  server_at   timestamptz not null default now()
);

-- Ziele. status: aktiv, erreicht oder pausiert.
create table public.lebensziele (
  id          uuid primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  bereich_id  uuid,
  titel       text not null,
  warum       text,
  zieldatum   date,
  status      text not null default 'aktiv' check (status in ('aktiv', 'erreicht', 'pausiert')),
  reihenfolge bigint not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted     boolean not null default false,
  server_at   timestamptz not null default now()
);

-- Schritte eines Ziels; erledigt_am gesetzt = abgehakt.
create table public.ziel_schritte (
  id          uuid primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  ziel_id     uuid not null,
  text        text not null,
  erledigt_am timestamptz,
  reihenfolge bigint not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted     boolean not null default false,
  server_at   timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['ziel_bereiche', 'lebensziele', 'ziel_schritte'] loop
    execute format('create index %I on public.%I (user_id, server_at)', t || '_abgleich', t);
    execute format('create trigger %I before insert or update on public.%I for each row execute function public.sync_felder()', t || '_sync', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "nur eigene Zeilen" on public.%I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
    execute format('grant select, insert, update on public.%I to authenticated', t);
  end loop;
end $$;
