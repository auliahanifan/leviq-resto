-- 1.7 Review relasi & constraint dasar: index untuk FK dan kolom status yang sering di-query
create index orders_table_id_idx on public.orders (table_id);
create index orders_status_idx on public.orders (status);
create index orders_paid_at_idx on public.orders (paid_at);
create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_menu_item_id_idx on public.order_items (menu_item_id);
create index tables_status_idx on public.tables (status);
create index menu_items_is_active_idx on public.menu_items (is_active);
