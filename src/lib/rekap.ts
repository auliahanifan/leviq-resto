import { createClient } from "@/lib/supabase/server";

export type PaidOrderWithItems = {
  id: string;
  total: number;
  payment_method: string | null;
  paid_at: string;
  order_items: Array<{
    nama: string;
    qty: number;
    subtotal: number;
  }>;
};

export async function getAllPaidOrders(): Promise<PaidOrderWithItems[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("id, total, payment_method, paid_at, order_items(nama, qty, subtotal)")
    .eq("status", "paid")
    .order("paid_at", { ascending: true });
  return (data as PaidOrderWithItems[]) ?? [];
}
