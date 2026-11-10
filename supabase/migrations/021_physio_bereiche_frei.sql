-- 021_physio_bereiche_frei.sql – Bereiche (Arten) in Physio legt Lukas selbst fest (Einstellung „physio_bereiche“).
-- Die Spalte art ist deshalb nicht mehr auf feste Werte beschränkt.
alter table public.physio_eintraege drop constraint if exists physio_eintraege_art_check;
