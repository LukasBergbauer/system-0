-- Insta-Agent: Zwischenablage für das automatische Posten auf Instagram.
-- Instagram holt sich das Video von einer Internet-Adresse. Der Insta-Agent (Mac) lädt das fertige Video hier hoch,
-- gibt Instagram einen Link, der nur 15 Minuten gilt, und löscht die Datei nach dem Posten wieder.
-- Privat, max. 50 MB je Datei, nur MP4. Zugriff nur auf den eigenen Unterordner (erster Pfadteil = eigene user_id).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('insta-upload', 'insta-upload', false, 52428800, array['video/mp4']);

create policy "insta-upload lesen" on storage.objects
  for select to authenticated
  using (bucket_id = 'insta-upload' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "insta-upload hochladen" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'insta-upload' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "insta-upload löschen" on storage.objects
  for delete to authenticated
  using (bucket_id = 'insta-upload' and (storage.foldername(name))[1] = (select auth.uid())::text);
