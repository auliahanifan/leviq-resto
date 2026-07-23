"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Minus, Plus } from "lucide-react";
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
  menu_item_id: string | null;
  nama: string;
  harga: number;
  qty: number;
  subtotal: number;
};
type MenuItem = { id: string; nama: string; harga: number; kategori: string | null };

type CartUpdate =
  | { type: "add"; menuItem: MenuItem }
  | { type: "increment"; id: string }
  | { type: "decrement"; id: string }
  | { type: "remove"; id: string };

function applyOptimisticUpdate(items: CartItem[], update: CartUpdate): CartItem[] {
  switch (update.type) {
    case "add": {
      const existing = items.find((item) => item.menu_item_id === update.menuItem.id);
      if (existing) {
        const qty = existing.qty + 1;
        return items.map((item) =>
          item.id === existing.id ? { ...item, qty, subtotal: qty * item.harga } : item
        );
      }
      return [
        ...items,
        {
          id: `temp-${update.menuItem.id}`,
          menu_item_id: update.menuItem.id,
          nama: update.menuItem.nama,
          harga: update.menuItem.harga,
          qty: 1,
          subtotal: update.menuItem.harga,
        },
      ];
    }
    case "increment":
      return items.map((item) =>
        item.id === update.id
          ? { ...item, qty: item.qty + 1, subtotal: (item.qty + 1) * item.harga }
          : item
      );
    case "decrement":
      return items
        .map((item) =>
          item.id === update.id
            ? { ...item, qty: item.qty - 1, subtotal: (item.qty - 1) * item.harga }
            : item
        )
        .filter((item) => item.qty > 0);
    case "remove":
      return items.filter((item) => item.id !== update.id);
  }
}

export function OrderCart({
  table,
  cartItems,
  menuItems,
}: {
  table: Table;
  cartItems: CartItem[];
  menuItems: MenuItem[];
}) {
  const [isConfirming, startConfirmTransition] = useTransition();
  const [, startCartTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());
  const [optimisticItems, applyOptimistic] = useOptimistic(cartItems, applyOptimisticUpdate);

  const optimisticTotal = optimisticItems.reduce((sum, item) => sum + item.subtotal, 0);

  function run(
    key: string,
    update: CartUpdate,
    action: () => Promise<{ error?: string } | undefined>
  ) {
    setPendingKeys((prev) => new Set(prev).add(key));
    startCartTransition(async () => {
      applyOptimistic(update);
      const result = await action();
      setError(result?.error);
      setPendingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    });
  }

  const groups = groupByKategori(menuItems);

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8 lg:flex-row">
      <div className="flex flex-1 flex-col gap-6">
        <h1 className="text-2xl font-bold">{table.nama} — Pilih Menu</h1>
        {groups.map(([kategori, items]) => (
          <div key={kategori} className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-muted">{kategori}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={pendingKeys.has(`menu-${item.id}`)}
                  onClick={() =>
                    run(`menu-${item.id}`, { type: "add", menuItem: item }, () =>
                      addItemToCartAction(table.id, item.id)
                    )
                  }
                  className="flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl border border-border p-3 text-center active:bg-surface disabled:opacity-40"
                >
                  <span className="text-base font-medium">{item.nama}</span>
                  <span className="text-sm text-muted">{formatRupiah(item.harga)}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
        {menuItems.length === 0 && (
          <p className="text-lg text-muted">Belum ada item menu aktif.</p>
        )}
      </div>

      <div className="flex w-full flex-col gap-4 lg:w-96">
        <h2 className="text-xl font-bold">Keranjang</h2>
        {optimisticItems.length === 0 ? (
          <p className="text-lg text-muted">Keranjang masih kosong.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {optimisticItems.map((item) => {
              const itemPending = pendingKeys.has(item.id) || item.id.startsWith("temp-");
              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.nama}</p>
                    <p className="text-sm text-muted">{formatRupiah(item.subtotal)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={itemPending}
                      onClick={() =>
                        run(item.id, { type: "decrement", id: item.id }, () =>
                          decrementCartItemAction(item.id, table.id)
                        )
                      }
                      aria-label="Kurangi"
                      className="flex min-h-12 min-w-12 items-center justify-center rounded-full bg-surface disabled:opacity-40"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center font-medium">{item.qty}</span>
                    <button
                      type="button"
                      disabled={itemPending}
                      onClick={() =>
                        run(item.id, { type: "increment", id: item.id }, () =>
                          incrementCartItemAction(item.id, table.id)
                        )
                      }
                      aria-label="Tambah"
                      className="flex min-h-12 min-w-12 items-center justify-center rounded-full bg-primary text-white disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={itemPending}
                      onClick={() =>
                        run(item.id, { type: "remove", id: item.id }, () =>
                          removeCartItemAction(item.id, table.id)
                        )
                      }
                      className="min-h-12 rounded-full px-3 text-sm font-medium text-danger disabled:opacity-40"
                    >
                      Hapus
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex items-center justify-between border-t border-border pt-4 text-xl font-bold">
          <span>Total</span>
          <span>{formatRupiah(optimisticTotal)}</span>
        </div>

        {error && (
          <p role="alert" className="text-lg font-medium text-danger">
            {error}
          </p>
        )}

        <Button
          type="button"
          disabled={isConfirming || optimisticItems.length === 0}
          onClick={() =>
            startConfirmTransition(async () => {
              const result = await confirmOrderAction(table.id);
              setError(result?.error);
            })
          }
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
