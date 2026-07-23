# Task List: Implementasi Pesan Mandiri di Meja (Self-Order)

**Sumber:** [docs/PRD-pesan-mandiri.md](../PRD-pesan-mandiri.md)
**Tujuan:** Breakdown task implementasi fitur pesan mandiri, prioritas tinggi, dikerjakan di atas sistem kasir yang sudah live.
**Stack:** Next.js (App Router) + Supabase — sama dengan project existing (lihat [tasks.md](tasks.md) Fase 0).

Setiap task punya referensi FR-SO (Functional Requirement Self-Order) dari PRD bila relevan. Beberapa task menyentuh kode existing dari [tasks.md](tasks.md) (Fase 3 Kelola Menu, Fase 5 Order) — ditandai eksplisit karena ini perluasan, bukan proyek baru.

---

## Fase 0 — Setup Tambahan

- [x] 0.1 Tambah dependency generator QR code (misal `qrcode` atau `qrcode.react`) untuk generate QR client-side
- [x] 0.2 Buat bucket Supabase Storage untuk foto menu (misal `menu-photos`), set policy publik read-only, upload dibatasi lewat server action
- [x] 0.3 Tentukan base URL production untuk QR (dipakai untuk generate link `/order/[id-meja]`) — dipakai `window.location.origin` saat generate di browser kasir, otomatis ikut domain yang sedang diakses (production/preview), tanpa env var yang perlu dijaga manual

## Fase 1 — Skema Data (Perubahan)

- [x] 1.1 Migration: tambah kolom `foto_url` (text, nullable) dan `deskripsi` (text, nullable) ke `menu_items` — FR-SO6.1–6.3
- [x] 1.2 Verifikasi: migrasi berjalan tanpa error, 8 item menu existing tetap valid dengan `foto_url`/`deskripsi` = `null`

## Fase 2 — QR Code per Meja (FR-SO1.1–1.4)

- [x] 2.1 Tambah tombol "Lihat/Cetak QR" di halaman Kelola Meja (existing, extend dari Fase 4 tasks.md) untuk tiap baris meja
- [x] 2.2 Generate QR code (client-side) dari URL `/order/[id-meja]` memakai id meja yang sudah ada — FR-SO1.1
- [x] 2.3 Tampilan QR bisa diunduh/print-friendly (misal buka di halaman/modal terpisah yang layak diprint) — FR-SO1.2
- [ ] 2.4 Halaman `/order/[id-meja]` dengan id tidak valid/sudah dihapus menampilkan "Meja tidak ditemukan" (notFound) — FR-SO1.4 (dibangun bareng Fase 3, lihat 3.x)
- [ ] 2.5 Verifikasi: scan QR dari HP fisik mengarah ke halaman order meja yang benar; id acak/terhapus menampilkan halaman error (verifikasi browser bareng Fase 3; scan HP fisik ada di Fase 9)

## Fase 3 — Route Publik & Lihat Menu (FR-SO2.1–2.3, FR-SO1.3)

- [ ] 3.1 Buat route group baru di luar `(app)` (misal `src/app/order/[id]/page.tsx`) yang **tidak** dilindungi session/PIN — FR-SO1.3
- [ ] 3.2 Layout khusus mobile-first untuk route ini (terpisah dari `AppHeader`/layout tablet existing) — lihat asumsi 8.5 PRD
- [ ] 3.3 Fetch meja by id + daftar menu `is_active = true`, urut per kategori (pola query sama seperti `meja/[id]/page.tsx` existing tapi tanpa auth)
- [ ] 3.4 Tampilkan menu sebagai grid/list dengan nama, harga, foto (jika ada), deskripsi (jika ada) — FR-SO2.2
- [ ] 3.5 Item tanpa foto tampil dengan placeholder generik — FR-SO2.3
- [ ] 3.6 Filter/tab per kategori untuk navigasi menu di layar HP — FR-SO2.1
- [ ] 3.7 Verifikasi: halaman terbuka tanpa perlu login, menu tampil benar, filter kategori berfungsi

## Fase 4 — Keranjang & Submit Pelanggan (FR-SO3.1–3.4)

- [ ] 4.1 Server actions baru untuk alur pelanggan (**tanpa** `requireSession()`, berbeda dari `order-actions.ts` existing yang mensyaratkan PIN kasir) — misal `public-order-actions.ts`
- [ ] 4.2 Reuse logic "get or create draft order" untuk meja yang masih "kosong" (adaptasi dari `getOrCreateDraftOrder` existing, tanpa gating status meja "kosong" karena pelanggan yang memicu, bukan kasir)
- [ ] 4.3 Komponen keranjang mobile: tambah/kurangi qty/hapus item bebas sebelum submit — FR-SO3.1
- [ ] 4.4 Tombol "Pesan Sekarang" → transisi status order `draft` → `confirmed` otomatis (tanpa approval manual), meja → "Terisi" — FR-SO3.2
- [ ] 4.5 Layar konfirmasi setelah submit: ringkasan item & total — FR-SO3.3
- [ ] 4.6 Setelah submit, item order tsb tidak bisa diedit/dihapus lagi dari sisi pelanggan (hanya baca) — FR-SO3.4
- [ ] 4.7 Verifikasi: pelanggan bisa ubah keranjang bebas sebelum submit, submit mengunci item & mengubah status meja, layar konfirmasi tampil benar

## Fase 5 — Order Tambahan (FR-SO4.1–4.3, amandemen FR4.3)

- [ ] 5.1 Saat meja berstatus "Terisi" dengan order `confirmed` yang belum `paid`, `/order/[id-meja]` tetap bisa diakses untuk menambah item baru — FR-SO4.1
- [ ] 5.2 Server action "tambah item ke order aktif": insert `order_items` baru langsung ke `order_id` yang sudah `confirmed` (bukan bikin order baru), lalu update total order (pola sama seperti `adjustOrderTotal` existing) — FR-SO4.2
- [ ] 5.3 Pastikan action ini **hanya menambah item baru**, tidak mengizinkan edit/hapus item lama dari order `confirmed` tsb — sesuai batasan amandemen FR-SO4.3
- [ ] 5.4 UI pelanggan membedakan tampilan "menu tambahan" (meja sudah terisi) vs "keranjang awal" (meja masih kosong) secukupnya agar tidak membingungkan
- [ ] 5.5 Verifikasi: order tambahan berhasil menaikkan total order yang sama; halaman bayar & tutup kasir kasir tetap menghitung total dengan benar (regresi terhadap Fase 6 & 7 tasks.md existing)

## Fase 6 — Kontrol Kasir & Kompatibilitas (FR-SO5.1–5.2)

- [ ] 6.1 Uji ulang `cancelOrderAction` existing terhadap order yang sudah ditambah item dari pelanggan — pastikan tetap membatalkan seluruh order & mengembalikan meja ke "Kosong" — FR-SO5.1
- [ ] 6.2 Uji ulang `payOrderAction` existing terhadap order gabungan (kasir + pelanggan / beberapa ronde pesan tambahan) — total & kembalian tetap akurat — FR-SO5.2
- [ ] 6.3 Pastikan layar utama kasir (daftar meja) tidak butuh perubahan untuk menampilkan meja yang order-nya berasal dari pelanggan — tetap tampil "Terisi" seperti biasa
- [ ] 6.4 Verifikasi: alur end-to-end kasir (lihat meja terisi → bayar → tutup kasir) tidak berubah perilakunya walau order berasal dari `/order`

## Fase 7 — Manajemen Menu: Foto & Deskripsi (FR-SO6.1–6.3, perluasan Fase 3 tasks.md)

- [ ] 7.1 Extend form tambah/edit item menu (existing "Kelola Menu") dengan field upload foto (opsional) — FR-SO6.1
- [ ] 7.2 Extend form dengan field deskripsi singkat (opsional, textarea) — FR-SO6.2
- [ ] 7.3 Upload foto ke bucket Supabase Storage dari server action, simpan `foto_url` hasil upload ke `menu_items`
- [ ] 7.4 Validasi ukuran/format file wajar (misal maks 2MB, jpg/png/webp) di sisi form
- [ ] 7.5 Tampilkan thumbnail foto di list "Kelola Menu" existing agar kasir bisa cek hasil upload
- [ ] 7.6 Pastikan item tanpa foto/deskripsi tetap valid disimpan & tampil normal — FR-SO6.3
- [ ] 7.7 Verifikasi: upload foto baru, edit ganti foto, hapus/skip foto — semua tidak merusak data menu existing

## Fase 8 — Non-Functional & Polish

- [ ] 8.1 Uji tampilan `/order/[id-meja]` di viewport HP (portrait, berbagai ukuran layar umum) — beda dari optimasi tablet sisi kasir
- [ ] 8.2 Pastikan alur "scan QR → lihat menu → pesan" terasa cepat, minim loading blocking di koneksi HP/WiFi restoran
- [ ] 8.3 Bahasa Indonesia & format Rupiah konsisten dengan sisi kasir
- [ ] 8.4 Penanganan error dasar: koneksi terputus sementara, submit gagal (retry/pesan error jelas ke pelanggan)
- [ ] 8.5 Review keamanan dasar: route publik tidak mengekspos data selain meja & menu (tidak ada leak data kasir/PIN/settings)

## Fase 9 — Testing & Go-Live

- [ ] 9.1 Uji end-to-end: cetak QR → scan → pesan → pesan tambahan → kasir lihat & bayar → tutup kasir, semua total konsisten
- [ ] 9.2 Uji dengan data menu nyata (termasuk campuran item dengan & tanpa foto/deskripsi)
- [ ] 9.3 Uji di HP fisik asli (bukan cuma browser desktop/emulator) — cek scan QR, tampilan grid menu, submit order
- [ ] 9.4 Uji skenario 2 HP mengakses meja yang sama bersamaan (lihat asumsi 8.2 PRD) — pastikan tidak ada error fatal, hanya potensi race condition minor yang bisa diterima
- [ ] 9.5 Deploy ke production, pastikan QR yang dicetak memakai domain production yang benar
- [ ] 9.6 Sosialisasi ke kasir: cara cetak/tempel QR per meja, dan bahwa order dari pelanggan akan muncul otomatis di layar meja seperti order manual — aksi manusia, tidak bisa dikerjakan AI
- [ ] 9.7 Monitoring 1-2 minggu pertama: proporsi order lewat `/order` vs manual kasir, ada tidaknya selisih total vs tutup kasir (metrik di PRD §11 pesan-mandiri) — perlu pemakaian nyata dulu

---

## Catatan

- Fase 6 di dokumen ini adalah **verifikasi regresi** terhadap kode existing (Fase 5–7 di [tasks.md](tasks.md)), bukan fitur baru — fokusnya memastikan amandemen FR4.3 tidak merusak alur bayar/tutup kasir yang sudah jalan.
- Item di luar lingkup (§5 PRD-pesan-mandiri.md: login pelanggan, tombol panggil bayar, notifikasi real-time kasir, kitchen display, pembayaran online, varian menu, dsb.) **sengaja tidak masuk task list ini** — konsisten dengan keputusan interview.
- Sebelum mulai Fase 4–5, disarankan baca ulang `src/lib/order-actions.ts` existing karena beberapa action baru di sini adalah variasi tanpa `requireSession()` dari pola yang sudah ada di sana — jaga agar dua alur (kasir vs pelanggan) tidak saling tercampur aturannya.
