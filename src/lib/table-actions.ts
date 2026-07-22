"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/session";

export type AddTableState = { error?: string; success?: boolean } | undefined;

export async function addTableAction(
  _prevState: AddTableState,
  formData: FormData
): Promise<AddTableState> {
  await requireSession();

  const nama = String(formData.get("nama") ?? "").trim();

  if (!nama) {
    return { error: "Nama meja wajib diisi." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tables").insert({ nama });

  if (error) {
    return { error: "Gagal menambah meja. Coba lagi." };
  }

  revalidatePath("/");
  return { success: true };
}

export type DeleteTableState = { error?: string } | undefined;

export async function deleteTableAction(id: string): Promise<DeleteTableState> {
  await requireSession();

  const supabase = await createClient();
  const { error } = await supabase.from("tables").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return { error: "Meja tidak bisa dihapus karena sudah punya riwayat order." };
    }
    return { error: "Gagal menghapus meja. Coba lagi." };
  }

  revalidatePath("/");
}
