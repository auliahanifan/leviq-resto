"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Plus, UtensilsCrossed } from "lucide-react";
import { addItemToActiveOrderAction } from "@/lib/public-order-actions";
import { formatRupiah } from "@/lib/format";
import { groupByKategori, type MenuItem } from "@/lib/menu";

type Table = { id: string; nama: string; status: string };
type Order = { id: string; total: number; created_at: string } | null;
type OrderItem = { id: string; nama: string; harga: number; qty: number; subtotal: number };

export function PublicOrderConfirmation({
  table,
  order,
  items,
  menuItems,
}: {
  table: Table;
  order: Order;
  items: OrderItem[];
  menuItems: MenuItem[];
}) {
  const [optimisticItems, addOptimisticItem] = useOptimistic(
    items,
    (state, newItem: OrderItem) => [...state, newItem]
  );
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [pendingId, setPendingId] = useState<string>();

  const groups = groupByKategori(menuItems);
  const kategoris = groups.map(([kategori]) => kategori);
  const [activeKategori, setActiveKategori] = useState<string>(kategoris[0] ?? "");
  const activeItems = groups.find(([kategori]) => kategori === activeKategori)?.[1] ?? [];

  const optimisticTotal = optimisticItems.reduce((sum, item) => sum + item.subtotal, 0);

  function handleAdd(menuItem: MenuItem) {
    if (!order) return;
    setPendingId(menuItem.id);
    startTransition(async () => {
      addOptimisticItem({
        id: `temp-${menuItem.id}-${optimisticItems.length}`,
        nama: menuItem.nama,
        harga: menuItem.harga,
        qty: 1,
        subtotal: menuItem.harga,
      });
      const result = await addItemToActiveOrderAction(table.id, menuItem.id);
      setError(result?.error);
      setPendingId(undefined);
    });
  }

  if (!order) {
    return (
      <div className="flex flex-1 flex-col gap-4 px-6 py-8">
        <h1 className="text-2xl font-bold">{table.nama}</h1>
        <p className="text-lg text-muted">
          Meja ini berstatus terisi tapi order tidak ditemukan. Silakan hubungi kasir.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold">{table.nama}</h1>
        <p className="text-lg text-primary">Pesanan Anda sudah diterima.</p>
      </div>

      <ul className="flex flex-col gap-3">
        {optimisticItems.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-2xl border border-border p-3"
          >
            <div>
              <p className="font-medium">{item.nama}</p>
              <p className="text-sm text-muted">
                {item.qty} × {formatRupiah(item.harga)}
              </p>
            </div>
            <p className="font-medium">{formatRupiah(item.subtotal)}</p>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-border pt-4 text-xl font-bold">
        <span>Total</span>
        <span>{formatRupiah(optimisticTotal)}</span>
      </div>

      <p className="text-base text-muted">
        Silakan datang ke kasir untuk melakukan pembayaran.
      </p>

      {menuItems.length > 0 && (
        <div className="flex flex-1 flex-col gap-3 border-t border-border pt-6">
          <h2 className="text-lg font-bold">Mau tambah pesanan lagi?</h2>

          {error && (
            <p role="alert" className="text-base font-medium text-danger">
              {error}
            </p>
          )}

          <div className="flex gap-2 overflow-x-auto pb-1">
            {kategoris.map((kategori) => (
              <button
                key={kategori}
                type="button"
                onClick={() => setActiveKategori(kategori)}
                className={`min-h-12 shrink-0 rounded-full px-4 text-base font-medium ${
                  kategori === activeKategori ? "bg-primary text-white" : "bg-surface"
                }`}
              >
                {kategori}
              </button>
            ))}
          </div>

          <ul className="flex flex-col gap-3">
            {activeItems.map((item) => (
              <li
                key={item.id}
                className="flex gap-3 rounded-2xl border border-border p-3"
              >
                {item.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.foto_url}
                    alt={item.nama}
                    className="h-20 w-20 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-surface">
                    <UtensilsCrossed className="h-8 w-8 text-muted" />
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-1">
                  <p className="font-medium">{item.nama}</p>
                  {item.deskripsi && (
                    <p className="text-sm text-muted">{item.deskripsi}</p>
                  )}
                  <p className="font-medium text-primary">{formatRupiah(item.harga)}</p>
                </div>
                <div className="flex items-center">
                  <button
                    type="button"
                    disabled={pendingId === item.id}
                    onClick={() => handleAdd(item)}
                    aria-label="Tambah"
                    className="flex min-h-12 min-w-12 items-center justify-center rounded-full bg-primary px-4 text-white disabled:opacity-40"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
