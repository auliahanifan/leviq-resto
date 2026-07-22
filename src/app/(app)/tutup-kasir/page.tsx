import Link from "next/link";
import { getPendingCashSummary } from "@/lib/cash-closing";
import { CashClosingForm } from "@/components/CashClosingForm";
import { formatRupiah } from "@/lib/format";

export default async function TutupKasirPage() {
  const summary = await getPendingCashSummary();

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-6 py-8">
      <h1 className="text-2xl font-bold">Tutup Kasir</h1>

      <div className="flex flex-col gap-2 rounded-xl border border-zinc-300 p-4 dark:border-zinc-700">
        <div className="flex justify-between text-lg">
          <span>Total Tunai</span>
          <span className="font-medium">{formatRupiah(summary.totalTunai)}</span>
        </div>
        <div className="flex justify-between text-lg">
          <span>Total Kartu</span>
          <span className="font-medium">{formatRupiah(summary.totalKartu)}</span>
        </div>
      </div>

      <CashClosingForm totalTunai={summary.totalTunai} />

      <Link
        href="/tutup-kasir/riwayat"
        className="text-center text-base font-medium underline-offset-4 hover:underline"
      >
        Riwayat Tutup Kasir
      </Link>
    </div>
  );
}
