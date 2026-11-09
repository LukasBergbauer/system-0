-- 010_training_rir.sql – RIR (Reps in Reserve, 1–4) je Satz. Einmal im Supabase-SQL-Editor ausführen.
alter table public.saetze add column rir integer check (rir between 1 and 4);
