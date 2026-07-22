"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPendingCashSummary } from "@/lib/cash-closing";

export type CreateCashClosingState = { error?: string } | undefined;

export async function createCashClosingAction(
  _prevState: CreateCashClosingState,
  formData: FormData
): Promise<CreateCashClosingState> {
  const uangFisikRaw = formData.get("uang_fisik");
  const uangFisik = Number(uangFisikRaw);

  if (!uangFisikRaw || !Number.isFinite(uangFisik) || uangFisik < 0) {
    return { error: "Jumlah uang fisik wajib diisi dengan angka, minimal 0." };
  }

  const { periodeMulai, periodeSelesai, totalTunai, totalKartu } =
    await getPendingCashSummary();

  const selisih = uangFisik - totalTunai;

  const supabase = await createClient();
  const { error } = await supabase.from("cash_closings").insert({
    periode_mulai: periodeMulai,
    periode_selesai: periodeSelesai,
    total_tunai: totalTunai,
    total_kartu: totalKartu,
    uang_fisik: uangFisik,
    selisih,
  });

  if (error) {
    return { error: "Gagal menyimpan sesi tutup kasir." };
  }

  redirect("/tutup-kasir/riwayat");
}
