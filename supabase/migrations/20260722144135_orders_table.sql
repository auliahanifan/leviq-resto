-- 1.4 Tabel orders: id, table_id, status, total, created_at, paid_at, payment_method
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references public.tables(id) on delete restrict,
  status text not null default 'draft' check (status in ('draft', 'confirmed', 'paid', 'cancelled')),
  total integer not null default 0 check (total >= 0),
  payment_method text check (payment_method in ('tunai', 'kartu')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.orders enable row level security;

create policy "anon full access" on public.orders
  for all to anon using (true) with check (true);
