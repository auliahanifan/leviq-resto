-- 0.2 Bucket Supabase Storage untuk foto menu, publik read-only.
-- Sama seperti tabel lain di project ini, tidak ada Supabase Auth nyata --
-- app pakai anon key untuk semua akses, dan pembatasan tulis dilakukan di
-- level Next.js server action (requireSession/PIN), bukan di RLS. Policy di
-- bawah ini karena itu mengizinkan anon insert/update/delete juga, konsisten
-- dengan pola "anon full access" di migrasi-migrasi sebelumnya.
insert into storage.buckets (id, name, public)
values ('menu-photos', 'menu-photos', true);

create policy "anon read menu-photos" on storage.objects
  for select to anon
  using (bucket_id = 'menu-photos');

create policy "anon write menu-photos" on storage.objects
  for insert to anon
  with check (bucket_id = 'menu-photos');

create policy "anon update menu-photos" on storage.objects
  for update to anon
  using (bucket_id = 'menu-photos')
  with check (bucket_id = 'menu-photos');

create policy "anon delete menu-photos" on storage.objects
  for delete to anon
  using (bucket_id = 'menu-photos');
