import { createClient } from "@/lib/supabase/server";
import { AddTableForm } from "@/components/AddTableForm";
import { DeleteTableButton } from "@/components/DeleteTableButton";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: tables } = await supabase
    .from("tables")
    .select("id, nama, status")
    .order("created_at");

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <h1 className="text-2xl font-bold">Daftar Meja</h1>
      <AddTableForm />
      {!tables || tables.length === 0 ? (
        <p className="text-lg text-zinc-500">
          Belum ada meja. Tambahkan meja baru untuk mulai.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {tables.map((table) => {
            // Status berasal langsung dari tables.status. Fase 5 (buat order/
            // bayar) yang bertanggung jawab mengubah nilai ini antara
            // 'kosong' dan 'terisi' saat siklus order berjalan.
            const isTerisi = table.status === "terisi";
            return (
              <div
                key={table.id}
                className={`flex flex-col items-center gap-3 rounded-xl border-2 p-5 ${
                  isTerisi
                    ? "border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-950"
                    : "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950"
                }`}
              >
                <span className="text-xl font-bold">{table.nama}</span>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    isTerisi
                      ? "bg-orange-200 text-orange-900 dark:bg-orange-900 dark:text-orange-200"
                      : "bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-200"
                  }`}
                >
                  {isTerisi ? "Terisi" : "Kosong"}
                </span>
                {!isTerisi && <DeleteTableButton id={table.id} nama={table.nama} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
