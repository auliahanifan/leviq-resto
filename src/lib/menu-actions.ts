"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/session";

export type MenuFormState = { error?: string; success?: boolean } | undefined;

function parseHarga(value: FormDataEntryValue | null): number | null {
  if (value === null || String(value).trim() === "") return null;
  const harga = Number(value);
  if (!Number.isFinite(harga) || harga < 0) return null;
  return harga;
}

const MAX_FOTO_SIZE = 2 * 1024 * 1024;
const FOTO_EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function uploadMenuFoto(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File
): Promise<{ url: string } | { error: string }> {
  const ext = FOTO_EXT_BY_TYPE[file.type];
  if (!ext) {
    return { error: "Format foto harus JPG, PNG, atau WebP." };
  }
  if (file.size > MAX_FOTO_SIZE) {
    return { error: "Ukuran foto maksimal 2MB." };
  }

  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("menu-photos").upload(path, file);
  if (error) {
    return { error: "Gagal mengunggah foto." };
  }

  const { data } = supabase.storage.from("menu-photos").getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function createMenuItemAction(
  _prevState: MenuFormState,
  formData: FormData
): Promise<MenuFormState> {
  await requireSession();

  const nama = String(formData.get("nama") ?? "").trim();
  const harga = parseHarga(formData.get("harga"));
  const kategori = String(formData.get("kategori") ?? "").trim() || null;
  const deskripsi = String(formData.get("deskripsi") ?? "").trim() || null;

  if (!nama) {
    return { error: "Nama item wajib diisi." };
  }
  if (harga === null) {
    return { error: "Harga wajib diisi dengan angka, minimal 0." };
  }

  const supabase = await createClient();

  let foto_url: string | null = null;
  const foto = formData.get("foto");
  if (foto instanceof File && foto.size > 0) {
    const uploaded = await uploadMenuFoto(supabase, foto);
    if ("error" in uploaded) return { error: uploaded.error };
    foto_url = uploaded.url;
  }

  const { error } = await supabase
    .from("menu_items")
    .insert({ nama, harga, kategori, deskripsi, foto_url });

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
  await requireSession();

  const id = String(formData.get("id") ?? "");
  const nama = String(formData.get("nama") ?? "").trim();
  const harga = parseHarga(formData.get("harga"));
  const kategori = String(formData.get("kategori") ?? "").trim() || null;
  const deskripsi = String(formData.get("deskripsi") ?? "").trim() || null;
  const hapusFoto = formData.get("hapus_foto") === "on";

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

  let foto_url: string | null | undefined;
  const foto = formData.get("foto");
  if (foto instanceof File && foto.size > 0) {
    const uploaded = await uploadMenuFoto(supabase, foto);
    if ("error" in uploaded) return { error: uploaded.error };
    foto_url = uploaded.url;
  } else if (hapusFoto) {
    foto_url = null;
  }

  const { error } = await supabase
    .from("menu_items")
    .update({ nama, harga, kategori, deskripsi, ...(foto_url !== undefined ? { foto_url } : {}) })
    .eq("id", id);

  if (error) {
    return { error: "Gagal menyimpan perubahan item menu." };
  }

  revalidatePath("/menu");
  return { success: true };
}

export async function deleteMenuItemAction(id: string): Promise<void> {
  await requireSession();

  const supabase = await createClient();
  await supabase.from("menu_items").update({ is_active: false }).eq("id", id);
  revalidatePath("/menu");
}
