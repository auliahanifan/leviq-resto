import { createClient } from "@/lib/supabase/server";
import { MenuManager } from "@/components/MenuManager";

export default async function MenuPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("menu_items")
    .select("*")
    .eq("is_active", true)
    .order("nama");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-8">
      <h1 className="text-2xl font-bold">Kelola Menu</h1>
      <MenuManager items={items ?? []} />
    </div>
  );
}
