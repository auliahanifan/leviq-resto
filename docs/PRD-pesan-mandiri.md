# PRD: LeviqResto — Pesan Mandiri di Meja (Self-Order)

**Status:** Draft v1
**Tanggal:** 2026-07-23
**Pemilik produk:** Aulia (Owner LeviqResto)
**Terkait:** [PRD Kasir/POS](PRD.md) — dokumen ini adalah fitur tambahan (Fase 2) di atas sistem kasir yang sudah live.

---

## 1. Latar Belakang & Masalah

Sistem kasir (POS) LeviqResto sudah berjalan: kasir input semua pesanan dan pembayaran dari satu titik. Namun ini berarti pelanggan harus memanggil kasir/pelayan setiap kali ingin memesan, yang bisa memperlambat proses saat restoran sibuk dan menambah beban kasir untuk mencatat pesanan secara manual dari meja.

Solusinya: pelanggan bisa memesan langsung dari meja masing-masing lewat HP mereka sendiri, sementara pembayaran tetap dilakukan di kasir seperti sekarang (tidak ada pembayaran online).

## 2. Tujuan (Goals)

1. Pelanggan bisa memesan sendiri dari meja tanpa menunggu kasir/pelayan datang.
2. Mengurangi beban input manual kasir untuk pesanan awal — kasir fokus ke penyiapan pesanan & pembayaran.
3. Tetap satu sumber data dengan sistem kasir yang sudah ada (meja, menu, order, total penjualan, tutup kasir tidak berubah alurnya).
4. Live secepatnya, prioritas tinggi, menyusul sistem kasir yang sudah jalan.

## 3. Target Pengguna

- **Pelanggan (baru)** — mengakses `/order/[id-meja]` lewat scan QR code di mejanya sendiri. Tanpa akun, tanpa login. Menggunakan HP pribadi masing-masing.
- **Kasir (existing)** — tetap seperti PRD sebelumnya: memproses pembayaran, tutup kasir, kelola menu & meja. Ditambah: bisa generate/cetak QR meja, dan mengunggah foto/deskripsi menu.

## 4. Lingkup MVP (In Scope)

| # | Fitur | Deskripsi Singkat |
|---|---|---|
| 1 | QR Code per Meja | Setiap meja punya QR unik menuju `/order/[id-meja]`, digenerate & ditampilkan dari halaman Kelola Meja kasir |
| 2 | Lihat Menu (Pelanggan) | Pelanggan lihat daftar menu aktif: nama, harga, kategori, foto & deskripsi (opsional) |
| 3 | Keranjang & Pesan (Pelanggan) | Pelanggan tambah/kurang item, lalu submit — order langsung final otomatis (tanpa approval kasir) |
| 4 | Order Tambahan | Selama meja belum dibayar, pelanggan bisa buka `/order/[id-meja]` lagi dan menambah item baru ke order yang sama |
| 5 | Kontrol Kasir | Kasir tetap bisa membatalkan seluruh order (termasuk yang berasal dari pelanggan) sebelum dibayar |
| 6 | Foto & Deskripsi Menu | Kasir bisa unggah foto & isi deskripsi singkat per item menu dari Kelola Menu (opsional, tidak wajib) |

## 5. Di Luar Lingkup MVP (Out of Scope)

- Login/akun pelanggan — akses murni lewat link QR meja, tanpa identitas personal
- Tombol "Panggil Kasir untuk Bayar" — pelanggan datang langsung ke kasir seperti kebiasaan dine-in biasa
- Notifikasi/badge real-time ke kasir saat ada order baru masuk — kasir cukup refresh/lihat berkala seperti sekarang
- Status progres per item ke dapur (misal "sedang dimasak", "siap disajikan") — tidak ada kitchen display di MVP ini
- Pembayaran online/QRIS di dalam aplikasi — pembayaran tetap 100% di kasir, tidak berubah dari PRD sebelumnya
- Kustomisasi/varian menu (topping, level, catatan khusus per item) — konsisten dengan out-of-scope PRD sebelumnya
- Rating/ulasan menu, riwayat pesanan pelanggan, multi-bahasa
- Batasi jumlah device yang bisa akses satu meja bersamaan — diasumsikan wajar untuk 1-10 meja skala kecil

## 6. Alur Pengguna Utama (User Flow)

### 6.1 Setup QR Meja (Kasir)
1. Kasir buka halaman Kelola Meja (existing) → tiap meja punya tombol "Lihat/Cetak QR".
2. QR mengarah ke `https://<domain>/order/[id-meja]` — ditempel/dicetak di meja fisik.

### 6.2 Pelanggan Memesan
1. Pelanggan scan QR di mejanya → terbuka `/order/[id-meja]` di HP masing-masing.
2. Melihat daftar menu (nama, harga, foto/deskripsi jika ada), difilter per kategori.
3. Menambah item ke keranjang, bebas ubah qty/hapus sebelum submit.
4. Tekan "Pesan Sekarang" → order langsung berstatus final (`confirmed`), meja otomatis jadi "Terisi", pelanggan melihat layar konfirmasi (ringkasan item & total).

### 6.3 Pesan Tambahan
1. Selama meja masih "Terisi" dan belum dibayar, pelanggan bisa buka lagi `/order/[id-meja]`.
2. Menambah item baru → item ini langsung digabung ke order yang sudah aktif untuk meja tsb (bukan order terpisah), total ikut bertambah.

### 6.4 Sisi Kasir (Tidak Berubah)
1. Kasir melihat meja "Terisi" di layar utama seperti biasa (baik dari order manual kasir maupun dari pelanggan — tidak ada bedanya).
2. Kasir tetap bisa membatalkan seluruh order (jaring pengaman salah pesan) sebelum bayar.
3. Proses bayar & tutup kasir mengikuti alur existing tanpa perubahan.

## 7. Functional Requirements

### 7.1 Akses & QR Meja
- FR-SO1.1: Setiap baris di tabel `tables` memiliki QR code yang di-generate dari id-nya, mengarah ke `/order/[id-meja]`.
- FR-SO1.2: QR dapat dilihat/diunduh/dicetak dari halaman Kelola Meja oleh kasir.
- FR-SO1.3: `/order/[id-meja]` dapat diakses publik tanpa login/PIN.
- FR-SO1.4: Jika id-meja tidak valid/sudah dihapus, tampilkan halaman "Meja tidak ditemukan".

### 7.2 Lihat Menu (Pelanggan)
- FR-SO2.1: Pelanggan melihat seluruh menu dengan `is_active = true`, dikelompokkan per kategori.
- FR-SO2.2: Setiap item menampilkan nama, harga, foto (jika ada), deskripsi (jika ada).
- FR-SO2.3: Item tanpa foto ditampilkan dengan placeholder generik — tidak memengaruhi validitas item.

### 7.3 Keranjang & Submit (Pelanggan)
- FR-SO3.1: Pelanggan bebas tambah/kurangi qty/hapus item di keranjang sebelum submit.
- FR-SO3.2: Menekan "Pesan Sekarang" langsung mengubah status order menjadi `confirmed` (tanpa approval manual kasir) dan status meja menjadi "Terisi".
- FR-SO3.3: Setelah submit, pelanggan melihat layar konfirmasi berisi ringkasan item & total.
- FR-SO3.4: Item yang sudah disubmit tidak bisa diedit/dihapus lagi oleh pelanggan (hanya bisa ditambah lewat order baru, lihat 7.4).

### 7.4 Order Tambahan
- FR-SO4.1: Jika meja sudah memiliki order `confirmed` yang belum dibayar, pelanggan tetap bisa membuka `/order/[id-meja]` dan menambah item baru.
- FR-SO4.2: Item baru digabungkan (insert `order_items` baru) ke order `confirmed` yang sudah ada untuk meja tsb — bukan membuat order baru terpisah. Total order diperbarui otomatis.
- FR-SO4.3: **Amandemen terhadap FR4.3 PRD sebelumnya** — sebelumnya order `confirmed` sama sekali tidak bisa diubah. Sekarang diizinkan **menambah item baru** ke order `confirmed` (dari pelanggan maupun kasir), tapi **tidak mengubah/menghapus item yang sudah ada** di order tsb.

### 7.5 Kontrol Kasir
- FR-SO5.1: Kasir tetap bisa membatalkan seluruh order (FR4.5 existing) yang berasal dari atau ditambah oleh pelanggan, selama belum dibayar.
- FR-SO5.2: Tidak ada perbedaan pemrosesan pembayaran/tutup kasir antara order dari kasir vs dari pelanggan — semua tercatat sama sebagai transaksi.

### 7.6 Manajemen Menu — Foto & Deskripsi
- FR-SO6.1: Kasir dapat mengunggah 1 foto per item menu dari halaman Kelola Menu (opsional).
- FR-SO6.2: Kasir dapat mengisi deskripsi singkat per item menu (opsional).
- FR-SO6.3: Foto & deskripsi tidak wajib — item menu lama/baru tanpa keduanya tetap valid dan tampil normal ke pelanggan.

## 8. Asumsi & Pertanyaan Terbuka

1. **8.1 Tanpa login pelanggan** — `/order/[id-meja]` publik, siapa pun yang memegang link/QR meja bisa mengakses & memesan. Diasumsikan risiko rendah karena QR fisik hanya ada di meja restoran.
2. **8.2 Beberapa HP di meja yang sama** — Jika lebih dari satu pelanggan di meja yang sama membuka `/order/[id-meja]` bersamaan, keduanya melihat/mengedit keranjang (draft) yang sama untuk meja tsb. Kemungkinan race condition minor saat submit hampir bersamaan diasumsikan dapat diterima untuk skala kecil (1-10 meja), tidak perlu locking khusus di MVP.
3. **8.3 Foto disimpan di Supabase Storage** — foto menu diasumsikan disimpan via Supabase Storage (konsisten dengan stack existing), dengan batas ukuran file wajar (misal maks 2MB) agar tidak lambat di HP pelanggan.
4. **8.4 Tanpa notifikasi kasir** — konsisten dengan asumsi 8.4 PRD sebelumnya (1 tablet, tanpa sinkronisasi real-time ketat); kasir melihat order baru lewat refresh/tampilan meja seperti biasa.
5. **8.5 Desain mobile-first khusus untuk `/order`** — berbeda dari sisi kasir yang dioptimalkan untuk tablet, halaman `/order/[id-meja]` perlu dioptimalkan untuk layar HP (portrait, satu tangan).

## 9. Non-Functional Requirements

- **Platform:** Web app, halaman `/order/[id-meja]` dioptimalkan untuk layar HP pelanggan (mobile-first), terpisah dari UI kasir yang dioptimalkan untuk tablet.
- **Konektivitas:** Mengasumsikan WiFi restoran tersedia untuk pelanggan (atau data seluler pelanggan sendiri); tidak perlu mode offline.
- **Bahasa & mata uang:** Bahasa Indonesia, Rupiah (Rp) tanpa desimal — konsisten dengan sisi kasir.
- **Kecepatan:** Alur "scan QR → lihat menu → pesan" harus terasa instan di HP pelanggan, minim loading blocking.

## 10. Pertimbangan Teknis (Rekomendasi, Bukan Keputusan Final)

- Reuse skema data existing (`tables`, `menu_items`, `orders`, `order_items`) — tidak perlu tabel baru untuk order pelanggan itu sendiri.
- Tambah kolom opsional di `menu_items`: `foto_url` (text, nullable), `deskripsi` (text, nullable).
- Route `/order/[id-meja]` sebaiknya berada di luar route group `(app)` yang saat ini dilindungi PIN, karena harus bisa diakses publik tanpa login.
- Generate QR code bisa dilakukan client-side (library QR generator) dari URL meja, tanpa perlu backend khusus.
- Logic "tambah ke order yang sama" (FR-SO4.2): saat pelanggan submit dan meja sudah punya order `confirmed` yang belum `paid`, insert `order_items` baru ke `order_id` yang sama alih-alih membuat order baru.

## 11. Metrik Keberhasilan

- Mayoritas pesanan (target awal: >50% dalam 2 minggu pertama) masuk lewat `/order` tanpa perlu dicatatkan manual oleh kasir.
- Tidak ada keluhan pelanggan terkait kebingungan alur pesan mandiri dalam 1 minggu pertama pemakaian.
- Tidak ada selisih data antara total order dari pelanggan vs total yang muncul di tutup kasir.

## 12. Ringkasan Keputusan dari Interview

| Topik | Keputusan |
|---|---|
| Identifikasi meja | QR code unik per meja → `/order/[id-meja]` |
| Konfirmasi order | Langsung final otomatis begitu pelanggan submit, tanpa approval kasir |
| Order tambahan | Bisa berkali-kali selama belum dibayar, digabung ke order `confirmed` yang sama (amandemen FR4.3) |
| Notifikasi kasir | Tidak perlu — refresh manual seperti biasa |
| Foto & deskripsi menu | Perlu, tapi opsional (tidak wajib per item) |
| Kontrol kasir | Kasir tetap bisa batalkan seluruh order pelanggan sebelum bayar |
| Panggil bayar | Tidak ada tombol — pelanggan datang langsung ke kasir |
| Pembayaran | Tetap 100% di kasir, tidak berubah dari PRD sebelumnya |
| Timeline | Secepatnya, prioritas tinggi |
