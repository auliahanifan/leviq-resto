import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TableQrCode } from "@/components/TableQrCode";

export default async function TableQrPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: table } = await supabase
    .from("tables")
    .select("id, nama")
    .eq("id", id)
    .single();

  if (!table) notFound();

  return <TableQrCode tableId={table.id} tableName={table.nama} />;
}
