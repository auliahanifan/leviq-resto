-- Paksa PIN kasir ke default "1234" (upsert idempoten pada settings singleton)
insert into public.settings (id, pin_hash)
values (1, crypt('1234', gen_salt('bf')))
on conflict (id) do update set pin_hash = excluded.pin_hash, updated_at = now();
