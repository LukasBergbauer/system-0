-- 012_affirmationen.sql – Tabelle für das Modul „Affirmationen“.
-- Einmal im Supabase-SQL-Editor ausführen. Muster wie 011_ziele.sql.

-- Affirmation gehört zu einem Lebensziel; aktiv = darf auf Heute erscheinen.
create table public.affirmationen (
  id            uuid primary key,
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  lebensziel_id uuid not null,
  text          text not null,
  aktiv         boolean not null default true,
  reihenfolge   bigint not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted       boolean not null default false,
  server_at     timestamptz not null default now()
);

create index affirmationen_abgleich on public.affirmationen (user_id, server_at);
create trigger affirmationen_sync before insert or update on public.affirmationen for each row execute function public.sync_felder();
alter table public.affirmationen enable row level security;
create policy "nur eigene Zeilen" on public.affirmationen for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
grant select, insert, update on public.affirmationen to authenticated;
