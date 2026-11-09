-- 007_routinen_reihenfolge.sql – reihenfolge bei neuen Routinen ist ein Zeitstempel (ms), passt nicht in integer.
alter table public.routinen alter column reihenfolge type bigint;
