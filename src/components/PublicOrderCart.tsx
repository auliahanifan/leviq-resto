"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Minus, Plus, UtensilsCrossed } from "lucide-react";
import {
  addItemToPublicCartAction,
  confirmPublicOrderAction,
  decrementPublicCartItemAction,
  incrementPublicCartItemAction,
} from "@/lib/public-order-actions";
import { Button } from "@/components/ui/Button";
import { formatRupiah } from "@/lib/format";
import { groupByKategori, type MenuItem } from "@/lib/menu";

type Table = { id: string; nama: string; status: string };
type CartItem = {
  id: string;
  menu_item_id: string | null;
  nama: string;
  harga: number;
  qty: number;
  subtotal: number;
};

type CartUpdate =
  | { type: "add"; menuItem: MenuItem }
  | { type: "increment"; id: string }
  | { type: "decrement"; id: string };

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
  }
}

export function PublicOrderCart({
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

  const groups = groupByKategori(menuItems);
  const kategoris = groups.map(([kategori]) => kategori);
  const [activeKategori, setActiveKategori] = useState<string>(kategoris[0] ?? "");
  const activeItems = groups.find(([kategori]) => kategori === activeKategori)?.[1] ?? [];

  const optimisticTotal = optimisticItems.reduce((sum, item) => sum + item.subtotal, 0);
  const optimisticCount = optimisticItems.reduce((sum, item) => sum + item.qty, 0);

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

  if (menuItems.length === 0) {
    return <p className="px-6 py-8 text-lg text-muted">Belum ada menu aktif.</p>;
  }

  return (
    <div className="flex flex-1 flex-col pb-28">
      <div className="flex gap-2 overflow-x-auto border-b border-border px-4 py-3">
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

      <ul className="flex flex-col gap-3 px-4 py-4">
        {activeItems.map((item) => {
          const cartItem = optimisticItems.find((ci) => ci.menu_item_id === item.id);
          const key = cartItem?.id ?? `menu-${item.id}`;
          const itemPending = pendingKeys.has(key) || key.startsWith("temp-");

          return (
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
                {!cartItem || cartItem.qty === 0 ? (
                  <button
                    type="button"
                    disabled={itemPending}
                    onClick={() =>
                      run(`menu-${item.id}`, { type: "add", menuItem: item }, () =>
                        addItemToPublicCartAction(table.id, item.id)
                      )
                    }
                    aria-label="Tambah"
                    className="flex min-h-12 min-w-12 items-center justify-center rounded-full bg-primary px-4 text-white disabled:opacity-40"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={itemPending}
                      onClick={() =>
                        run(cartItem.id, { type: "decrement", id: cartItem.id }, () =>
                          decrementPublicCartItemAction(cartItem.id, table.id)
                        )
                      }
                      aria-label="Kurangi"
                      className="flex min-h-12 min-w-12 items-center justify-center rounded-full bg-surface disabled:opacity-40"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center font-medium">{cartItem.qty}</span>
                    <button
                      type="button"
                      disabled={itemPending}
                      onClick={() =>
                        run(cartItem.id, { type: "increment", id: cartItem.id }, () =>
                          incrementPublicCartItemAction(cartItem.id, table.id)
                        )
                      }
                      aria-label="Tambah"
                      className="flex min-h-12 min-w-12 items-center justify-center rounded-full bg-primary text-white disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="fixed inset-x-0 bottom-0 mx-auto flex w-full max-w-lg flex-col gap-3 border-t border-border bg-background px-4 py-4">
        {error && (
          <p role="alert" className="text-base font-medium text-danger">
            {error}
          </p>
        )}
        <div className="flex items-center justify-between text-lg font-bold">
          <span>{optimisticCount} item</span>
          <span>{formatRupiah(optimisticTotal)}</span>
        </div>
        <Button
          type="button"
          disabled={isConfirming || optimisticItems.length === 0}
          onClick={() =>
            startConfirmTransition(async () => {
              const result = await confirmPublicOrderAction(table.id);
              setError(result?.error);
            })
          }
        >
          {isConfirming ? "Memproses..." : "Pesan Sekarang"}
        </Button>
      </div>
    </div>
  );
}
