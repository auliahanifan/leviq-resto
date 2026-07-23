"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error?: string } | undefined;

export async function addItemToPublicCartAction(
  tableId: string,
  menuItemId: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const [{ data: table }, { data: confirmedOrder }, { data: draftOrder }] = await Promise.all([
    supabase.from("tables").select("id").eq("id", tableId).single(),
    supabase.from("orders").select("id").eq("table_id", tableId).eq("status", "confirmed").maybeSingle(),
    supabase.from("orders").select("id, total").eq("table_id", tableId).eq("status", "draft").maybeSingle(),
  ]);

  if (!table) {
    return { error: "Meja tidak ditemukan." };
  }

  if (confirmedOrder) {
    return { error: "Meja ini sudah punya pesanan aktif." };
  }

  let orderId: string;
  let currentTotal: number;
  if (draftOrder) {
    orderId = draftOrder.id;
    currentTotal = draftOrder.total;
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

  revalidatePath(`/order/${tableId}`);
}

export async function incrementPublicCartItemAction(
  orderItemId: string,
  tableId: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const [{ data: item }, { data: order }] = await Promise.all([
    supabase.from("order_items").select("id, order_id, qty, harga").eq("id", orderItemId).single(),
    supabase.from("orders").select("id, total").eq("table_id", tableId).eq("status", "draft").maybeSingle(),
  ]);

  if (!item || !order) return { error: "Item tidak ditemukan." };

  const qty = item.qty + 1;
  await Promise.all([
    supabase.from("order_items").update({ qty, subtotal: qty * item.harga }).eq("id", item.id),
    supabase.from("orders").update({ total: order.total + item.harga }).eq("id", order.id),
  ]);

  revalidatePath(`/order/${tableId}`);
}

export async function decrementPublicCartItemAction(
  orderItemId: string,
  tableId: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const [{ data: item }, { data: order }] = await Promise.all([
    supabase.from("order_items").select("id, order_id, qty, harga").eq("id", orderItemId).single(),
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
      supabase
        .from("order_items")
        .update({ qty, subtotal: qty * item.harga })
        .eq("id", item.id),
      supabase.from("orders").update({ total: order.total - item.harga }).eq("id", order.id),
    ]);
  }

  revalidatePath(`/order/${tableId}`);
}

export async function addItemToActiveOrderAction(
  tableId: string,
  menuItemId: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const [{ data: order }, { data: menuItem }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, total")
      .eq("table_id", tableId)
      .eq("status", "confirmed")
      .maybeSingle(),
    supabase.from("menu_items").select("nama, harga").eq("id", menuItemId).single(),
  ]);

  if (!order) return { error: "Order aktif tidak ditemukan." };
  if (!menuItem) return { error: "Item menu tidak ditemukan." };

  await Promise.all([
    supabase.from("order_items").insert({
      order_id: order.id,
      menu_item_id: menuItemId,
      nama: menuItem.nama,
      harga: menuItem.harga,
      qty: 1,
      subtotal: menuItem.harga,
    }),
    supabase.from("orders").update({ total: order.total + menuItem.harga }).eq("id", order.id),
  ]);

  revalidatePath(`/order/${tableId}`);
}

export async function confirmPublicOrderAction(tableId: string): Promise<ActionResult> {
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

  revalidatePath(`/order/${tableId}`);
  redirect(`/order/${tableId}`);
}
