-- 004_physio_bilder.sql – Bilder für Punkte im PhysioZentrum.
-- Einmal im Supabase-SQL-Editor ausführen (001 und 003 müssen schon gelaufen sein).
-- Nur eigene Übungsfotos/Skizzen, keine Fotos von Patient:innen (Regel 3 in CLAUDE.md).
--
-- Zwei Teile:
-- 1) Tabelle physio_bilder: welche Bilder zu welchem Punkt gehören (wird wie alle Tabellen abgeglichen).
-- 2) Speicher-Ordner (Storage-Bucket) „physio-bilder“ für die Dateien selbst, privat.
--    Jede Datei liegt unter <user_id>/<bild_id>.jpg (groß) und <user_id>/<bild_id>-klein.jpg (für den Ball).

-- ---------------------------------------------------------------
-- 1) Tabelle
-- eintrag_id absichtlich ohne Fremdschlüssel (wie bei den Verknüpfungen): Reihenfolge beim Hochladen ist beliebig.
-- reihenfolge: kleinste Zahl = Titelbild (das Bild im Ball).
-- breite/hoehe: Maße des großen Bilds, damit die Galerie schon vor dem Laden Platz reservieren kann.
-- ---------------------------------------------------------------
create table public.physio_bilder (
  id          uuid primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  eintrag_id  uuid not null,
  reihenfolge integer not null default 0,
  breite      integer not null default 0,
  hoehe       integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted     boolean not null default false,
  server_at   timestamptz not null default now()
);

create index physio_bilder_abgleich on public.physio_bilder (user_id, server_at);

create trigger physio_bilder_sync
  before insert or update on public.physio_bilder
  for each row execute function public.sync_felder();

alter table public.physio_bilder enable row level security;

create policy "nur eigene Zeilen" on public.physio_bilder
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select, insert, update on public.physio_bilder to authenticated;

-- ---------------------------------------------------------------
-- 2) Speicher-Ordner für die Dateien: privat, max. 5 MB je Datei, nur Bilder.
-- Zugriff nur auf den eigenen Unterordner (erster Pfadteil = eigene user_id).
-- ---------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('physio-bilder', 'physio-bilder', false, 5242880, array['image/jpeg', 'image/webp', 'image/png']);

create policy "physio-bilder lesen" on storage.objects
  for select to authenticated
  using (bucket_id = 'physio-bilder' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "physio-bilder hochladen" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'physio-bilder' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "physio-bilder ersetzen" on storage.objects
  for update to authenticated
  using (bucket_id = 'physio-bilder' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'physio-bilder' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "physio-bilder löschen" on storage.objects
  for delete to authenticated
  using (bucket_id = 'physio-bilder' and (storage.foldername(name))[1] = (select auth.uid())::text);
