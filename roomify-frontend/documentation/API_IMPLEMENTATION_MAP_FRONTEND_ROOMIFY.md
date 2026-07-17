# API Implementation Map Frontend Roomify

## Tujuan

Dokumen ini memetakan kebutuhan integrasi API frontend `Roomify` berdasarkan:

- route dan komponen yang sudah ada di workspace `roomify-frontend`
- [PRD_FRONTEND_ROOMIFY.md](./PRD_FRONTEND_ROOMIFY.md)
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

Fokus dokumen ini bukan hanya daftar endpoint, tetapi juga:

- halaman frontend yang memakai endpoint tersebut
- module backend yang terlibat
- flow atau bisnis prosesnya
- status kesiapan integrasi saat ini
- API tambahan yang masih perlu dipastikan atau dibuat

Status scan ini disesuaikan dengan kondisi workspace per `16 Juli 2026`.

## Ringkasan Kondisi Frontend Saat Ini

Frontend yang sudah ada sekarang sudah mencakup fondasi dan modul inti berikut:

- auth flow dasar
- bootstrap sesi
- login
- register
- profile
- change password di halaman profile
- layout area `MAHASISWA`
- layout area `ADMIN`
- dashboard mahasiswa
- dashboard admin
- daftar ruangan mahasiswa
- detail ruangan mahasiswa
- availability ruangan
- form booking mahasiswa
- daftar booking mahasiswa
- detail booking mahasiswa
- manajemen ruangan admin
- detail ruangan admin
- create dan edit ruangan admin
- daftar booking admin
- detail booking admin
- activity log admin

Route yang sudah ada:

- `/`
- `/login`
- `/register`
- `/mahasiswa/dashboard`
- `/mahasiswa/rooms`
- `/mahasiswa/rooms/[id]`
- `/mahasiswa/bookings`
- `/mahasiswa/bookings/create`
- `/mahasiswa/bookings/[id]`
- `/mahasiswa/profile`
- `/mahasiswa/change-password`
- `/admin/dashboard`
- `/admin/rooms`
- `/admin/rooms/create`
- `/admin/rooms/[id]`
- `/admin/rooms/[id]/edit`
- `/admin/bookings`
- `/admin/bookings/[id]`
- `/admin/activity-logs`

Halaman inti yang masih belum ada atau memang belum dikerjakan sekarang:

- daftar mahasiswa admin
- detail mahasiswa admin
- aktivasi dan nonaktivasi mahasiswa

## Pembagian Module Backend

Supaya implementasi frontend lebih rapi, kebutuhan API bisa dibagi menjadi beberapa module backend:

### 1. Auth module

Mengurus:

- register
- login
- refresh
- logout
- current user
- change password

Endpoint:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`
- `PATCH /auth/change-password`

### 2. Rooms module

Mengurus:

- daftar ruangan publik
- detail ruangan
- ketersediaan ruangan

Endpoint:

- `GET /rooms`
- `GET /rooms/{room_id}`
- `GET /rooms/{room_id}/availability`

### 3. Student bookings module

Mengurus:

- pembuatan booking
- riwayat booking mahasiswa
- detail booking mahasiswa
- pembatalan booking

Endpoint:

- `POST /bookings`
- `GET /bookings/me`
- `GET /bookings/{booking_id}`
- `PATCH /bookings/{booking_id}/cancel`

### 4. Admin rooms module

Mengurus:

- tambah ruangan
- edit ruangan
- ubah status ruangan
- nonaktifkan ruangan

Endpoint:

- `POST /admin/rooms`
- `PATCH /admin/rooms/{room_id}`
- `PATCH /admin/rooms/{room_id}/status`
- `DELETE /admin/rooms/{room_id}`

### 5. Admin bookings module

Mengurus:

- daftar semua booking
- detail booking untuk admin
- approve
- reject
- complete

Endpoint:

- `GET /admin/bookings`
- `GET /admin/bookings/{booking_id}`
- `PATCH /admin/bookings/{booking_id}/approve`
- `PATCH /admin/bookings/{booking_id}/reject`
- `PATCH /admin/bookings/{booking_id}/complete`

### 6. Dashboard module

Mengurus:

- ringkasan dashboard mahasiswa
- ringkasan dashboard admin
- trend booking
- penggunaan ruangan

Endpoint:

- `GET /dashboards/me`
- `GET /dashboards/admin`
- `GET /dashboards/admin/booking-trend`
- `GET /dashboards/admin/room-usage`

### 7. Activity log module

Mengurus:

- audit trail untuk admin

Endpoint:

- `GET /activity-logs`

### 8. Mahasiswa management module

Mengurus:

- daftar mahasiswa
- detail mahasiswa
- aktivasi dan nonaktivasi mahasiswa

Endpoint yang direncanakan PRD:

- `GET /admin/mahasiswa`
- `GET /admin/mahasiswa/{user_id}`
- `PATCH /admin/mahasiswa/{user_id}/status`

Catatan penting:

Endpoint module ini ada di PRD frontend, tetapi belum tercantum di [API_DOCUMENTATION.md](./API_DOCUMENTATION.md). Jadi bagian ini perlu dikonfirmasi ke backend atau ditambahkan ke backend bila memang belum ada.

## Peta Halaman Frontend ke API

## A. Halaman yang Sudah Ada di Workspace

| Halaman | Status UI | API yang diperlukan | Backend module | Status integrasi |
|---|---|---|---|---|
| `/login` | sudah ada | `POST /auth/login`, `GET /auth/me` | Auth | sudah terhubung |
| `/register` | sudah ada | `POST /auth/register` | Auth | sudah terhubung |
| bootstrap sesi global | sudah ada | `POST /auth/refresh`, `GET /auth/me` | Auth | sudah terhubung |
| logout dari shell | sudah ada | `POST /auth/logout` | Auth | sudah terhubung |
| `/mahasiswa/profile` | sudah ada | `GET /auth/me`, `PATCH /auth/change-password` | Auth | profile memakai data sesi, ubah password sudah terhubung |
| `/mahasiswa/dashboard` | sudah ada | `GET /dashboards/me`, `GET /bookings/me` | Dashboard, Student bookings | sudah terhubung |
| `/admin/dashboard` | sudah ada | `GET /dashboards/admin`, `GET /dashboards/admin/booking-trend`, `GET /dashboards/admin/room-usage`, `GET /admin/bookings?status=PENDING&limit=5` | Dashboard, Admin bookings | sudah terhubung |
| `/mahasiswa/rooms` | sudah ada | `GET /rooms` | Rooms | sudah terhubung |
| `/mahasiswa/rooms/[id]` | sudah ada | `GET /rooms/{room_id}`, `GET /rooms/{room_id}/availability` | Rooms | sudah terhubung |
| `/mahasiswa/bookings/create` | sudah ada | `POST /bookings`, `GET /rooms/{room_id}`, `GET /rooms/{room_id}/availability` | Student bookings, Rooms | sudah terhubung |
| `/mahasiswa/bookings` | sudah ada | `GET /bookings/me` | Student bookings | sudah terhubung |
| `/mahasiswa/bookings/[id]` | sudah ada | `GET /bookings/{booking_id}`, `PATCH /bookings/{booking_id}/cancel` | Student bookings | sudah terhubung |
| `/admin/rooms` | sudah ada | `GET /rooms` | Rooms | sudah terhubung |
| `/admin/rooms/create` | sudah ada | `POST /admin/rooms` | Admin rooms | sudah terhubung |
| `/admin/rooms/[id]` | sudah ada | `GET /rooms/{room_id}`, `GET /rooms/{room_id}/availability` | Rooms | sudah terhubung |
| `/admin/rooms/[id]/edit` | sudah ada | `GET /rooms/{room_id}`, `PATCH /admin/rooms/{room_id}`, `PATCH /admin/rooms/{room_id}/status`, `DELETE /admin/rooms/{room_id}` | Rooms, Admin rooms | sudah terhubung |
| `/admin/bookings` | sudah ada | `GET /admin/bookings` | Admin bookings | sudah terhubung |
| `/admin/bookings/[id]` | sudah ada | `GET /admin/bookings/{booking_id}`, `PATCH /admin/bookings/{booking_id}/approve`, `PATCH /admin/bookings/{booking_id}/reject`, `PATCH /admin/bookings/{booking_id}/complete` | Admin bookings | sudah terhubung |
| `/admin/activity-logs` | sudah ada | `GET /activity-logs` | Activity log | sudah terhubung |

## B. Halaman yang Perlu Dibuat untuk Mahasiswa

| Halaman | API utama | Backend module | Fungsi utama |
|---|---|---|---|
| `/mahasiswa/rooms` | `GET /rooms` | Rooms | list, search, filter, pagination |
| `/mahasiswa/rooms/[id]` | `GET /rooms/{room_id}`, `GET /rooms/{room_id}/availability` | Rooms | detail ruangan dan jadwal |
| `/mahasiswa/bookings/create` atau lewat detail room | `POST /bookings` | Student bookings | ajukan peminjaman |
| `/mahasiswa/bookings` | `GET /bookings/me` | Student bookings | riwayat booking sendiri |
| `/mahasiswa/bookings/[id]` | `GET /bookings/{booking_id}`, `PATCH /bookings/{booking_id}/cancel` | Student bookings | detail dan cancel |

## C. Halaman yang Perlu Dibuat untuk Admin

| Halaman | API utama | Backend module | Fungsi utama |
|---|---|---|---|
| `/admin/rooms` | `GET /rooms` atau endpoint admin list khusus bila nanti ada | Rooms, Admin rooms | list ruangan untuk admin |
| `/admin/rooms/create` | `POST /admin/rooms` | Admin rooms | tambah ruangan |
| `/admin/rooms/[id]/edit` | `GET /rooms/{room_id}`, `PATCH /admin/rooms/{room_id}`, `PATCH /admin/rooms/{room_id}/status`, `DELETE /admin/rooms/{room_id}` | Rooms, Admin rooms | edit, status, nonaktifkan |
| `/admin/bookings` | `GET /admin/bookings` | Admin bookings | list semua permohonan |
| `/admin/bookings/[id]` | `GET /admin/bookings/{booking_id}`, `PATCH /admin/bookings/{booking_id}/approve`, `PATCH /admin/bookings/{booking_id}/reject`, `PATCH /admin/bookings/{booking_id}/complete` | Admin bookings | review dan tindakan |
| `/admin/mahasiswa` | `GET /admin/mahasiswa` | Mahasiswa management | list mahasiswa |
| `/admin/mahasiswa/[id]` | `GET /admin/mahasiswa/{user_id}`, `PATCH /admin/mahasiswa/{user_id}/status` | Mahasiswa management | detail dan ubah status |
| `/admin/activity-logs` | `GET /activity-logs` | Activity log | audit trail |

## Flow dan Bisnis Proses per Modul

## 1. Auth

### Halaman terkait

- `/login`
- `/register`
- `/mahasiswa/profile`
- shell global untuk bootstrap sesi

### Flow login

1. User isi email dan password.
2. Frontend kirim `POST /auth/login`.
3. Backend kirim `access_token` dan set cookie `refresh_token`.
4. Frontend simpan `access_token` di store memory.
5. Frontend panggil `GET /auth/me`.
6. Frontend simpan user dan redirect berdasarkan role.

### Flow bootstrap sesi

1. App load ulang.
2. Frontend belum punya access token di memory.
3. Frontend kirim `POST /auth/refresh` dengan cookie.
4. Jika berhasil, frontend terima access token baru.
5. Frontend panggil `GET /auth/me`.
6. Jika gagal, auth state dibersihkan dan user diarahkan ke `/login`.

### Flow ganti password

1. User isi password lama dan password baru di profile.
2. Frontend kirim `PATCH /auth/change-password`.
3. Jika berhasil, tampilkan toast sukses.
4. Jika backend menganggap sesi atau password lama salah, tampilkan pesan error sesuai code.

### Catatan bisnis

- `refresh_token` tidak pernah dibaca langsung oleh frontend.
- `access_token` hanya disimpan di memory.
- role guard frontend hanya membantu UX, bukan security boundary.

## 2. Dashboard Mahasiswa

### Halaman terkait

- `/mahasiswa/dashboard`

### API yang diperlukan

- `GET /dashboards/me`
- opsional tambahan `GET /bookings/me?limit=3&sort=-start_at`

### Flow

1. Page terbuka setelah user `MAHASISWA` lolos bootstrap sesi.
2. Frontend panggil `GET /dashboards/me`.
3. Data dipakai untuk card summary seperti total booking, pending, approved, completed, cancelled.
4. Bila ingin section "booking terbaru" atau "jadwal terdekat", frontend perlu panggil `GET /bookings/me` dengan filter yang sesuai.

### Catatan bisnis

- endpoint dashboard hanya cocok untuk angka ringkas.
- list aktivitas booking terbaru jangan dipaksa dari endpoint summary jika payload backend tidak menyediakannya.

## 3. Dashboard Admin

### Halaman terkait

- `/admin/dashboard`

### API yang diperlukan

- `GET /dashboards/admin`
- `GET /dashboards/admin/booking-trend`
- `GET /dashboards/admin/room-usage`
- opsional `GET /admin/bookings?status=PENDING&limit=5&sort=booking_date`

### Flow

1. Admin buka dashboard.
2. Frontend panggil summary admin.
3. Frontend panggil trend booking.
4. Frontend panggil usage ruangan.
5. Jika ada section daftar pending terbaru, frontend ambil dari `GET /admin/bookings`.

### Catatan bisnis

- summary admin cocok untuk stat card.
- chart trend dan usage sebaiknya tetap dari endpoint terpisah agar payload tidak gemuk.
- list pending approval sebaiknya tidak di-hardcode dari mock `pendingList` lagi.

## 4. Rooms Mahasiswa

### Halaman terkait

- `/mahasiswa/rooms`
- `/mahasiswa/rooms/[id]`

### API yang diperlukan

- `GET /rooms`
- `GET /rooms/{room_id}`
- `GET /rooms/{room_id}/availability`

### Flow daftar ruangan

1. Mahasiswa buka halaman cari ruangan.
2. Frontend kirim `GET /rooms` dengan query:
   - `search`
   - `building`
   - `status`
   - `min_capacity`
   - `facility`
   - `page`
   - `limit`
   - `sort`
3. Frontend render list, filter bar, dan pagination dari `meta`.

### Flow detail ruangan

1. Mahasiswa buka salah satu ruangan.
2. Frontend panggil `GET /rooms/{room_id}` untuk detail utama.
3. Saat user memilih tanggal, frontend panggil `GET /rooms/{room_id}/availability?date=YYYY-MM-DD`.
4. Frontend tampilkan slot yang sudah terblokir dan status room.

### Catatan bisnis

- ruangan `MAINTENANCE` tetap bisa tampil, tetapi tombol booking harus nonaktif.
- ruangan `INACTIVE` tidak perlu muncul di area mahasiswa.
- `availability` adalah panduan UX, keputusan final konflik tetap di backend saat submit booking.

## 5. Booking Mahasiswa

### Halaman terkait

- `/mahasiswa/bookings`
- `/mahasiswa/bookings/[id]`
- form booking di detail ruangan atau halaman create tersendiri

### API yang diperlukan

- `POST /bookings`
- `GET /bookings/me`
- `GET /bookings/{booking_id}`
- `PATCH /bookings/{booking_id}/cancel`

### Flow buat booking

1. Mahasiswa pilih ruangan dan tanggal.
2. Frontend tampilkan availability.
3. Mahasiswa isi tujuan, jumlah peserta, waktu mulai, waktu selesai, dan catatan.
4. Frontend validasi:
   - tanggal tidak di masa lalu
   - `end_at > start_at`
   - durasi minimal 30 menit
   - durasi maksimal 8 jam
   - peserta tidak melebihi kapasitas room
5. Frontend kirim `POST /bookings`.
6. Jika sukses, booking masuk status `PENDING`.
7. Frontend redirect ke detail booking atau daftar booking saya.

### Flow riwayat booking

1. Mahasiswa buka `/mahasiswa/bookings`.
2. Frontend panggil `GET /bookings/me`.
3. Query params dapat dipakai untuk:
   - `status`
   - `date_from`
   - `date_to`
   - `page`
   - `limit`
   - `sort`

### Flow cancel booking

1. Mahasiswa buka detail booking.
2. Frontend hanya menampilkan tombol cancel jika status memungkinkan.
3. Setelah konfirmasi, frontend kirim `PATCH /bookings/{booking_id}/cancel`.
4. Frontend refresh detail, daftar booking, dan dashboard mahasiswa.

### Catatan bisnis

- frontend tidak boleh mengasumsikan booking pasti bisa dibatalkan hanya dari status yang terlihat; backend tetap final.
- error seperti `BOOKING_TIME_CONFLICT` dan `BOOKING_CANNOT_BE_CANCELLED` harus punya pesan UI yang jelas.

## 6. Manajemen Ruangan Admin

### Halaman terkait

- `/admin/rooms`
- `/admin/rooms/create`
- `/admin/rooms/[id]/edit`

### API yang diperlukan

- `GET /rooms`
- `GET /rooms/{room_id}`
- `POST /admin/rooms`
- `PATCH /admin/rooms/{room_id}`
- `PATCH /admin/rooms/{room_id}/status`
- `DELETE /admin/rooms/{room_id}`

### Flow list admin

1. Admin buka halaman ruangan.
2. Frontend bisa pakai `GET /rooms` sebagai sumber list awal.
3. Jika ke depan admin butuh melihat room `INACTIVE` juga secara eksplisit dan butuh filter administratif lebih kaya, backend idealnya menyediakan endpoint admin list tersendiri.

### Flow tambah ruangan

1. Admin isi kode, nama, gedung, lantai, kapasitas, fasilitas, deskripsi, dan status.
2. Frontend kirim `POST /admin/rooms`.
3. Jika `ROOM_CODE_ALREADY_EXISTS`, field kode harus diberi error.

### Flow edit ruangan

1. Admin buka form edit.
2. Frontend panggil `GET /rooms/{room_id}` untuk isi awal.
3. Setelah submit, frontend kirim `PATCH /admin/rooms/{room_id}`.
4. Untuk ubah status cepat, gunakan `PATCH /admin/rooms/{room_id}/status`.
5. Untuk nonaktifkan, gunakan `DELETE /admin/rooms/{room_id}` dengan copy UI "Nonaktifkan ruangan".

### Catatan bisnis

- `DELETE` di sini adalah soft delete, bukan hapus permanen.
- frontend perlu bedakan antara edit data ruangan dan ubah status ruangan.

## 7. Booking Admin

### Halaman terkait

- `/admin/bookings`
- `/admin/bookings/[id]`

### API yang diperlukan

- `GET /admin/bookings`
- `GET /admin/bookings/{booking_id}`
- `PATCH /admin/bookings/{booking_id}/approve`
- `PATCH /admin/bookings/{booking_id}/reject`
- `PATCH /admin/bookings/{booking_id}/complete`

### Flow list booking admin

1. Admin buka daftar permohonan.
2. Frontend panggil `GET /admin/bookings`.
3. Query params penting:
   - `status`
   - `room_id`
   - `user_id`
   - `date_from`
   - `date_to`
   - `page`
   - `limit`
   - `sort`
4. Frontend tampilkan tab status dan filter.

### Flow approve

1. Admin buka detail booking.
2. Admin meninjau mahasiswa, ruangan, waktu, dan tujuan.
3. Admin isi atau konfirmasi catatan.
4. Frontend kirim `PATCH /admin/bookings/{booking_id}/approve`.
5. Frontend invalidate list, detail, dashboard admin, dan availability ruangan terkait.

### Flow reject

1. Admin buka detail booking.
2. Admin wajib memberi alasan atau `admin_note`.
3. Frontend kirim `PATCH /admin/bookings/{booking_id}/reject`.

### Flow complete

1. Booking sudah berstatus `APPROVED`.
2. Setelah kegiatan selesai, admin kirim `PATCH /admin/bookings/{booking_id}/complete`.

### Catatan bisnis

- approve bisa gagal karena `BOOKING_TIME_CONFLICT` bila data berubah sebelum direview.
- frontend wajib siap menangani stale status dan refetch detail terbaru.

## 8. Mahasiswa Management Admin

### Halaman terkait

- `/admin/mahasiswa`
- `/admin/mahasiswa/[id]`

### API yang diperlukan

- `GET /admin/mahasiswa`
- `GET /admin/mahasiswa/{user_id}`
- `PATCH /admin/mahasiswa/{user_id}/status`

### Flow

1. Admin buka daftar mahasiswa.
2. Frontend ambil list mahasiswa dan pagination.
3. Admin buka detail salah satu mahasiswa.
4. Admin dapat mengaktifkan atau menonaktifkan akun.

### Catatan bisnis

- flow ini sudah tertulis di PRD frontend.
- sampai scan saat ini, endpoint tersebut belum masuk `API_DOCUMENTATION.md`.
- ini adalah gap kontrak API yang perlu dibereskan sebelum implementasi frontend modul mahasiswa admin.

## 9. Activity Log

### Halaman terkait

- `/admin/activity-logs`

### API yang diperlukan

- `GET /activity-logs`

### Flow

1. Admin buka halaman log aktivitas.
2. Frontend kirim `GET /activity-logs`.
3. Filter yang bisa dipakai:
   - `actor_id`
   - `action`
   - `entity_type`
   - `entity_id`
   - `page`
   - `limit`
4. Frontend render list log, metadata ringkas, dan request ID.

### Catatan bisnis

- halaman ini penting untuk audit, bukan untuk action.
- metadata idealnya dibuka lewat drawer atau dialog detail.

## Gap API yang Sudah Terlihat

## 1. Endpoint manajemen mahasiswa belum terdokumentasi di API backend aktif

Gap:

- PRD frontend menyebut:
  - `GET /admin/mahasiswa`
  - `GET /admin/mahasiswa/{user_id}`
  - `PATCH /admin/mahasiswa/{user_id}/status`
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) belum mencantumkannya

Implikasi:

- frontend belum bisa lanjut ke halaman admin mahasiswa dengan kontrak yang pasti

Rekomendasi:

- backend menambahkan endpoint tersebut ke dokumentasi aktif
- atau PRD frontend direvisi jika modul ini belum masuk MVP backend

## 2. Dashboard saat ini masih butuh endpoint list pendukung

Gap:

- dashboard mahasiswa dan admin di UI sekarang punya section list, bukan hanya angka summary

Implikasi:

- `GET /dashboards/me` dan `GET /dashboards/admin` belum cukup untuk semua blok UI bila tetap ingin layout seperti sekarang

Rekomendasi:

- dashboard mahasiswa memakai kombinasi:
  - `GET /dashboards/me`
  - `GET /bookings/me?limit=3`
- dashboard admin memakai kombinasi:
  - `GET /dashboards/admin`
  - `GET /dashboards/admin/booking-trend`
  - `GET /dashboards/admin/room-usage`
  - `GET /admin/bookings?status=PENDING&limit=5`

## 3. Admin room list mungkin nanti butuh endpoint admin khusus

Gap:

- saat ini list ruangan admin masih bisa memakai `GET /rooms`
- tetapi kebutuhan admin biasanya lebih luas daripada list publik mahasiswa

Kemungkinan kebutuhan baru:

- melihat room `INACTIVE`
- filter tambahan administratif
- sorting yang lebih spesifik untuk pengelolaan

Rekomendasi:

- untuk tahap awal, frontend bisa memakai `GET /rooms`
- bila mulai terasa terbatas, backend dapat menambah endpoint seperti `GET /admin/rooms`

## 4. Dashboard mahasiswa mungkin belum punya endpoint booking terdekat

Gap:

- UI mahasiswa saat ini cenderung lebih enak bila ada data "upcoming booking" atau "recent booking"

Opsi:

- pakai `GET /bookings/me` dengan `limit` kecil
- atau backend menambah endpoint dashboard detail jika memang diperlukan

Rekomendasi:

- jangan tambah endpoint baru dulu
- manfaatkan `GET /bookings/me` sebagai sumber list ringkas

## Rekomendasi Urutan Implementasi API Berikutnya

Supaya frontend bergerak stabil dan tidak terlalu banyak area mock, urutan paling masuk akal adalah:

1. Selesaikan integrasi dashboard mahasiswa dan admin dengan endpoint nyata.
2. Bangun modul `Rooms` mahasiswa karena ini jalur utama user.
3. Bangun modul `Bookings` mahasiswa dari create sampai detail dan cancel.
4. Bangun modul `Admin Bookings` karena ini inti proses approval.
5. Bangun modul `Admin Rooms`.
6. Konfirmasi kontrak `Admin Mahasiswa` dengan backend sebelum implementasi.
7. Bangun `Activity Logs`.

## Query dan Invalidation yang Perlu Disiapkan

Agar implementasi API nanti tidak berantakan, frontend sebaiknya menyiapkan key seperti:

- `authKeys.me`
- `dashboardKeys.me`
- `dashboardKeys.admin`
- `dashboardKeys.bookingTrend`
- `dashboardKeys.roomUsage`
- `roomKeys.list`
- `roomKeys.detail`
- `roomKeys.availability`
- `bookingKeys.me`
- `bookingKeys.detail`
- `bookingKeys.adminList`
- `bookingKeys.adminDetail`
- `studentKeys.list`
- `studentKeys.detail`
- `activityLogKeys.list`

Invalidation minimum:

- setelah create booking:
  - dashboard mahasiswa
  - booking saya
  - availability ruangan
- setelah cancel booking:
  - booking detail
  - booking saya
  - dashboard mahasiswa
  - availability ruangan
- setelah approve atau reject:
  - admin bookings list
  - admin booking detail
  - dashboard admin
  - availability bila status menjadi approved
- setelah create atau update room:
  - room list
  - room detail
  - dashboard admin

## Kesimpulan

Frontend Roomify saat ini sudah punya fondasi auth dan layout yang cukup baik, tetapi sebagian besar halaman bisnis masih berada di tahap mock atau belum dibuat. Dari sisi API, kontrak aktif backend sudah cukup kuat untuk mulai mengerjakan:

- dashboard nyata
- rooms mahasiswa
- bookings mahasiswa
- admin bookings
- admin rooms
- activity log

Gap utama yang masih perlu dibereskan adalah module `admin mahasiswa`, karena kebutuhannya sudah ada di PRD frontend tetapi belum muncul di dokumentasi API backend aktif.

Dokumen ini sebaiknya dipakai sebagai acuan implementasi berikutnya, supaya setiap halaman baru langsung jelas:

- endpoint apa yang dipakai
- module backend mana yang disentuh
- flow bisnisnya seperti apa
- dan apakah kontraknya sudah siap atau masih perlu negosiasi dengan backend
