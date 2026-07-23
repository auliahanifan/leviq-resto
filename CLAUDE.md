@AGENTS.md

## Git: Commit & Push Bertahap (Bukan 1 Bundel di Akhir)

Jangan menunggu sampai seluruh fitur end-to-end selesai untuk commit & push. Commit (lalu push) setiap kali satu unit kerja logis selesai dan sudah diverifikasi (test/lint lolos, atau sudah dicoba jalan) — tidak perlu nunggu diminta.

**Commit + push segera setelah:**
- Satu task/sub-task dari task list (`docs/tasks/*.md`) selesai & terverifikasi.
- Satu unit independen selesai: satu migration, satu endpoint, satu komponen UI, satu bug fix — meskipun task besar/parent-nya belum selesai semua.
- Sebelum pindah ke bagian yang konsepnya beda (mis. backend endpoint kelar → mau lanjut ke UI-nya): commit dulu backend-nya.
- Sebelum melakukan perubahan berisiko/besar (refactor, ubah schema) — commit checkpoint dulu biar gampang di-rollback.

**Jangan bikin commit terpisah untuk:**
- Perubahan kecil yang memang tak terpisahkan dari unit kerja yang sedang dikerjakan (typo fix, rename var yang muncul saat ngerjain fitur yang sama).
- Kode yang belum jalan / setengah jadi.
- Perubahan yang saling bergantung dan tidak masuk akal displit (mis. kolom migration baru + field yang memakainya di form yang sama).

**Sinyal bahwa diff harus displit jadi beberapa commit:**
- Diff mencakup lebih dari satu concern/tujuan berbeda.
- Diff menyentuh banyak file yang tidak saling berkaitan langsung.
- Diff mencakup beberapa task berbeda dari task list sekaligus.

Kalau ragu satu commit sudah terlalu besar/campur beberapa concern, split dulu sebelum lanjut, jangan tunggu sampai akhir sesi.

Commit message singkat & jelas (bukan "update files"), ikuti gaya commit message yang sudah ada di `git log`. Push ke remote setelah tiap commit selesai (tidak perlu konfirmasi tiap kali), kecuali user secara eksplisit minta untuk tidak push dulu di sesi tersebut.
