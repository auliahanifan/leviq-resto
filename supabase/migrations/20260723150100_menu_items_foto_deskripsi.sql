-- 1.1 Tambah kolom foto_url dan deskripsi ke menu_items, keduanya opsional
-- agar item lama/baru tanpa foto/deskripsi tetap valid -- FR-SO6.1-6.3
alter table public.menu_items
  add column foto_url text,
  add column deskripsi text;
