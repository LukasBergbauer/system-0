-- 022_physio_notizen.sql – Schnell-Notizen in Physio: bleiben im Notizen-Fenster, bis Lukas sie löscht.
-- Einmal im Supabase-SQL-Editor ausführen. Muster wie in 001_basis.sql.
create table public.physio_notizen (
  id          uuid primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  text        text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted     boolean not null default false,
  server_at   timestamptz not null default now()
);

create index physio_notizen_abgleich on public.physio_notizen (user_id, server_at);

create trigger physio_notizen_sync
  before insert or update on public.physio_notizen
  for each row execute function public.sync_felder();

alter table public.physio_notizen enable row level security;

create policy "nur eigene Zeilen" on public.physio_notizen
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select, insert, update on public.physio_notizen to authenticated;
