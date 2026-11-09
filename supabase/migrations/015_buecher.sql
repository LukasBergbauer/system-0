-- 015_buecher.sql – Tabelle und Cover-Ordner für das Modul „Bücher“.
-- Einmal im Supabase-SQL-Editor ausführen. Muster wie 011_ziele.sql und 004_physio_bilder.sql.

-- status: will (will lesen), lese (lese gerade), gelesen.
-- cover: Dateiname im Ordner buch-cover/<user_id>/ (neuer Name bei jedem neuen Cover), null = kein Cover.
-- zusammenfassung: einfaches Markdown (#, >, -, **fett**, *kursiv*).
create table public.buecher (
  id              uuid primary key,
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titel           text not null default '',
  autor           text,
  status          text not null default 'will' check (status in ('will', 'lese', 'gelesen')),
  cover           text,
  begonnen        date,
  beendet         date,
  bewertung       smallint check (bewertung between 1 and 5),
  zusammenfassung text,
  reihenfolge     bigint not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted         boolean not null default false,
  server_at       timestamptz not null default now()
);

create index buecher_abgleich on public.buecher (user_id, server_at);
create trigger buecher_sync before insert or update on public.buecher for each row execute function public.sync_felder();
alter table public.buecher enable row level security;
create policy "nur eigene Zeilen" on public.buecher for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
grant select, insert, update on public.buecher to authenticated;

-- Cover-Ordner: privat, max. 5 MB, nur Bilder, nur der eigene Unterordner.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('buch-cover', 'buch-cover', false, 5242880, array['image/jpeg', 'image/webp', 'image/png']);

create policy "buch-cover lesen" on storage.objects for select to authenticated
  using (bucket_id = 'buch-cover' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "buch-cover hochladen" on storage.objects for insert to authenticated
  with check (bucket_id = 'buch-cover' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "buch-cover ersetzen" on storage.objects for update to authenticated
  using (bucket_id = 'buch-cover' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'buch-cover' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "buch-cover löschen" on storage.objects for delete to authenticated
  using (bucket_id = 'buch-cover' and (storage.foldername(name))[1] = (select auth.uid())::text);
