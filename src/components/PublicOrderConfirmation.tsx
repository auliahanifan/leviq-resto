import { formatRupiah } from "@/lib/format";

type Table = { id: string; nama: string; status: string };
type Order = { id: string; total: number; created_at: string } | null;
type OrderItem = { id: string; nama: string; harga: number; qty: number; subtotal: number };

export function PublicOrderConfirmation({
  table,
  order,
  items,
}: {
  table: Table;
  order: Order;
  items: OrderItem[];
}) {
  if (!order) {
    return (
      <div className="flex flex-1 flex-col gap-4 px-6 py-8">
        <h1 className="text-2xl font-bold">{table.nama}</h1>
        <p className="text-lg text-zinc-500">
          Meja ini berstatus terisi tapi order tidak ditemukan. Silakan hubungi kasir.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">{table.nama}</h1>
        <p className="text-lg text-zinc-500">Pesanan Anda sudah diterima.</p>
      </div>

      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-zinc-300 p-3 dark:border-zinc-700"
          >
            <div>
              <p className="font-medium">{item.nama}</p>
              <p className="text-sm text-zinc-500">
                {item.qty} × {formatRupiah(item.harga)}
              </p>
            </div>
            <p className="font-medium">{formatRupiah(item.subtotal)}</p>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-zinc-300 pt-4 text-xl font-bold dark:border-zinc-700">
        <span>Total</span>
        <span>{formatRupiah(order.total)}</span>
      </div>

      <p className="text-base text-zinc-500">
        Silakan datang ke kasir untuk melakukan pembayaran.
      </p>
    </div>
  );
}
