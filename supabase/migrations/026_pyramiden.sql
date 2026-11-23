-- 026_pyramiden.sql – Tabelle für das Modul „Pyramide“ (Prioritäten-Erinnerung).
-- Einmal im Supabase-SQL-Editor ausführen. Muster wie 015_buecher.sql.

-- art: dauerhaft (die große) oder tag (kleine Pyramide für einen Tag, Datum in tag).
-- ebenen: ein Begriff je Ebene, Index 0 = unten (Fundament), letzter = Spitze.
create table public.pyramiden (
  id          uuid primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titel       text not null default '',
  art         text not null default 'tag' check (art in ('dauerhaft', 'tag')),
  tag         date,
  ebenen      text[] not null default '{}',
  reihenfolge bigint not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted     boolean not null default false,
  server_at   timestamptz not null default now()
);

create index pyramiden_abgleich on public.pyramiden (user_id, server_at);
create trigger pyramiden_sync before insert or update on public.pyramiden for each row execute function public.sync_felder();
alter table public.pyramiden enable row level security;
create policy "nur eigene Zeilen" on public.pyramiden for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
grant select, insert, update on public.pyramiden to authenticated;
