-- 2.2 Logic validasi PIN terhadap settings (FR1.1), tanpa expose pin_hash ke klien
create or replace function public.verify_pin(input_pin text)
returns boolean
language sql
security definer
set search_path = public, extensions
as $$
  select exists (
    select 1 from public.settings
    where id = 1 and pin_hash = crypt(input_pin, pin_hash)
  );
$$;

-- 2.5 Ubah PIN: hanya berhasil jika PIN lama benar
create or replace function public.set_pin(old_pin text, new_pin text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  ok boolean;
begin
  select exists(
    select 1 from public.settings where id = 1 and pin_hash = crypt(old_pin, pin_hash)
  ) into ok;

  if not ok then
    return false;
  end if;

  update public.settings
  set pin_hash = crypt(new_pin, gen_salt('bf')), updated_at = now()
  where id = 1;

  return true;
end;
$$;

revoke all on function public.verify_pin(text) from public;
revoke all on function public.set_pin(text, text) from public;
grant execute on function public.verify_pin(text) to anon, authenticated;
grant execute on function public.set_pin(text, text) to anon, authenticated;
