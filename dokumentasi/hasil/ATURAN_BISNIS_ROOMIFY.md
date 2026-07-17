# Aturan Bisnis Roomify

## 1. Tujuan Dokumen

Dokumen ini merangkum aturan bisnis utama pada project **Roomify** berdasarkan implementasi backend aktif dan PRD yang ada saat ini. Fokusnya adalah mencatat aturan yang benar-benar memengaruhi perilaku sistem, seperti:

- jam operasional,
- durasi peminjaman,
- konflik jadwal,
- status booking,
- pembatalan,
- approval admin,
- status ruangan,
- dan aturan role.

Dokumen ini bisa dipakai sebagai acuan untuk:

- implementasi frontend,
- validasi backend,
- testing manual,
- penulisan laporan,
- dan diskusi fitur berikutnya.

## 2. Aktor dan Role

Role yang aktif saat ini hanya:

- `MAHASISWA`
- `ADMIN`

### MAHASISWA

Hak utama:

- registrasi akun,
- login,
- melihat daftar ruangan,
- melihat detail ruangan,
- mengecek availability,
- membuat booking,
- melihat riwayat booking sendiri,
- melihat detail booking sendiri,
- membatalkan booking sendiri,
- melihat profil,
- mengubah password sendiri.

### ADMIN

Hak utama:

- login sebagai admin,
- melihat dashboard admin,
- mengelola ruangan,
- melihat seluruh booking,
- menyetujui booking,
- menolak booking,
- menyelesaikan booking,
- melihat activity log.

## 3. Aturan Autentikasi

- Login menggunakan `email` dan `password`.
- Registrasi hanya untuk mahasiswa.
- `nim` harus unik.
- `email` harus unik.
- Password minimum mengikuti konfigurasi backend.
- Session memakai dua token:
  - `access_token` untuk request terproteksi,
  - `refresh_token` dalam cookie `HttpOnly` untuk refresh session.
- Jika access token habis, frontend mencoba refresh session.
- Jika refresh gagal, sesi dibersihkan dan user harus login ulang.

## 4. Aturan Registrasi Mahasiswa

Saat mahasiswa registrasi:

- `name` wajib diisi,
- `nim` wajib diisi,
- `email` wajib diisi,
- `password` wajib diisi,
- `nim` tidak boleh duplikat,
- `email` tidak boleh duplikat,
- akun dibuat dengan role `MAHASISWA`.

Error bisnis penting:

- `NIM_ALREADY_EXISTS`
- `EMAIL_ALREADY_EXISTS`

## 5. Aturan Ruangan

Ruangan memiliki status utama:

- `AVAILABLE`
- `MAINTENANCE`
- `INACTIVE`

### Aturan status ruangan

- Ruangan hanya bisa dipinjam jika statusnya `AVAILABLE`.
- Ruangan `MAINTENANCE` tidak bisa dipinjam.
- Ruangan `INACTIVE` tidak boleh dipinjam dan secara bisnis dianggap tidak tersedia untuk penggunaan normal.

### Aturan data ruangan

Data penting ruangan:

- `code`
- `name`
- `building`
- `floor`
- `location_description`
- `capacity`
- `facilities`
- `description`
- `image_url`
- `status`

### Aturan kode ruangan

- `code` ruangan harus unik.
- Admin tidak boleh membuat ruangan baru dengan kode yang sudah dipakai.

Error bisnis penting:

- `ROOM_CODE_ALREADY_EXISTS`

### Aturan gambar ruangan

- Admin dapat mengunggah gambar ruangan.
- Gambar bersifat opsional.
- Saat edit, admin dapat:
  - mempertahankan gambar lama,
  - mengganti dengan gambar baru,
  - menghapus gambar lama.

## 6. Aturan Waktu Booking

Berdasarkan konfigurasi backend aktif, aturan waktu saat ini adalah:

- timezone lokal: `Asia/Jakarta`
- jam operasional mulai: `07:00`
- jam operasional selesai: `21:00`
- durasi minimum booking: `30 menit`
- durasi maksimum booking: `8 jam`
- pengajuan booking maksimal: `90 hari` sebelum jadwal
- pembatalan booking dibatasi sampai `2 jam` sebelum waktu mulai

## 7. Aturan Validasi Pembuatan Booking

Saat mahasiswa membuat booking, backend memeriksa:

- tanggal booking tidak boleh di masa lalu,
- waktu selesai harus lebih besar daripada waktu mulai,
- durasi booking minimal 30 menit,
- durasi booking maksimal 8 jam,
- pengajuan tidak boleh lebih dari 90 hari ke depan,
- waktu booking harus berada dalam jam operasional `07:00 - 21:00`,
- ruangan harus ada,
- ruangan tidak boleh soft deleted,
- status ruangan harus `AVAILABLE`,
- jumlah peserta tidak boleh melebihi kapasitas ruangan,
- jadwal tidak boleh bentrok dengan booking approved lain.

Error bisnis penting:

- `VALIDATION_ERROR`
- `ROOM_NOT_AVAILABLE`
- `BOOKING_TIME_CONFLICT`
- `RESOURCE_NOT_FOUND`

## 8. Aturan Konflik Jadwal

Dua booking dianggap bertabrakan apabila:

```text
start_baru < end_lama
dan
end_baru > start_lama
```

Konflik ini hanya dicek terhadap booking yang sudah **disetujui** atau status yang benar-benar memblokir jadwal ruangan.

Secara implementasi aktif:

- availability ruangan dibangun dari booking `APPROVED`
- validasi create booking juga membandingkan dengan booking `APPROVED`
- admin akan melakukan pengecekan konflik ulang saat approve booking

Artinya:

- booking `PENDING` belum memblokir slot final,
- tetapi booking `APPROVED` sudah memblokir slot ruangan.

## 9. Aturan Status Booking

Status booking yang digunakan:

- `PENDING`
- `APPROVED`
- `REJECTED`
- `CANCELLED`
- `COMPLETED`

### Arti status

- `PENDING`
  Permohonan baru dibuat dan menunggu review admin.

- `APPROVED`
  Permohonan sudah disetujui admin dan memblokir jadwal ruangan.

- `REJECTED`
  Permohonan ditolak admin.

- `CANCELLED`
  Permohonan dibatalkan oleh mahasiswa.

- `COMPLETED`
  Kegiatan sudah selesai dan booking ditutup admin.

## 10. Aturan Transisi Status Booking

Transisi yang diizinkan:

- `PENDING -> APPROVED`
- `PENDING -> REJECTED`
- `PENDING -> CANCELLED`
- `APPROVED -> CANCELLED`
- `APPROVED -> COMPLETED`

Transisi di luar itu harus ditolak backend.

### Contoh transisi yang tidak valid

- `REJECTED -> APPROVED`
- `CANCELLED -> APPROVED`
- `COMPLETED -> CANCELLED`
- `APPROVED -> REJECTED`

Error bisnis penting:

- `INVALID_BOOKING_STATUS`

## 11. Aturan Create Booking

Saat booking berhasil dibuat:

- booking code dibuat otomatis,
- status awal selalu `PENDING`,
- `admin_note` masih `null`,
- booking dicatat atas user yang sedang login,
- activity log dicatat,
- frontend perlu me-refresh list booking, dashboard, dan area terkait.

Secara bisnis, `booking berhasil dibuat` **tidak berarti** booking langsung disetujui.

## 12. Aturan Approval Booking oleh Admin

Saat admin menyetujui booking:

- booking harus ada,
- status booking harus `PENDING`,
- jadwal booking tidak boleh sudah lewat,
- backend memeriksa konflik ulang terhadap booking approved lain,
- jika lolos, status berubah menjadi `APPROVED`,
- `reviewed_by` diisi admin,
- `reviewed_at` diisi waktu review,
- `admin_note` boleh ikut dicatat.

Error bisnis penting:

- `INVALID_BOOKING_STATUS`
- `BOOKING_TIME_CONFLICT`
- `RESOURCE_NOT_FOUND`

## 13. Aturan Reject Booking oleh Admin

Saat admin menolak booking:

- booking harus ada,
- status booking harus `PENDING`,
- status berubah menjadi `REJECTED`,
- `reviewed_by` diisi admin,
- `reviewed_at` diisi waktu review,
- `admin_note` dipakai sebagai alasan penolakan.

Secara UX, alasan penolakan sebaiknya dianggap wajib agar mahasiswa tahu alasan booking ditolak.

## 14. Aturan Complete Booking oleh Admin

Saat admin menyelesaikan booking:

- booking harus ada,
- status booking harus `APPROVED`,
- status berubah menjadi `COMPLETED`,
- `completed_by` diisi admin,
- `completed_at` diisi waktu penyelesaian.

Booking yang belum pernah `APPROVED` tidak boleh langsung menjadi `COMPLETED`.

## 15. Aturan Pembatalan Booking oleh Mahasiswa

Mahasiswa hanya dapat membatalkan booking jika semua syarat ini terpenuhi:

- booking milik mahasiswa tersebut,
- booking ada,
- status booking masih `PENDING` atau `APPROVED`,
- waktu mulai belum terlewati,
- waktu pembatalan masih sebelum batas maksimal pembatalan, yaitu 2 jam sebelum waktu mulai.

Jika syarat tidak terpenuhi, backend menolak pembatalan.

Error bisnis penting:

- `BOOKING_CANNOT_BE_CANCELLED`
- `RESOURCE_NOT_FOUND`

## 16. Aturan Daftar Booking Mahasiswa

Mahasiswa hanya boleh melihat:

- daftar booking miliknya sendiri,
- detail booking miliknya sendiri.

Mahasiswa tidak boleh mengakses detail booking mahasiswa lain.

Filter yang didukung saat ini:

- `status`
- `room_id`
- `date_from`
- `date_to`
- `page`
- `limit`
- `sort`

## 17. Aturan Daftar Booking Admin

Admin boleh melihat seluruh booking.

Filter yang didukung saat ini:

- `status`
- `room_id`
- `user_id`
- `date_from`
- `date_to`
- `page`
- `limit`
- `sort`

Secara bisnis, list admin dipakai untuk:

- menemukan booking `PENDING`,
- meninjau detail booking,
- melakukan approve, reject, atau complete.

## 18. Aturan Availability Ruangan

Availability ruangan:

- dihitung per tanggal,
- menampilkan `blocked_slots`,
- memakai data booking approved pada tanggal tersebut,
- menyimpan `is_bookable` berdasarkan status ruangan,
- tidak menjamin 100% keberhasilan booking jika ada perubahan data di saat hampir bersamaan.

Artinya:

- availability adalah panduan UX,
- keputusan final tetap di backend saat create booking dan approve booking.

## 19. Aturan Soft Delete Ruangan

Saat admin menonaktifkan ruangan:

- backend melakukan soft delete,
- file gambar lama bisa ikut dibersihkan,
- ruangan tidak lagi dianggap aktif untuk kebutuhan peminjaman normal,
- activity log dicatat.

Secara bisnis, aksi ini lebih tepat dianggap sebagai:

- `nonaktifkan ruangan`

bukan:

- `hapus permanen`

## 20. Aturan Dashboard

Dashboard mahasiswa digunakan untuk:

- total booking,
- pending,
- approved,
- completed,
- dan ringkasan booking terkait user tersebut.

Dashboard admin digunakan untuk:

- statistik peminjaman,
- total ruangan,
- tren booking,
- usage ruangan,
- dan daftar booking pending terbaru.

Secara bisnis, dashboard adalah ringkasan operasional, bukan sumber data detail final.

## 21. Aturan Activity Log

Sistem mencatat aktivitas penting seperti:

- registrasi user,
- login,
- refresh session,
- logout,
- ganti password,
- create room,
- update room,
- update room status,
- nonaktifkan room,
- create booking,
- cancel booking,
- approve booking,
- reject booking,
- complete booking.

Secara bisnis, activity log dipakai untuk audit trail operasional admin dan sistem.

## 22. Aturan Error Bisnis yang Penting

Error code yang paling penting secara bisnis:

- `NIM_ALREADY_EXISTS`
- `EMAIL_ALREADY_EXISTS`
- `INVALID_CREDENTIALS`
- `FORBIDDEN`
- `UNAUTHENTICATED`
- `REFRESH_TOKEN_REVOKED`
- `RESOURCE_NOT_FOUND`
- `VALIDATION_ERROR`
- `ROOM_NOT_AVAILABLE`
- `ROOM_CODE_ALREADY_EXISTS`
- `BOOKING_TIME_CONFLICT`
- `BOOKING_CANNOT_BE_CANCELLED`
- `INVALID_BOOKING_STATUS`

Error ini penting karena memengaruhi:

- validasi frontend,
- isi toast atau alert,
- state form,
- dan test case sistem.

## 23. Ringkasan Aturan Paling Penting

Jika diringkas menjadi poin-poin inti, aturan bisnis Roomify saat ini adalah:

- hanya ada dua role: `MAHASISWA` dan `ADMIN`
- ruangan hanya bisa dipinjam jika `AVAILABLE`
- booking tidak boleh di masa lalu
- booking harus berada dalam jam `07:00 - 21:00`
- durasi booking minimal `30 menit`
- durasi booking maksimal `8 jam`
- booking maksimal `90 hari` ke depan
- peserta tidak boleh melebihi kapasitas ruangan
- booking baru selalu `PENDING`
- konflik jadwal dicek saat create dan saat approve
- approval hanya untuk booking `PENDING`
- complete hanya untuk booking `APPROVED`
- cancel hanya untuk booking `PENDING` atau `APPROVED`
- cancel hanya boleh sampai `2 jam` sebelum mulai
- availability frontend adalah panduan, backend tetap sumber kebenaran
- admin room delete adalah soft delete, bukan hapus permanen

## 24. Kesimpulan

Aturan bisnis Roomify saat ini sudah cukup jelas dan cukup kuat untuk mendukung MVP sistem peminjaman ruangan. Aturan terpenting berpusat pada:

- autentikasi dan role,
- status ruangan,
- validasi waktu booking,
- konflik jadwal,
- transisi status booking,
- pembatalan,
- dan approval admin.

Dokumen ini bisa dijadikan dasar untuk:

- implementasi frontend,
- penulisan test case,
- validasi manual QA,
- dokumentasi teknis,
- dan penjelasan sistem ke dosen atau tim.
