"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/session";

type ActionResult = { error?: string } | undefined;

export async function addItemToCartAction(
  tableId: string,
  menuItemId: string
): Promise<ActionResult> {
  await requireSession();

  const supabase = await createClient();

  const [{ data: table }, { data: existingOrder }] = await Promise.all([
    supabase.from("tables").select("status").eq("id", tableId).single(),
    supabase.from("orders").select("id, total").eq("table_id", tableId).eq("status", "draft").maybeSingle(),
  ]);

  if (!table || table.status !== "kosong") {
    return { error: "Meja tidak lagi kosong." };
  }

  let orderId: string;
  let currentTotal: number;
  if (existingOrder) {
    orderId = existingOrder.id;
    currentTotal = existingOrder.total;
  } else {
    const { data: created, error } = await supabase
      .from("orders")
      .insert({ table_id: tableId, status: "draft", total: 0 })
      .select("id")
      .single();

    if (error || !created) return { error: "Gagal membuka keranjang." };
    orderId = created.id;
    currentTotal = 0;
  }

  const [{ data: existingItem }, { data: menuItem }] = await Promise.all([
    supabase
      .from("order_items")
      .select("id, qty, harga")
      .eq("order_id", orderId)
      .eq("menu_item_id", menuItemId)
      .maybeSingle(),
    supabase.from("menu_items").select("nama, harga").eq("id", menuItemId).single(),
  ]);

  if (existingItem) {
    const qty = existingItem.qty + 1;
    await Promise.all([
      supabase
        .from("order_items")
        .update({ qty, subtotal: qty * existingItem.harga })
        .eq("id", existingItem.id),
      supabase.from("orders").update({ total: currentTotal + existingItem.harga }).eq("id", orderId),
    ]);
  } else {
    if (!menuItem) {
      return { error: "Item menu tidak ditemukan." };
    }

    await Promise.all([
      supabase.from("order_items").insert({
        order_id: orderId,
        menu_item_id: menuItemId,
        nama: menuItem.nama,
        harga: menuItem.harga,
        qty: 1,
        subtotal: menuItem.harga,
      }),
      supabase.from("orders").update({ total: currentTotal + menuItem.harga }).eq("id", orderId),
    ]);
  }

  revalidatePath(`/meja/${tableId}`);
}

export async function incrementCartItemAction(
  orderItemId: string,
  tableId: string
): Promise<ActionResult> {
  await requireSession();

  const supabase = await createClient();

  const [{ data: item }, { data: order }] = await Promise.all([
    supabase.from("order_items").select("id, qty, harga").eq("id", orderItemId).single(),
    supabase.from("orders").select("id, total").eq("table_id", tableId).eq("status", "draft").maybeSingle(),
  ]);

  if (!item || !order) return { error: "Item tidak ditemukan." };

  const qty = item.qty + 1;
  await Promise.all([
    supabase.from("order_items").update({ qty, subtotal: qty * item.harga }).eq("id", item.id),
    supabase.from("orders").update({ total: order.total + item.harga }).eq("id", order.id),
  ]);

  revalidatePath(`/meja/${tableId}`);
}

export async function decrementCartItemAction(
  orderItemId: string,
  tableId: string
): Promise<ActionResult> {
  await requireSession();

  const supabase = await createClient();

  const [{ data: item }, { data: order }] = await Promise.all([
    supabase.from("order_items").select("id, qty, harga").eq("id", orderItemId).single(),
    supabase.from("orders").select("id, total").eq("table_id", tableId).eq("status", "draft").maybeSingle(),
  ]);

  if (!item || !order) return { error: "Item tidak ditemukan." };

  if (item.qty <= 1) {
    await Promise.all([
      supabase.from("order_items").delete().eq("id", item.id),
      supabase.from("orders").update({ total: order.total - item.harga }).eq("id", order.id),
    ]);
  } else {
    const qty = item.qty - 1;
    await Promise.all([
      supabase.from("order_items").update({ qty, subtotal: qty * item.harga }).eq("id", item.id),
      supabase.from("orders").update({ total: order.total - item.harga }).eq("id", order.id),
    ]);
  }

  revalidatePath(`/meja/${tableId}`);
}

export async function removeCartItemAction(
  orderItemId: string,
  tableId: string
): Promise<ActionResult> {
  await requireSession();

  const supabase = await createClient();

  const [{ data: item }, { data: order }] = await Promise.all([
    supabase.from("order_items").select("id, subtotal").eq("id", orderItemId).single(),
    supabase.from("orders").select("id, total").eq("table_id", tableId).eq("status", "draft").maybeSingle(),
  ]);

  if (!item || !order) return { error: "Item tidak ditemukan." };

  await Promise.all([
    supabase.from("order_items").delete().eq("id", item.id),
    supabase.from("orders").update({ total: order.total - item.subtotal }).eq("id", order.id),
  ]);

  revalidatePath(`/meja/${tableId}`);
}

export async function confirmOrderAction(tableId: string): Promise<ActionResult> {
  await requireSession();

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
  redirect(`/meja/${tableId}/bayar`);
}

export async function cancelOrderAction(tableId: string): Promise<ActionResult> {
  await requireSession();

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
  await requireSession();

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
