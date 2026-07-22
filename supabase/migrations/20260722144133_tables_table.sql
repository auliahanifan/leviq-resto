-- 1.2 Tabel tables (meja): id, nama/nomor, status (kosong|terisi)
create table public.tables (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  status text not null default 'kosong' check (status in ('kosong', 'terisi')),
  created_at timestamptz not null default now()
);

alter table public.tables enable row level security;

create policy "anon full access" on public.tables
  for all to anon using (true) with check (true);
