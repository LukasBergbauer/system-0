-- 024_buch_notizen.sql – Lesefortschritt (Seite/Seiten) und Notizen je Buch (Zusammenfassung oder Absatz mit Seitenzahl).
-- Einmal im Supabase-SQL-Editor ausführen.
alter table public.buecher add column seite integer check (seite >= 0), add column seiten integer check (seiten > 0);

-- art: zusammenfassung (eigene Worte) oder absatz (Lieblingsstelle, auf Heute wählbar).
create table public.buch_notizen (
  id          uuid primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  buch_id     uuid not null references public.buecher (id) on delete cascade,
  art         text not null default 'zusammenfassung' check (art in ('zusammenfassung', 'absatz')),
  seite       integer check (seite >= 0),
  text        text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted     boolean not null default false,
  server_at   timestamptz not null default now()
);

create index buch_notizen_abgleich on public.buch_notizen (user_id, server_at);
create trigger buch_notizen_sync before insert or update on public.buch_notizen for each row execute function public.sync_felder();
alter table public.buch_notizen enable row level security;
create policy "nur eigene Zeilen" on public.buch_notizen for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
grant select, insert, update on public.buch_notizen to authenticated;
