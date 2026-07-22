# Task List: Implementasi LeviqResto POS (MVP)

**Sumber:** [docs/PRD.md](../PRD.md)
**Tujuan:** Breakdown task implementasi MVP, live < 1 bulan.
**Stack asumsi (sesuai rekomendasi PRD §10):** Next.js (React) + Supabase (DB, auth sederhana, hosting).

Setiap task punya referensi FR (Functional Requirement) dari PRD bila relevan. Urutan fase mengikuti dependency teknis (setup → data model → fitur inti → fitur pendukung → polish → deploy).

---

## Fase 0 — Setup Project

- [x] 0.1 Inisialisasi project Next.js (TypeScript, App Router)
- [x] 0.2 Setup Supabase project (buat project, catat URL & anon key)
- [x] 0.3 Setup koneksi Supabase client di Next.js (env vars, client helper)
- [x] 0.4 Setup styling/UI kit dioptimalkan untuk tablet (touch target besar) — pilih Tailwind/komponen dasar
- [x] 0.5 Setup deployment pipeline (misal Vercel) tersambung ke repo, auto-deploy dari branch main
- [x] 0.6 Konfigurasi dasar: bahasa Indonesia, format mata uang Rupiah tanpa desimal (util formatter)

## Fase 1 — Skema Data (Database)

- [x] 1.1 Tabel `settings` (PIN kasir tunggal, tersimpan aman/hash)
- [x] 1.2 Tabel `tables` (meja): id, nama/nomor, status (`kosong` | `terisi`)
- [x] 1.3 Tabel `menu_items`: id, nama, harga, kategori (opsional), is_active/deleted
- [x] 1.4 Tabel `orders`: id, table_id, status (`draft`/keranjang, `confirmed`, `paid`, `cancelled`), total, created_at, paid_at, payment_method
- [x] 1.5 Tabel `order_items`: id, order_id, menu_item_id, nama & harga snapshot (agar histori tidak berubah jika harga menu diedit belakangan), qty, subtotal
- [x] 1.6 Tabel `cash_closings` (tutup kasir): id, periode_mulai, periode_selesai, total_tunai, total_kartu, uang_fisik, selisih, created_at
- [x] 1.7 Review relasi & constraint dasar (foreign key, enum status)
- [x] 1.8 Verifikasi: migrasi berjalan tanpa error di Supabase, seed data dummy untuk testing

## Fase 2 — Autentikasi PIN (FR1.1–FR1.2)

- [x] 2.1 Halaman login dengan input PIN 4 digit (numeric keypad besar untuk tablet)
- [x] 2.2 Logic validasi PIN terhadap `settings` (FR1.1: satu PIN untuk semua akses)
- [x] 2.3 Tampilkan pesan error saat PIN salah, tanpa limit percobaan (FR1.2)
- [x] 2.4 Session/local auth state setelah login berhasil (redirect ke daftar meja)
- [ ] 2.5 Halaman/opsi untuk mengubah PIN (agar tidak hard-coded selamanya)
- [ ] 2.6 Verifikasi: login sukses dengan PIN benar, gagal dengan PIN salah, session bertahan saat refresh

## Fase 3 — Manajemen Menu (FR2.1–FR2.4)

- [ ] 3.1 Halaman "Kelola Menu": list semua item menu
- [ ] 3.2 Form tambah item baru (nama wajib, harga wajib, kategori opsional) — FR2.1
- [ ] 3.3 Form edit item menu (nama/harga/kategori) — FR2.2
- [ ] 3.4 Aksi hapus item menu (dengan konfirmasi) — FR2.3
- [ ] 3.5 Pastikan harga tetap tanpa varian, tidak ada field ukuran/topping (FR2.4)
- [ ] 3.6 Verifikasi: CRUD menu berfungsi, validasi field wajib, hapus tidak merusak order lama (pakai snapshot dari 1.5)

## Fase 4 — Manajemen Meja (FR3.1–FR3.2)

- [ ] 4.1 Halaman utama: grid/daftar meja dengan status visual (Kosong/Terisi) — FR3.1
- [ ] 4.2 Pengaturan meja: tambah/hapus meja secara bebas (bukan hard-coded, sesuai asumsi 8.2)
- [ ] 4.3 Logic auto-update status meja mengikuti siklus order (FR3.2)
- [ ] 4.4 Verifikasi: tambah/hapus meja tercermin di halaman utama, status berubah otomatis saat order dibuat/lunas

## Fase 5 — Order per Meja (FR4.1–FR4.5)

- [ ] 5.1 Tap meja kosong → buka halaman keranjang order untuk meja tsb (FR4.1: hanya meja kosong)
- [ ] 5.2 Tambah item ke keranjang dari daftar menu (dengan kategori/filter jika perlu)
- [ ] 5.3 Ubah qty / hapus item selama masih di tahap keranjang (FR4.2)
- [ ] 5.4 Hitung total otomatis (harga × qty, tanpa pajak/diskon) — FR4.4
- [ ] 5.5 Tombol "Buat Order" → order berubah status `confirmed`, item terkunci (tidak bisa edit parsial) — FR4.3
- [ ] 5.6 Setelah order dibuat, status meja otomatis jadi "Terisi"
- [ ] 5.7 Tap meja terisi → tampilkan ringkasan order & total (view read-only untuk item)
- [ ] 5.8 Tombol "Batalkan Order" pada order yang belum dibayar → status `cancelled`, meja kembali "Kosong", tidak dihitung sebagai penjualan (FR4.5)
- [ ] 5.9 Verifikasi: alur pilih meja → tambah/kurang item → buat order → item terkunci; batalkan order mengembalikan meja ke kosong dan tidak muncul di rekap penjualan

## Fase 6 — Pembayaran (FR5.1–FR5.4)

- [ ] 6.1 Dari ringkasan order (meja terisi), tombol pilih metode bayar: Tunai / Kartu (FR5.1)
- [ ] 6.2 Alur Tunai: input jumlah uang diterima → hitung & tampilkan kembalian otomatis, validasi jumlah ≥ total (FR5.2)
- [ ] 6.3 Alur Kartu: konfirmasi langsung sebagai lunas tanpa integrasi EDC (FR5.3)
- [ ] 6.4 Setelah konfirmasi bayar: order jadi `paid`, meja kembali "Kosong", order tidak bisa dibuka/diubah lagi kecuali dilihat sebagai riwayat (FR5.4)
- [ ] 6.5 Tampilan struk digital ringkas di layar (bukan cetak fisik, sesuai out-of-scope)
- [ ] 6.6 Verifikasi: pembayaran tunai dengan input kurang dari total ditolak, kembalian terhitung benar; pembayaran kartu langsung lunas; meja balik kosong di kedua kasus

## Fase 7 — Tutup Kasir (FR6.1–FR6.4)

- [ ] 7.1 Halaman "Tutup Kasir": hitung total tunai & kartu sejak tutup kasir terakhir (FR6.1)
- [ ] 7.2 Input jumlah uang fisik di laci (FR6.2)
- [ ] 7.3 Hitung & tampilkan selisih (uang fisik − total tunai tercatat) (FR6.3)
- [ ] 7.4 Simpan sesi tutup kasir sebagai riwayat: tanggal/waktu, total tunai, total kartu, uang fisik, selisih (FR6.4)
- [ ] 7.5 Halaman riwayat tutup kasir (list sesi-sesi sebelumnya)
- [ ] 7.6 Verifikasi: total tunai/kartu di periode berjalan akurat dibanding order yang lunas; sesi baru hanya menghitung transaksi setelah tutup kasir terakhir

## Fase 8 — Non-Functional & Polish

- [ ] 8.1 Optimasi UI untuk tablet: tombol/target besar, minim ketikan manual (angka besar untuk PIN & pembayaran)
- [ ] 8.2 Pastikan semua teks berbahasa Indonesia dan format Rupiah konsisten (tanpa desimal)
- [ ] 8.3 Uji alur "pilih meja → order → bayar" agar terasa cepat (minim langkah, minim loading blocking)
- [ ] 8.4 Penanganan error dasar (koneksi terputus sementara, karena diasumsikan WiFi stabil tanpa mode offline)
- [ ] 8.5 Review keamanan dasar: PIN tidak tersimpan plain text, akses halaman dilindungi session login

## Fase 9 — Testing & Go-Live

- [ ] 9.1 Uji end-to-end seluruh alur utama (login → kelola menu → kelola meja → order → bayar → tutup kasir)
- [ ] 9.2 Uji dengan data realistis (semua item menu restoran, jumlah meja aktual 1-10)
- [ ] 9.3 Uji di perangkat tablet asli (bukan cuma browser desktop) — cek ukuran tombol & responsivitas
- [ ] 9.4 Deploy ke production, sambungkan domain/URL yang dipakai di tablet restoran
- [ ] 9.5 Pelatihan singkat kasir menggunakan aplikasi (walkthrough semua fitur)
- [ ] 9.6 Monitoring 1 minggu pertama pemakaian: pastikan 0% kembali ke nota manual, tutup kasir < 5 menit, tidak ada data transaksi hilang (metrik di PRD §11)

---

## Catatan

- Item di luar lingkup (§5 PRD: stok, laporan lanjutan, multi-role, cetak struk, varian menu, pajak/diskon, split bill, mode offline, payment gateway otomatis, multi-outlet, edit parsial order) **sengaja tidak masuk task list ini** — kandidat roadmap fase 2.
- Asumsi di §8 PRD (jumlah meja fleksibel, kartu dicatat manual, 1 tablet/sesi, tanpa pencarian riwayat transaksi individual) sudah tercermin di task terkait; konfirmasi ulang ke pemilik produk jika ada perubahan sebelum/selama development.
