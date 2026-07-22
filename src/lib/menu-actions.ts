"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type MenuFormState = { error?: string; success?: boolean } | undefined;

function parseHarga(value: FormDataEntryValue | null): number | null {
  if (value === null || String(value).trim() === "") return null;
  const harga = Number(value);
  if (!Number.isFinite(harga) || harga < 0) return null;
  return harga;
}

export async function createMenuItemAction(
  _prevState: MenuFormState,
  formData: FormData
): Promise<MenuFormState> {
  const nama = String(formData.get("nama") ?? "").trim();
  const harga = parseHarga(formData.get("harga"));
  const kategori = String(formData.get("kategori") ?? "").trim() || null;

  if (!nama) {
    return { error: "Nama item wajib diisi." };
  }
  if (harga === null) {
    return { error: "Harga wajib diisi dengan angka, minimal 0." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("menu_items").insert({ nama, harga, kategori });

  if (error) {
    return { error: "Gagal menambah item menu." };
  }

  revalidatePath("/menu");
  return { success: true };
}

export async function updateMenuItemAction(
  _prevState: MenuFormState,
  formData: FormData
): Promise<MenuFormState> {
  const id = String(formData.get("id") ?? "");
  const nama = String(formData.get("nama") ?? "").trim();
  const harga = parseHarga(formData.get("harga"));
  const kategori = String(formData.get("kategori") ?? "").trim() || null;

  if (!id) {
    return { error: "Item menu tidak ditemukan." };
  }
  if (!nama) {
    return { error: "Nama item wajib diisi." };
  }
  if (harga === null) {
    return { error: "Harga wajib diisi dengan angka, minimal 0." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("menu_items")
    .update({ nama, harga, kategori })
    .eq("id", id);

  if (error) {
    return { error: "Gagal menyimpan perubahan item menu." };
  }

  revalidatePath("/menu");
  return { success: true };
}

export async function deleteMenuItemAction(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("menu_items").update({ is_active: false }).eq("id", id);
  revalidatePath("/menu");
}
