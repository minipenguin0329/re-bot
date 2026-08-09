drop policy if exists wellness_images_insert_own on storage.objects;
drop policy if exists wellness_images_select_own on storage.objects;
drop policy if exists wellness_images_delete_own on storage.objects;

create policy wellness_images_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'wellness-images'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy wellness_images_select_own on storage.objects
  for select to authenticated
  using (
    bucket_id = 'wellness-images'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy wellness_images_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'wellness-images'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
