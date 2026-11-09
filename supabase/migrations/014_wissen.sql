-- 014_wissen.sql – Tabellen für das Modul „Wissen-Quiz“.
-- Einmal im Supabase-SQL-Editor ausführen. Muster wie 013_gewohnheiten.sql.
-- Der Grundstock an Fragen liegt im Repo (src/module/wissen/fragen/*.json); hier nur importierte Fragen und Ergebnisse.

-- Importierte Fragen. antworten: 4 Texte, die erste ist die richtige (wird beim Anzeigen gemischt).
create table public.quiz_fragen (
  id          uuid primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  thema       text not null,
  frage       text not null,
  antworten   jsonb not null,
  erklaerung  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted     boolean not null default false,
  server_at   timestamptz not null default now()
);

-- Eine Runde. modus: daily oder endlos. antworten: [{ id, ok }] (Frage-ID, richtig ja/nein).
create table public.quiz_ergebnisse (
  id          uuid primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tag         date not null,
  modus       text not null default 'endlos' check (modus in ('daily', 'endlos')),
  richtig     integer not null default 0,
  gesamt      integer not null default 0,
  antworten   jsonb not null default '[]',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted     boolean not null default false,
  server_at   timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['quiz_fragen', 'quiz_ergebnisse'] loop
    execute format('create index %I on public.%I (user_id, server_at)', t || '_abgleich', t);
    execute format('create trigger %I before insert or update on public.%I for each row execute function public.sync_felder()', t || '_sync', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "nur eigene Zeilen" on public.%I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
    execute format('grant select, insert, update on public.%I to authenticated', t);
  end loop;
end $$;
