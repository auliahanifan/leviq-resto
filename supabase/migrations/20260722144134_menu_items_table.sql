-- 1.3 Tabel menu_items: id, nama, harga, kategori (opsional), is_active/deleted
create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  harga integer not null check (harga >= 0),
  kategori text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.menu_items enable row level security;

create policy "anon full access" on public.menu_items
  for all to anon using (true) with check (true);
