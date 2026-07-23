import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PublicMenu } from "@/components/PublicMenu";

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

  const { data: menuItems } = await supabase
    .from("menu_items")
    .select("id, nama, harga, kategori, foto_url, deskripsi")
    .eq("is_active", true)
    .order("kategori")
    .order("nama");

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="px-4 pt-6 pb-2 text-xl font-bold">{table.nama}</h1>
      <PublicMenu items={menuItems ?? []} />
    </div>
  );
}
