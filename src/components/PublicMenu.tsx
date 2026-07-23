"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/format";

export type PublicMenuItem = {
  id: string;
  nama: string;
  harga: number;
  kategori: string | null;
  foto_url: string | null;
  deskripsi: string | null;
};

function groupByKategori(items: PublicMenuItem[]): [string, PublicMenuItem[]][] {
  const map = new Map<string, PublicMenuItem[]>();
  for (const item of items) {
    const key = item.kategori?.trim() || "Lainnya";
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return Array.from(map.entries());
}

export function PublicMenu({ items }: { items: PublicMenuItem[] }) {
  const groups = groupByKategori(items);
  const kategoris = groups.map(([kategori]) => kategori);
  const [activeKategori, setActiveKategori] = useState<string>(kategoris[0] ?? "");

  if (items.length === 0) {
    return <p className="px-6 py-8 text-lg text-zinc-500">Belum ada menu aktif.</p>;
  }

  const activeItems = groups.find(([kategori]) => kategori === activeKategori)?.[1] ?? [];

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex gap-2 overflow-x-auto border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        {kategoris.map((kategori) => (
          <button
            key={kategori}
            type="button"
            onClick={() => setActiveKategori(kategori)}
            className={`min-h-12 shrink-0 rounded-full px-4 text-base font-medium ${
              kategori === activeKategori
                ? "bg-foreground text-background"
                : "bg-zinc-200 dark:bg-zinc-800"
            }`}
          >
            {kategori}
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-3 px-4 py-4">
        {activeItems.map((item) => (
          <li
            key={item.id}
            className="flex gap-3 rounded-xl border border-zinc-300 p-3 dark:border-zinc-700"
          >
            {item.foto_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.foto_url}
                alt={item.nama}
                className="h-20 w-20 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-zinc-200 text-3xl dark:bg-zinc-800">
                🍽️
              </div>
            )}
            <div className="flex flex-1 flex-col gap-1">
              <p className="font-medium">{item.nama}</p>
              {item.deskripsi && (
                <p className="text-sm text-zinc-500">{item.deskripsi}</p>
              )}
              <p className="font-medium">{formatRupiah(item.harga)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
