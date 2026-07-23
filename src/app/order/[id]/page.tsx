import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PublicOrderCart } from "@/components/PublicOrderCart";
import { PublicOrderConfirmation } from "@/components/PublicOrderConfirmation";

export default async function PublicOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: table } = await supabase
    .from("tables")
    .select("id, nama, status")
    .eq("id", id)
    .single();

  if (!table) notFound();

  if (table.status === "terisi") {
    const { data: order } = await supabase
      .from("orders")
      .select("id, total, created_at")
      .eq("table_id", id)
      .eq("status", "confirmed")
      .maybeSingle();

    const { data: items } = order
      ? await supabase
          .from("order_items")
          .select("id, nama, harga, qty, subtotal")
          .eq("order_id", order.id)
          .order("created_at")
      : { data: [] };

    return <PublicOrderConfirmation table={table} order={order} items={items ?? []} />;
  }

  const { data: draftOrder } = await supabase
    .from("orders")
    .select("id")
    .eq("table_id", id)
    .eq("status", "draft")
    .maybeSingle();

  const { data: cartItems } = draftOrder
    ? await supabase
        .from("order_items")
        .select("id, menu_item_id, nama, harga, qty, subtotal")
        .eq("order_id", draftOrder.id)
        .order("created_at")
    : { data: [] };

  const { data: menuItems } = await supabase
    .from("menu_items")
    .select("id, nama, harga, kategori, foto_url, deskripsi")
    .eq("is_active", true)
    .order("kategori")
    .order("nama");

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="px-4 pt-6 pb-2 text-xl font-bold">{table.nama}</h1>
      <PublicOrderCart
        table={table}
        cartItems={cartItems ?? []}
        menuItems={menuItems ?? []}
      />
    </div>
  );
}
