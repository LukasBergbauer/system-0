-- 003_physio.sql – Tabellen für das PhysioZentrum.
-- Einmal im Supabase-SQL-Editor ausführen (001_basis.sql muss schon gelaufen sein).
-- Muster wie in 001_basis.sql: gemeinsame Spalten, Index, Trigger sync_felder, RLS, grant.
-- Nur allgemeines Fachwissen, keine Patientendaten.

-- ---------------------------------------------------------------
-- Einträge: alle Punkte der Mindmap in einer Tabelle.
-- art: uebung, krankheitsbild, muskel, region, technik (weitere Arten später ohne neue Tabelle).
-- kurz: ein Satz, erscheint in der Mindmap als Vorschau.
-- felder: optionale Felder je Art als JSON, z. B. {"dosierung": "3 × 10"}.
--   Übung: ausgangsstellung, durchfuehrung, dosierung, fehler
--   Krankheitsbild: ursache, symptome, tests, behandlung
--   Muskel: ursprung, ansatz, funktion, innervation
--   Technik: ziel, durchfuehrung, kontraindikationen
-- ---------------------------------------------------------------
create table public.physio_eintraege (
  id          uuid primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  art         text not null check (art in ('uebung', 'krankheitsbild', 'muskel', 'region', 'technik')),
  titel       text not null,
  kurz        text not null default '',
  text        text not null default '',
  felder      jsonb not null default '{}'::jsonb,
  video       text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted     boolean not null default false,
  server_at   timestamptz not null default now()
);

create index physio_eintraege_abgleich on public.physio_eintraege (user_id, server_at);

create trigger physio_eintraege_sync
  before insert or update on public.physio_eintraege
  for each row execute function public.sync_felder();

alter table public.physio_eintraege enable row level security;

create policy "nur eigene Zeilen" on public.physio_eintraege
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select, insert, update on public.physio_eintraege to authenticated;

-- ---------------------------------------------------------------
-- Verknüpfungen: die Linien der Mindmap. Gelten in beide Richtungen
-- (a → b ist dasselbe wie b → a; doppelte verhindert die App).
-- a_id/b_id absichtlich ohne Fremdschlüssel (wie bei den To-dos): Geräte laden Tabellen
-- in beliebiger Reihenfolge hoch. Verknüpfung zu gelöschtem Eintrag wird nicht angezeigt.
-- ---------------------------------------------------------------
create table public.physio_links (
  id          uuid primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  a_id        uuid not null,
  b_id        uuid not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted     boolean not null default false,
  server_at   timestamptz not null default now()
);

create index physio_links_abgleich on public.physio_links (user_id, server_at);

create trigger physio_links_sync
  before insert or update on public.physio_links
  for each row execute function public.sync_felder();

alter table public.physio_links enable row level security;

create policy "nur eigene Zeilen" on public.physio_links
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select, insert, update on public.physio_links to authenticated;
