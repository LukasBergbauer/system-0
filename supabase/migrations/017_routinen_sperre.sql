-- 017_routinen_sperre.sql – Routinen-Sperre: ab wann sie gilt, und „Heute aussetzen“.
-- Einmal im Supabase-SQL-Editor ausführen.

-- sperre_ab: Uhrzeit „HH:MM“, ab der die Sperre gilt (null = Vorgabe: Morgen 04:00, Abend 20:00, Frei 04:00).
alter table public.routinen add column sperre_ab text check (sperre_ab ~ '^[0-2][0-9]:[0-5][0-9]$');

-- ausgesetzt: Sperre für diesen Tag aufgehoben, ohne dass die Routine als geschafft zählt.
alter table public.routine_logs add column ausgesetzt boolean not null default false;
