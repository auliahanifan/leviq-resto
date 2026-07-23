import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AddTableForm } from "@/components/AddTableForm";
import { DeleteTableButton } from "@/components/DeleteTableButton";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: tables } = await supabase
    .from("tables")
    .select("id, nama, status")
    .order("created_at");

  tables?.sort((a, b) =>
    a.nama.localeCompare(b.nama, undefined, { numeric: true, sensitivity: "base" })
  );

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <h1 className="text-2xl font-bold">Daftar Meja</h1>
      <AddTableForm />
      {!tables || tables.length === 0 ? (
        <p className="text-lg text-muted">
          Belum ada meja. Tambahkan meja baru untuk mulai.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {tables.map((table) => {
            const isTerisi = table.status === "terisi";
            return (
              <div
                key={table.id}
                className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-5 ${
                  isTerisi ? "border-warning bg-warning-light" : "border-primary bg-primary-light"
                }`}
              >
                <Link
                  href={`/meja/${table.id}`}
                  className="flex flex-col items-center gap-3"
                >
                  <span className="text-xl font-bold">{table.nama}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold text-white ${
                      isTerisi ? "bg-warning" : "bg-primary"
                    }`}
                  >
                    {isTerisi ? "Terisi" : "Kosong"}
                  </span>
                </Link>
                <Link
                  href={`/meja/${table.id}/qr`}
                  className="text-sm font-medium underline-offset-4 hover:underline"
                >
                  Lihat/Cetak QR
                </Link>
                {!isTerisi && <DeleteTableButton id={table.id} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
