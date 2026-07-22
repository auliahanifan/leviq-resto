# PRD: LeviqResto — Aplikasi Kasir (POS)

**Status:** Draft v1
**Tanggal:** 2026-07-22
**Pemilik produk:** Aulia (Owner LeviqResto)

---

## 1. Latar Belakang & Masalah

LeviqResto adalah restoran dine-in dengan 1 outlet, skala kecil (1-10 meja). Saat ini seluruh proses transaksi masih manual (nota tulis tangan/kalkulator), yang berisiko:

- Salah hitung total pesanan
- Sulit merekap penjualan harian
- Tidak ada jejak/riwayat transaksi yang rapi
- Rekonsiliasi uang kas di akhir hari memakan waktu dan rawan selisih tanpa catatan pembanding

## 2. Tujuan (Goals)

1. Mengganti pencatatan manual dengan aplikasi kasir digital berbasis web yang dijalankan di tablet.
2. Mempercepat proses input pesanan dan pembayaran per meja.
3. Menyediakan rekap kas otomatis di akhir shift/hari untuk mencocokkan uang fisik dengan catatan sistem.
4. Live dalam waktu **< 1 bulan** sebagai MVP yang benar-benar minim namun fungsional.

## 3. Target Pengguna

- **Kasir** — satu-satunya peran pengguna di MVP ini. Kasir bertugas: input pesanan per meja, memproses pembayaran, mengelola data menu, dan melakukan tutup kasir di akhir shift.

Tidak ada peran terpisah untuk pelayan/dapur/owner di MVP ini — kasir adalah satu titik input tunggal (single point of sale), sesuai kondisi 1 outlet kecil dengan kasir tunggal.

## 4. Lingkup MVP (In Scope)

| # | Fitur | Deskripsi Singkat |
|---|---|---|
| 1 | Login PIN | Layar login dengan PIN 4 digit sebelum masuk ke aplikasi |
| 2 | Manajemen Menu | Kasir dapat tambah/edit/hapus item menu (nama, harga, kategori) langsung dari aplikasi |
| 3 | Manajemen Meja | Daftar meja (1-10), status kosong/terisi |
| 4 | Order per Meja | Pilih meja → pilih item menu → buat order |
| 5 | Pembayaran | Tunai (dengan hitung kembalian) atau kartu debit/kredit (dicatat, diproses via EDC terpisah) |
| 6 | Batalkan Order | Kasir dapat membatalkan seluruh order (sebelum dibayar) sebagai jaring pengaman salah input |
| 7 | Tutup Kasir | Input jumlah uang fisik di akhir shift, sistem bandingkan dengan total transaksi tunai tercatat |

## 5. Di Luar Lingkup MVP (Out of Scope)

Fitur berikut **sengaja tidak dikerjakan dulu** agar MVP tetap ringkas dan bisa live <1 bulan:

- Manajemen stok/inventory bahan baku
- Laporan & analitik lanjutan (menu terlaris, tren penjualan, dsb.) — MVP hanya menampilkan total penjualan harian dari proses tutup kasir
- Multi-role (pelayan, dapur/kitchen display, admin/owner terpisah)
- Cetak struk fisik (printer thermal) — struk cukup ditampilkan di layar
- Varian menu (ukuran, level, topping/add-on berbayar)
- Pajak (PPN) dan service charge otomatis
- Diskon/promo
- Split bill
- Mode offline / sinkronisasi tanpa internet
- Integrasi payment gateway (QRIS otomatis, dsb.) — QRIS/kartu diproses di alat terpisah, aplikasi hanya mencatat metode pembayaran
- Multi-outlet
- Edit/hapus item dari order yang sudah dibuat (lihat asumsi di bagian 8)

Bagian ini bisa jadi bahan roadmap fase 2 setelah MVP berjalan dan kebutuhan nyata terlihat.

## 6. Alur Pengguna Utama (User Flow)

### 6.1 Login
1. Kasir buka aplikasi di tablet → layar login PIN.
2. Masukkan PIN 4 digit → masuk ke layar utama (daftar meja).

### 6.2 Membuat Order
1. Dari layar utama, kasir memilih meja yang berstatus "kosong".
2. Kasir menambahkan item menu ke keranjang (bisa tambah/kurang jumlah, hapus item — bebas diubah selama masih di tahap keranjang).
3. Kasir menekan "Buat Order" → order tersimpan sebagai final untuk meja tersebut, status meja berubah jadi "terisi", item tidak bisa diubah lagi (lihat asumsi 8.1).

### 6.3 Pembayaran
1. Kasir membuka meja yang sedang "terisi" → melihat ringkasan order & total.
2. Kasir memilih metode bayar: **Tunai** (input jumlah uang diterima → sistem hitung kembalian) atau **Kartu** (dicatat sebagai lunas, proses kartu dilakukan di mesin EDC terpisah).
3. Setelah dikonfirmasi bayar, order berstatus "lunas", meja kembali berstatus "kosong".

### 6.4 Kelola Menu
1. Kasir masuk ke halaman "Kelola Menu" dari layar utama.
2. Bisa tambah item baru (nama, harga, kategori opsional), edit item ada, atau hapus item.

### 6.5 Tutup Kasir
1. Di akhir shift/hari, kasir membuka menu "Tutup Kasir".
2. Sistem menampilkan total transaksi tunai & kartu sejak tutup kasir terakhir.
3. Kasir input jumlah uang fisik yang ada di laci.
4. Sistem menampilkan selisih (jumlah fisik − total tunai tercatat) dan mencatatnya sebagai riwayat tutup kasir.

## 7. Functional Requirements

### 7.1 Autentikasi
- FR1.1: Sistem menyediakan 1 PIN 4 digit yang berlaku untuk semua akses (bukan akun per individu).
- FR1.2: PIN salah menampilkan pesan error, tidak ada limit percobaan khusus di MVP.

### 7.2 Manajemen Menu
- FR2.1: Kasir dapat membuat item menu baru dengan field: nama (wajib), harga (wajib), kategori (opsional).
- FR2.2: Kasir dapat mengedit nama/harga/kategori item menu yang sudah ada.
- FR2.3: Kasir dapat menghapus item menu.
- FR2.4: Setiap item menu memiliki harga tetap tanpa varian.

### 7.3 Manajemen Meja
- FR3.1: Sistem menampilkan daftar meja (jumlah dikonfigurasi oleh kasir, estimasi awal 1-10) dengan status: **Kosong** atau **Terisi**.
- FR3.2: Status meja otomatis berubah sesuai siklus order (kosong → terisi saat order dibuat → kosong lagi setelah lunas).

### 7.4 Order
- FR4.1: Order hanya bisa dibuat untuk meja berstatus "Kosong".
- FR4.2: Sebelum order dikonfirmasi/dibuat, kasir bebas menambah/mengurangi/menghapus item di keranjang.
- FR4.3: Setelah order dikonfirmasi (dibuat), item dalam order **tidak dapat diubah** satu per satu (tidak ada edit parsial).
- FR4.4: Total order dihitung sebagai penjumlahan harga item × qty, tanpa pajak/service charge/diskon.
- FR4.5: Kasir dapat **membatalkan seluruh order** selama belum dibayar (misal karena salah input meja/item). Order yang dibatalkan tidak dihitung sebagai penjualan, dan meja kembali berstatus "Kosong". Order yang sudah lunas tidak bisa dibatalkan.

### 7.5 Pembayaran
- FR5.1: Kasir dapat memilih metode bayar Tunai atau Kartu untuk order yang sudah dibuat.
- FR5.2: Untuk Tunai, sistem menerima input jumlah uang diterima dan menghitung kembalian otomatis (dan memvalidasi jumlah ≥ total).
- FR5.3: Untuk Kartu, sistem cukup mencatat bahwa order lunas via kartu (tanpa integrasi ke mesin EDC).
- FR5.4: Setelah pembayaran dikonfirmasi, order berstatus lunas dan tidak bisa dibuka/diubah lagi (hanya bisa dilihat sebagai riwayat).

### 7.6 Tutup Kasir
- FR6.1: Sistem dapat menghitung total transaksi tunai dan kartu dalam periode sejak tutup kasir terakhir hingga saat ini.
- FR6.2: Kasir dapat input jumlah uang fisik di laci saat tutup kasir.
- FR6.3: Sistem menghitung dan menampilkan selisih antara uang fisik dan total tunai tercatat.
- FR6.4: Setiap sesi tutup kasir tersimpan sebagai riwayat (tanggal/waktu, total tunai, total kartu, uang fisik, selisih).

## 8. Asumsi & Pertanyaan Terbuka

Beberapa hal berikut diasumsikan secara wajar berdasarkan jawaban interview, dan sebaiknya dikonfirmasi sebelum atau selama development:

1. **8.1 Order final tanpa edit parsial, tapi bisa dibatalkan** — Item dalam order yang sudah dikonfirmasi tidak bisa diedit satu per satu, namun kasir bisa membatalkan seluruh order (selama belum dibayar) sebagai jaring pengaman salah input. Lihat FR4.5.
2. **8.2 Jumlah meja** — Diasumsikan sekitar 1-10 meja, dikonfigurasi bebas oleh kasir (tambah/hapus meja dari pengaturan), bukan hard-coded di sistem.
2. **8.3 Kartu debit/kredit** — Diasumsikan hanya dicatat manual (tidak ada integrasi API bank/EDC), karena tidak disebutkan kebutuhan integrasi otomatis.
3. **8.4 Satu tablet/satu sesi kasir** — Diasumsikan hanya 1 tablet dipakai bersamaan (bukan multi-titik kasir paralel). Jika ternyata perlu 2+ tablet berjalan bersamaan mengakses data yang sama secara real-time, ini perlu dikonfirmasi karena berpengaruh ke desain sinkronisasi data.
4. **8.5 Riwayat transaksi** — MVP tidak menyediakan halaman pencarian riwayat transaksi individual (hanya rekap tutup kasir). Jika suatu saat perlu telusur transaksi tertentu (misal komplain pelanggan), ini masuk kandidat fase 2.

## 9. Non-Functional Requirements

- **Platform:** Web app, dioptimalkan untuk layar tablet (bukan native Android/iOS app).
- **Konektivitas:** Mengasumsikan WiFi stabil di lokasi restoran; tidak perlu mendukung mode offline di MVP.
- **Bahasa & mata uang:** Bahasa Indonesia, mata uang Rupiah (Rp), tanpa desimal.
- **Kecepatan:** Alur "pilih meja → order → bayar" harus bisa diselesaikan kasir dalam hitungan detik per langkah, mengingat ini dipakai saat restoran sibuk.

## 10. Pertimbangan Teknis (Rekomendasi, Bukan Keputusan Final)

Karena akan dikerjakan sendiri dengan bantuan AI dalam waktu singkat, disarankan:
- Web app dengan framework modern yang cepat untuk MVP (misal Next.js/React) + backend-as-a-service (misal Supabase) untuk database, autentikasi PIN sederhana, dan hosting cepat — mengurangi kebutuhan membangun backend dari nol.
- Desain UI dioptimalkan untuk layar sentuh tablet (target/tombol besar, minim ketikan manual).

## 11. Metrik Keberhasilan

- Seluruh transaksi harian tercatat digital (0% kembali ke nota manual) dalam 1 minggu pertama pemakaian.
- Proses tutup kasir harian selesai dalam < 5 menit.
- Tidak ada kehilangan data transaksi akibat bug selama masa pemakaian awal.

## 12. Ringkasan Keputusan dari Interview

| Topik | Keputusan |
|---|---|
| Skala restoran | 1 outlet, dine-in kecil, 1-10 meja |
| Kondisi saat ini | Manual (nota tulis tangan) |
| Platform | Web app, device tablet |
| Peran pengguna | Kasir saja |
| Pembayaran | Tunai + kartu debit/kredit (manual) |
| Konektivitas | WiFi stabil, tanpa mode offline |
| Struk | Tidak perlu cetak, cukup digital |
| Varian menu | Tidak ada, harga tetap per item |
| Pajak/diskon | Tidak ada, total = jumlah harga menu |
| Tutup kasir | Ya, dengan rekonsiliasi uang fisik |
| Kelola menu | Kasir edit langsung, tanpa halaman admin terpisah |
| Login | PIN 4 digit tunggal |
| Info order | Dikaitkan ke nomor/nama meja |
| Edit order | Tidak bisa diedit per item, tapi bisa dibatalkan seluruh order sebelum bayar |
| Laporan | Cukup total penjualan harian dari tutup kasir |
| Timeline | Secepatnya, < 1 bulan, dikerjakan sendiri + AI |
