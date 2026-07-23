import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/format";

export default async function RiwayatTutupKasirPage() {
  const supabase = await createClient();
  const { data: closings } = await supabase
    .from("cash_closings")
    .select("*")
    .order("periode_selesai", { ascending: false });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-8">
      <h1 className="text-2xl font-bold">Riwayat Tutup Kasir</h1>
      {!closings || closings.length === 0 ? (
        <p className="text-lg text-muted">Belum ada riwayat tutup kasir.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {closings.map((closing) => (
            <li
              key={closing.id}
              className="flex flex-col gap-2 rounded-2xl border border-border p-4"
            >
              <p className="font-medium">{formatDateTime(closing.periode_selesai)}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-base text-muted">
                <span>Total Tunai</span>
                <span className="text-right">{formatRupiah(closing.total_tunai)}</span>
                <span>Total Kartu</span>
                <span className="text-right">{formatRupiah(closing.total_kartu)}</span>
                <span>Uang Fisik</span>
                <span className="text-right">{formatRupiah(closing.uang_fisik)}</span>
                <span className="font-medium text-foreground">Selisih</span>
                <span
                  className={`text-right font-medium ${
                    closing.selisih < 0 ? "text-danger" : "text-foreground"
                  }`}
                >
                  {formatRupiah(closing.selisih)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  });
}
