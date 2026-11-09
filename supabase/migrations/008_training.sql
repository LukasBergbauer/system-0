-- 008_training.sql – Tabellen für das Modul „Training“.
-- Einmal im Supabase-SQL-Editor ausführen (001_basis.sql muss schon gelaufen sein).
-- Muster wie in 006_routinen.sql. Verweise (physio_id, einheit_id, uebung_id) ohne Fremdschlüssel:
-- Geräte laden Tabellen in beliebiger Reihenfolge hoch.

-- Eigene Übungsliste. physio_id gesetzt → Name und Inhalt kommen live aus physio_eintraege.
-- messung: welche Werte ein Satz hat, z. B. ["wdh","gewicht"] (wdh, gewicht, zeit, distanz).
create table public.training_uebungen (
  id          uuid primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null default '',
  physio_id   uuid,
  notiz       text not null default '',
  messung     jsonb not null default '["wdh","gewicht"]',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted     boolean not null default false,
  server_at   timestamptz not null default now()
);

-- Eine Trainingseinheit. gefuehl 1–5, belastung 1–10 (RPE), dauer in Minuten.
create table public.einheiten (
  id          uuid primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  datum       date not null,
  titel       text not null default '',
  art         text not null default 'kraft' check (art in ('kraft', 'ausdauer', 'hyrox', 'physio', 'frei')),
  gefuehl     integer check (gefuehl between 1 and 5),
  belastung   integer check (belastung between 1 and 10),
  dauer       integer,
  notiz       text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted     boolean not null default false,
  server_at   timestamptz not null default now()
);

-- Ein Satz: gehört zu Einheit und Übung. zeit in Sekunden, distanz in Metern.
create table public.saetze (
  id          uuid primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  einheit_id  uuid not null,
  uebung_id   uuid not null,
  reihenfolge bigint not null default 0,
  wdh         integer,
  gewicht     numeric,
  zeit        integer,
  distanz     numeric,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted     boolean not null default false,
  server_at   timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['training_uebungen', 'einheiten', 'saetze'] loop
    execute format('create index %I on public.%I (user_id, server_at)', t || '_abgleich', t);
    execute format('create trigger %I before insert or update on public.%I for each row execute function public.sync_felder()', t || '_sync', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "nur eigene Zeilen" on public.%I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
    execute format('grant select, insert, update on public.%I to authenticated', t);
  end loop;
end $$;
