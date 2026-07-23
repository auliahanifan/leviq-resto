export type MenuItem = {
  id: string;
  nama: string;
  harga: number;
  kategori: string | null;
  foto_url: string | null;
  deskripsi: string | null;
};

export function groupByKategori(items: MenuItem[]): [string, MenuItem[]][] {
  const map = new Map<string, MenuItem[]>();
  for (const item of items) {
    const key = item.kategori?.trim() || "Lainnya";
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return Array.from(map.entries());
}
