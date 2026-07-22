-- 1.6 Tabel cash_closings (tutup kasir): periode, total tunai/kartu, uang fisik, selisih
create table public.cash_closings (
  id uuid primary key default gen_random_uuid(),
  periode_mulai timestamptz not null,
  periode_selesai timestamptz not null,
  total_tunai integer not null default 0 check (total_tunai >= 0),
  total_kartu integer not null default 0 check (total_kartu >= 0),
  uang_fisik integer not null check (uang_fisik >= 0),
  selisih integer not null,
  created_at timestamptz not null default now()
);

alter table public.cash_closings enable row level security;

create policy "anon full access" on public.cash_closings
  for all to anon using (true) with check (true);
