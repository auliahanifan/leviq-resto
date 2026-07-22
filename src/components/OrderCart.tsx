"use client";

import { useState, useTransition } from "react";
import {
  addItemToCartAction,
  confirmOrderAction,
  decrementCartItemAction,
  incrementCartItemAction,
  removeCartItemAction,
} from "@/lib/order-actions";
import { Button } from "@/components/ui/Button";
import { formatRupiah } from "@/lib/format";

type Table = { id: string; nama: string; status: string };
type CartItem = {
  id: string;
  nama: string;
  harga: number;
  qty: number;
  subtotal: number;
};
type MenuItem = { id: string; nama: string; harga: number; kategori: string | null };

export function OrderCart({
  table,
  cartItems,
  total,
  menuItems,
}: {
  table: Table;
  cartItems: CartItem[];
  total: number;
  menuItems: MenuItem[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function run(action: () => Promise<{ error?: string } | undefined>) {
    startTransition(async () => {
      const result = await action();
      setError(result?.error);
    });
  }

  const groups = groupByKategori(menuItems);

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8 lg:flex-row">
      <div className="flex flex-1 flex-col gap-6">
        <h1 className="text-2xl font-bold">{table.nama} — Pilih Menu</h1>
        {groups.map(([kategori, items]) => (
          <div key={kategori} className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-zinc-500">{kategori}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => addItemToCartAction(table.id, item.id))}
                  className="flex min-h-20 flex-col items-center justify-center gap-1 rounded-xl border border-zinc-300 p-3 text-center active:opacity-80 disabled:opacity-40 dark:border-zinc-700"
                >
                  <span className="text-base font-medium">{item.nama}</span>
                  <span className="text-sm text-zinc-500">{formatRupiah(item.harga)}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
        {menuItems.length === 0 && (
          <p className="text-lg text-zinc-500">Belum ada item menu aktif.</p>
        )}
      </div>

      <div className="flex w-full flex-col gap-4 lg:w-96">
        <h2 className="text-xl font-bold">Keranjang</h2>
        {cartItems.length === 0 ? (
          <p className="text-lg text-zinc-500">Keranjang masih kosong.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {cartItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-300 p-3 dark:border-zinc-700"
              >
                <div className="flex-1">
                  <p className="font-medium">{item.nama}</p>
                  <p className="text-sm text-zinc-500">{formatRupiah(item.subtotal)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => decrementCartItemAction(item.id, table.id))}
                    className="min-h-12 min-w-12 rounded-lg bg-zinc-200 text-lg font-bold disabled:opacity-40 dark:bg-zinc-800"
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-medium">{item.qty}</span>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => incrementCartItemAction(item.id, table.id))}
                    className="min-h-12 min-w-12 rounded-lg bg-zinc-200 text-lg font-bold disabled:opacity-40 dark:bg-zinc-800"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => removeCartItemAction(item.id, table.id))}
                    className="min-h-12 rounded-lg px-3 text-sm font-medium text-red-600 disabled:opacity-40"
                  >
                    Hapus
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between border-t border-zinc-300 pt-4 text-xl font-bold dark:border-zinc-700">
          <span>Total</span>
          <span>{formatRupiah(total)}</span>
        </div>

        {error && (
          <p role="alert" className="text-lg font-medium text-red-600">
            {error}
          </p>
        )}

        <Button
          type="button"
          disabled={pending || cartItems.length === 0}
          onClick={() => run(() => confirmOrderAction(table.id))}
        >
          Buat Order
        </Button>
      </div>
    </div>
  );
}

function groupByKategori(items: MenuItem[]): [string, MenuItem[]][] {
  const map = new Map<string, MenuItem[]>();
  for (const item of items) {
    const key = item.kategori?.trim() || "Lainnya";
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return Array.from(map.entries());
}
