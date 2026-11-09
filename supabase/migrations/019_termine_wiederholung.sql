-- 019_termine_wiederholung.sql – Kalender: Wiederholung eigener Termine als RRULE-Text
-- (z. B. 'FREQ=WEEKLY' oder 'FREQ=MONTHLY;UNTIL=20271231'). Leer = einmalig.
-- Einmal im Supabase-SQL-Editor ausführen.
alter table public.termine add column if not exists wiederholung text;
