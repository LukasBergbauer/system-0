-- 023_physio_link_notiz.sql – kurze Notiz an einer Verknüpfung (z. B. „häufigste Ursache“), steht klein auf dem Faden.
-- Einmal im Supabase-SQL-Editor ausführen.
alter table public.physio_links add column notiz text not null default '';
