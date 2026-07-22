"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { cancelOrderAction } from "@/lib/order-actions";
import { formatRupiah } from "@/lib/format";

type Table = { id: string; nama: string; status: string };
type Order = { id: string; total: number; created_at: string } | null;
type OrderItem = { id: string; nama: string; harga: number; qty: number; subtotal: number };

export function OrderSummary({
  table,
  order,
  items,
}: {
  table: Table;
  order: Order;
  items: OrderItem[];
}) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();

  function handleCancelClick() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    startTransition(async () => {
      const result = await cancelOrderAction(table.id);
      setError(result?.error);
    });
  }

  if (!order) {
    return (
      <div className="flex flex-1 flex-col gap-4 px-6 py-8">
        <h1 className="text-2xl font-bold">{table.nama}</h1>
        <p className="text-lg text-zinc-500">
          Meja ini berstatus terisi tapi order tidak ditemukan.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-8">
      <h1 className="text-2xl font-bold">{table.nama} — Ringkasan Order</h1>

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

      {error && (
        <p role="alert" className="text-lg font-medium text-red-600">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <Link
          href={`/meja/${table.id}/bayar`}
          className="flex min-h-16 min-w-16 items-center justify-center rounded-xl bg-foreground px-6 text-lg font-medium text-background active:opacity-80"
        >
          Bayar
        </Link>
        <button
          type="button"
          disabled={pending}
          onClick={handleCancelClick}
          className="min-h-16 rounded-xl border border-red-300 px-6 text-lg font-medium text-red-600 active:opacity-80 disabled:opacity-40 dark:border-red-800"
        >
          {pending ? "Membatalkan..." : confirming ? "Yakin batalkan order?" : "Batalkan Order"}
        </button>
      </div>
    </div>
  );
}
