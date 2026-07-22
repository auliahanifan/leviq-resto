-- 1.1 Tabel settings (PIN kasir tunggal, tersimpan hash)
create extension if not exists pgcrypto;

create table public.settings (
  id smallint primary key default 1,
  pin_hash text not null,
  updated_at timestamptz not null default now(),
  constraint settings_singleton check (id = 1)
);

alter table public.settings enable row level security;

comment on table public.settings is
  'Singleton row (id=1) menyimpan hash PIN kasir. Sengaja tanpa policy anon — akses hanya lewat RPC verify_pin()/set_pin() (lihat migrasi Fase 2) agar hash tidak pernah terekspos ke klien.';
