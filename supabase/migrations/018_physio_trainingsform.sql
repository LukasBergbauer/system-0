-- 018_physio_trainingsform.sql – PhysioZentrum: neue Art „Trainingsform“.
-- Einmal im Supabase-SQL-Editor ausführen.
alter table public.physio_eintraege drop constraint if exists physio_eintraege_art_check;
alter table public.physio_eintraege add constraint physio_eintraege_art_check
  check (art in ('uebung', 'krankheitsbild', 'trainingsform', 'muskel', 'region', 'technik'));
