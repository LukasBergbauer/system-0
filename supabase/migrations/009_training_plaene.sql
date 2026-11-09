-- 009_training_plaene.sql – Wochenpläne für das Modul „Training“.
-- Einmal im Supabase-SQL-Editor ausführen (008_training.sql muss schon gelaufen sein).

-- Ein Plan wiederholt sich jede Woche. Nur einer ist aktiv.
create table public.trainingsplaene (
  id          uuid primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null default '',
  aktiv       boolean not null default false,
  notiz       text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted     boolean not null default false,
  server_at   timestamptz not null default now()
);

-- Geplante Einheit an einem Wochentag (1 = Mo … 7 = So).
-- uebungen: [{ "uebung_id": "…", "saetze": 3, "wdh": 10, "gewicht": 20, "zeit": null, "distanz": null }]
create table public.plan_einheiten (
  id          uuid primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  plan_id     uuid not null,
  wochentag   integer not null check (wochentag between 1 and 7),
  titel       text not null default '',
  art         text not null default 'kraft' check (art in ('kraft', 'ausdauer', 'hyrox', 'physio', 'frei')),
  uebungen    jsonb not null default '[]',
  reihenfolge bigint not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted     boolean not null default false,
  server_at   timestamptz not null default now()
);

-- Einheit merkt sich, aus welcher Plan-Einheit sie gestartet wurde.
alter table public.einheiten add column plan_einheit_id uuid;

do $$
declare t text;
begin
  foreach t in array array['trainingsplaene', 'plan_einheiten'] loop
    execute format('create index %I on public.%I (user_id, server_at)', t || '_abgleich', t);
    execute format('create trigger %I before insert or update on public.%I for each row execute function public.sync_felder()', t || '_sync', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "nur eigene Zeilen" on public.%I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
    execute format('grant select, insert, update on public.%I to authenticated', t);
  end loop;
end $$;
