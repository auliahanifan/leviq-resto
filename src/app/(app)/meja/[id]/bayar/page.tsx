import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PaymentFlow } from "@/components/PaymentFlow";

export default async function BayarPage({
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
  if (table.status !== "terisi") redirect(`/meja/${id}`);

  const { data: order } = await supabase
    .from("orders")
    .select("id, total")
    .eq("table_id", id)
    .eq("status", "confirmed")
    .maybeSingle();

  if (!order) redirect(`/meja/${id}`);

  return <PaymentFlow table={table} total={order.total} />;
}
