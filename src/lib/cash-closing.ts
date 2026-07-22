import { createClient } from "@/lib/supabase/server";

export type PendingCashSummary = {
  periodeMulai: string;
  periodeSelesai: string;
  totalTunai: number;
  totalKartu: number;
};

export async function getPendingCashSummary(): Promise<PendingCashSummary> {
  const supabase = await createClient();
  const periodeSelesai = new Date().toISOString();

  const { data: lastClosing } = await supabase
    .from("cash_closings")
    .select("periode_selesai")
    .order("periode_selesai", { ascending: false })
    .limit(1)
    .maybeSingle();

  let query = supabase
    .from("orders")
    .select("total, payment_method, paid_at")
    .eq("status", "paid")
    .lte("paid_at", periodeSelesai);

  if (lastClosing) {
    query = query.gt("paid_at", lastClosing.periode_selesai);
  }

  const { data } = await query;
  const orders = data ?? [];

  const totalTunai = orders
    .filter((o) => o.payment_method === "tunai")
    .reduce((sum, o) => sum + o.total, 0);
  const totalKartu = orders
    .filter((o) => o.payment_method === "kartu")
    .reduce((sum, o) => sum + o.total, 0);

  const earliestPaidAt = orders.reduce<string | null>(
    (min, o) => (o.paid_at && (min === null || o.paid_at < min) ? o.paid_at : min),
    null
  );

  const periodeMulai = lastClosing?.periode_selesai ?? earliestPaidAt ?? periodeSelesai;

  return { periodeMulai, periodeSelesai, totalTunai, totalKartu };
}
