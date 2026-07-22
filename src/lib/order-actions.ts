"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;
type ActionResult = { error?: string } | undefined;

async function recomputeOrderTotal(supabase: SupabaseServerClient, orderId: string) {
  const { data: items } = await supabase
    .from("order_items")
    .select("subtotal")
    .eq("order_id", orderId);

  const total = (items ?? []).reduce((sum, item) => sum + item.subtotal, 0);
  await supabase.from("orders").update({ total }).eq("id", orderId);
}

async function getOrCreateDraftOrder(
  supabase: SupabaseServerClient,
  tableId: string
): Promise<string | null> {
  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .eq("table_id", tableId)
    .eq("status", "draft")
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("orders")
    .insert({ table_id: tableId, status: "draft", total: 0 })
    .select("id")
    .single();

  if (error || !created) return null;
  return created.id;
}

export async function addItemToCartAction(
  tableId: string,
  menuItemId: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: table } = await supabase
    .from("tables")
    .select("status")
    .eq("id", tableId)
    .single();

  if (!table || table.status !== "kosong") {
    return { error: "Meja tidak lagi kosong." };
  }

  const orderId = await getOrCreateDraftOrder(supabase, tableId);
  if (!orderId) {
    return { error: "Gagal membuka keranjang." };
  }

  const { data: existingItem } = await supabase
    .from("order_items")
    .select("id, qty, harga")
    .eq("order_id", orderId)
    .eq("menu_item_id", menuItemId)
    .maybeSingle();

  if (existingItem) {
    const qty = existingItem.qty + 1;
    await supabase
      .from("order_items")
      .update({ qty, subtotal: qty * existingItem.harga })
      .eq("id", existingItem.id);
  } else {
    const { data: menuItem } = await supabase
      .from("menu_items")
      .select("nama, harga")
      .eq("id", menuItemId)
      .single();

    if (!menuItem) {
      return { error: "Item menu tidak ditemukan." };
    }

    await supabase.from("order_items").insert({
      order_id: orderId,
      menu_item_id: menuItemId,
      nama: menuItem.nama,
      harga: menuItem.harga,
      qty: 1,
      subtotal: menuItem.harga,
    });
  }

  await recomputeOrderTotal(supabase, orderId);
  revalidatePath(`/meja/${tableId}`);
}

export async function incrementCartItemAction(
  orderItemId: string,
  tableId: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("order_items")
    .select("id, order_id, qty, harga")
    .eq("id", orderItemId)
    .single();

  if (!item) return { error: "Item tidak ditemukan." };

  const qty = item.qty + 1;
  await supabase
    .from("order_items")
    .update({ qty, subtotal: qty * item.harga })
    .eq("id", item.id);

  await recomputeOrderTotal(supabase, item.order_id);
  revalidatePath(`/meja/${tableId}`);
}

export async function decrementCartItemAction(
  orderItemId: string,
  tableId: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("order_items")
    .select("id, order_id, qty, harga")
    .eq("id", orderItemId)
    .single();

  if (!item) return { error: "Item tidak ditemukan." };

  if (item.qty <= 1) {
    await supabase.from("order_items").delete().eq("id", item.id);
  } else {
    const qty = item.qty - 1;
    await supabase
      .from("order_items")
      .update({ qty, subtotal: qty * item.harga })
      .eq("id", item.id);
  }

  await recomputeOrderTotal(supabase, item.order_id);
  revalidatePath(`/meja/${tableId}`);
}

export async function removeCartItemAction(
  orderItemId: string,
  tableId: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("order_items")
    .select("order_id")
    .eq("id", orderItemId)
    .single();

  if (!item) return { error: "Item tidak ditemukan." };

  await supabase.from("order_items").delete().eq("id", orderItemId);
  await recomputeOrderTotal(supabase, item.order_id);
  revalidatePath(`/meja/${tableId}`);
}

export async function confirmOrderAction(tableId: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id")
    .eq("table_id", tableId)
    .eq("status", "draft")
    .maybeSingle();

  if (!order) {
    return { error: "Keranjang tidak ditemukan." };
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("id")
    .eq("order_id", order.id);

  if (!items || items.length === 0) {
    return { error: "Keranjang masih kosong." };
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: "confirmed" })
    .eq("id", order.id)
    .eq("status", "draft");

  if (updateError) {
    return { error: "Gagal membuat order." };
  }

  await supabase.from("tables").update({ status: "terisi" }).eq("id", tableId);

  revalidatePath("/");
  redirect("/");
}

export async function cancelOrderAction(tableId: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id")
    .eq("table_id", tableId)
    .eq("status", "confirmed")
    .maybeSingle();

  if (!order) {
    return { error: "Order aktif tidak ditemukan." };
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", order.id)
    .eq("status", "confirmed");

  if (updateError) {
    return { error: "Gagal membatalkan order." };
  }

  await supabase.from("tables").update({ status: "kosong" }).eq("id", tableId);

  revalidatePath("/");
  redirect("/");
}

export type PaymentMethod = "tunai" | "kartu";
export type PayOrderResult =
  | { error: string }
  | { success: true; total: number; paymentMethod: PaymentMethod; change: number };

export async function payOrderAction(
  tableId: string,
  paymentMethod: PaymentMethod,
  amountReceived?: number
): Promise<PayOrderResult> {
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, total")
    .eq("table_id", tableId)
    .eq("status", "confirmed")
    .maybeSingle();

  if (!order) {
    return { error: "Order aktif tidak ditemukan." };
  }

  if (paymentMethod === "tunai" && (amountReceived == null || amountReceived < order.total)) {
    return { error: "Jumlah uang diterima kurang dari total." };
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status: "paid",
      payment_method: paymentMethod,
      paid_at: new Date().toISOString(),
    })
    .eq("id", order.id)
    .eq("status", "confirmed");

  if (updateError) {
    return { error: "Gagal memproses pembayaran." };
  }

  await supabase.from("tables").update({ status: "kosong" }).eq("id", tableId);

  // Sengaja tidak memanggil revalidatePath di sini: itu akan memicu
  // re-render halaman /meja/[id]/bayar saat ini pada respons yang sama,
  // yang langsung kena redirect guard (tabel sudah "kosong") sebelum
  // struk digital sempat tampil. Halaman "/" tetap dinamis (bergantung
  // pada cookies), jadi statusnya otomatis segar begitu kasir menekan
  // "Selesai" untuk kembali ke sana.

  return {
    success: true,
    total: order.total,
    paymentMethod,
    change: paymentMethod === "tunai" ? amountReceived! - order.total : 0,
  };
}
