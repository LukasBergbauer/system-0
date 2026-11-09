-- 016_insta.sql – Tabellen für das Modul „Insta-Organizer“.
-- Einmal im Supabase-SQL-Editor ausführen. Muster wie 015_buecher.sql. Keine Verbindung zu Instagram.

-- schluessel: stabiler Name aus dem Claude-Import (gleicher Schlüssel = Post wird aktualisiert).
-- art: post, karussell, reel, story. status: idee, arbeit, geplant, gepostet.
-- skript: Kurzfassung als einfaches Markdown. zahlen: { aufrufe, reichweite, likes, kommentare, gespeichert, geteilt, follower }.
create table public.insta_posts (
  id          uuid primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  schluessel  text,
  titel       text not null default '',
  art         text not null default 'reel' check (art in ('post', 'karussell', 'reel', 'story')),
  status      text not null default 'idee' check (status in ('idee', 'arbeit', 'geplant', 'gepostet')),
  datum       date,
  hook        text,
  skript      text,
  cta         text,
  caption     text,
  hashtags    text,
  zahlen      jsonb,
  notiz       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted     boolean not null default false,
  server_at   timestamptz not null default now()
);

-- Hashtag-Sets: tags als Text („#physio #training …“).
create table public.insta_hashtags (
  id          uuid primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null default '',
  tags        text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted     boolean not null default false,
  server_at   timestamptz not null default now()
);

-- Erkenntnisse „Was hat funktioniert, warum“ (Antwort des eigenen Claude-Agenten, per Import).
create table public.insta_erkenntnisse (
  id          uuid primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  text        text not null default '',
  warum       text,
  belege      text,
  datum       date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted     boolean not null default false,
  server_at   timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['insta_posts', 'insta_hashtags', 'insta_erkenntnisse'] loop
    execute format('create index %I on public.%I (user_id, server_at)', t || '_abgleich', t);
    execute format('create trigger %I before insert or update on public.%I for each row execute function public.sync_felder()', t || '_sync', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "nur eigene Zeilen" on public.%I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
    execute format('grant select, insert, update on public.%I to authenticated', t);
  end loop;
end $$;
