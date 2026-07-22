-- 1.5 Tabel order_items: id, order_id, menu_item_id, nama & harga snapshot, qty, subtotal
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  nama text not null,
  harga integer not null check (harga >= 0),
  qty integer not null check (qty > 0),
  subtotal integer not null check (subtotal >= 0),
  created_at timestamptz not null default now()
);

alter table public.order_items enable row level security;

create policy "anon full access" on public.order_items
  for all to anon using (true) with check (true);

comment on column public.order_items.nama is
  'Snapshot nama menu saat order dibuat, agar histori tidak berubah jika menu_items diedit belakangan.';
comment on column public.order_items.harga is
  'Snapshot harga menu saat order dibuat (per item, sebelum dikali qty).';
