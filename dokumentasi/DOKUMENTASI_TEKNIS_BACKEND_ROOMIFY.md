# Dokumentasi Teknis Backend Roomify

## 1. Tujuan Dokumen

Dokumen ini dibuat untuk membantu developer memahami backend Roomify dari sisi implementasi nyata. Fokus utamanya bukan hanya menjelaskan arsitektur, tetapi juga menunjukkan:

- function, endpoint, atau method penting apa saja yang ada,
- file tempat function itu berada,
- kegunaan function tersebut,
- function itu masuk ke layer mana,
- dan kalau ingin mengubah fitur tertentu, harus mulai dari file mana.

Dokumen ini disusun berdasarkan **kode backend yang aktif saat ini**, bukan hanya dari draft PRD atau dokumentasi umum.

## 2. Gambaran Umum Backend

Backend Roomify menggunakan **FastAPI** dengan pola pemisahan layer yang cukup jelas. Request biasanya bergerak melalui alur berikut:

`app.main` -> `api router` -> `endpoint` -> `dependency auth/role` -> `service` -> `repository` -> `database`

Komponen lintas fitur seperti auth, logging, request ID, cache invalidation, upload file, dan error handler diletakkan di area terpisah agar bisa dipakai ulang.

Teknologi utama backend:

- `FastAPI`
- `Pydantic`
- `MongoDB`
- `Redis`
- `JWT`
- `Uvicorn`
- `Pytest`
- `Docker Compose`

## 3. Struktur Folder dan Tanggung Jawab Layer

### `backend/app/main.py`

Entry point aplikasi FastAPI. File ini bertugas membuat objek `FastAPI`, mengaktifkan middleware, mendaftarkan router, mengaktifkan static file uploads, dan menyambungkan lifecycle `lifespan`.

### `backend/app/api/`

Layer API yang berisi:

- `router.py` untuk registrasi semua endpoint,
- `endpoints/` untuk function handler HTTP,
- `dependencies.py` untuk dependency auth dan role.

### `backend/app/services/`

Layer business logic utama. Di sinilah aturan validasi bisnis, konflik jadwal, transisi status, dan orkestrasi beberapa repository dilakukan.

### `backend/app/repositories/`

Layer akses data. Repository bertugas membaca dan menulis data ke koleksi database, termasuk query list, detail, update, soft delete, dan pencarian khusus.

### `backend/app/schemas/`

Schema request dan response berbasis Pydantic. Layer ini menjadi contract data antar endpoint, service, dan frontend.

### `backend/app/core/`

Berisi komponen inti seperti:

- konfigurasi aplikasi,
- security JWT dan hashing,
- logging,
- exception custom,
- dan error handler global.

### `backend/app/database/`

Mengelola koneksi database dan resource eksternal seperti:

- `mongodb.py`
- `redis.py`
- `indexes.py`

### `backend/app/cache/`

Menangani cache key, cache client, dan invalidation yang mendukung performa atau konsistensi data.

### `backend/app/utils/`

Berisi helper umum seperti:

- pagination,
- object id,
- datetime,
- upload file,
- slug.

### `backend/app/middleware/`

Middleware lintas request, terutama:

- `RequestIDMiddleware`
- `AccessLogMiddleware`

## 4. Peta Backend dari Atas ke Bawah

### 4.1 Entry point aplikasi

File: `backend/app/main.py`

Function dan komponen penting:

- `app = FastAPI(...)`
  Layer: bootstrap aplikasi
  Kegunaan: membuat aplikasi utama dan menyambungkan `lifespan`.

- `app.add_middleware(CORSMiddleware, ...)`
  Layer: middleware bootstrap
  Kegunaan: mengizinkan frontend melakukan request dengan credentials.

- `app.add_middleware(RequestIDMiddleware)`
  Layer: middleware observability
  Kegunaan: menyisipkan request ID ke setiap request agar tracing lebih mudah.

- `app.add_middleware(AccessLogMiddleware)`
  Layer: middleware logging
  Kegunaan: mencatat access log request-response.

- `register_exception_handlers(app)`
  Layer: error handling
  Kegunaan: memastikan semua error penting dikembalikan dalam format response yang konsisten.

- `app.include_router(api_router)`
  Layer: routing bootstrap
  Kegunaan: mendaftarkan seluruh router API.

- `app.mount("/uploads", StaticFiles(...))`
  Layer: static file
  Kegunaan: melayani gambar ruangan yang diupload admin.

### 4.2 Registrasi semua route

File: `backend/app/api/router.py`

Function penting:

- `api_router.include_router(...)`
  Layer: routing registry
  Kegunaan: menyatukan endpoint:
  - root
  - health
  - auth
  - users
  - rooms
  - admin rooms
  - bookings
  - admin bookings
  - dashboards
  - activity logs

Catatan:

- backend Roomify saat ini tidak memakai prefix global seperti `/api` atau `/api/v1`
- route berjalan langsung dari root path seperti `/auth/login`, `/rooms`, `/bookings`, dan `/admin/rooms`

### 4.3 Dependency auth dan role

File: `backend/app/api/dependencies.py`

Function penting yang secara arsitektural sangat penting:

- dependency untuk mengambil user aktif dari access token,
- dependency untuk memastikan akun aktif,
- dependency untuk memastikan role tertentu seperti `ADMIN`.

Layer ini adalah gerbang proteksi backend. Frontend boleh punya role guard untuk UX, tetapi pembatasan akses final tetap terjadi di sini.

## 5. Function dan Method Penting per Layer

## 5.1 Layer Endpoint

File utama:

- `backend/app/api/endpoints/auth.py`
- `backend/app/api/endpoints/rooms.py`
- `backend/app/api/endpoints/bookings.py`
- `backend/app/api/endpoints/dashboards.py`
- `backend/app/api/endpoints/activity_logs.py`
- `backend/app/api/endpoints/users.py`

Tanggung jawab endpoint:

- menerima request HTTP,
- membaca query, body, form-data, dan path param,
- memanggil dependency auth/role,
- memanggil service,
- membentuk response Pydantic.

### Auth endpoint

File: `backend/app/api/endpoints/auth.py`

Function penting:

- `register()`
  Layer: endpoint auth
  Kegunaan: registrasi mahasiswa baru dan mencatat activity log.

- `login()`
  Layer: endpoint auth
  Kegunaan: login menggunakan email, membuat access token dan refresh token, lalu menyetel cookie refresh token.

- `refresh()`
  Layer: endpoint auth
  Kegunaan: membaca cookie refresh token, membuat access token baru, dan merotasi refresh token.

- `logout()`
  Layer: endpoint auth
  Kegunaan: revoke refresh token dan menghapus cookie session.

- `me()`
  Layer: endpoint auth
  Kegunaan: mengembalikan profil user yang sedang login.

- `change_password()`
  Layer: endpoint auth
  Kegunaan: mengubah password user yang sedang login dan mencatat activity log.

### Rooms endpoint

File: `backend/app/api/endpoints/rooms.py`

Function penting:

- `list_rooms()`
  Kegunaan: mengambil daftar ruangan publik dengan search, filter, sort, dan pagination.

- `get_room_detail(room_id)`
  Kegunaan: mengambil detail satu ruangan publik.

- `get_room_availability(room_id, date)`
  Kegunaan: mengambil availability ruangan berdasarkan tanggal.

- `create_room()`
  Kegunaan: membuat ruangan admin melalui multipart form dan upload gambar.

- `get_admin_room_detail(room_id)`
  Kegunaan: mengambil detail ruangan untuk konteks admin.

- `update_room(room_id)`
  Kegunaan: mengubah data ruangan, termasuk ganti atau hapus gambar.

- `update_room_status(room_id)`
  Kegunaan: mengubah status ruangan.

- `delete_room(room_id)`
  Kegunaan: menonaktifkan ruangan melalui soft delete.

Catatan teknis penting:

- endpoint create dan update room memakai `form-data`
- parsing field dilakukan manual lewat helper seperti:
  - `_get_required_text()`
  - `_get_required_int()`
  - `_parse_facilities()`
  - `_get_image_file()`

### Bookings endpoint

File: `backend/app/api/endpoints/bookings.py`

Function penting:

- `create_booking()`
  Kegunaan: mahasiswa membuat permohonan booking.

- `list_my_bookings()`
  Kegunaan: mahasiswa melihat daftar booking miliknya.

- `get_booking_detail(booking_id)`
  Kegunaan: mahasiswa melihat detail satu booking.

- `cancel_booking(booking_id)`
  Kegunaan: mahasiswa membatalkan booking yang masih diperbolehkan.

- `list_admin_bookings()`
  Kegunaan: admin melihat semua booking dengan filter dan pagination.

- `get_admin_booking_detail(booking_id)`
  Kegunaan: admin melihat detail satu booking.

- `approve_booking(booking_id)`
  Kegunaan: admin menyetujui booking.

- `reject_booking(booking_id)`
  Kegunaan: admin menolak booking.

- `complete_booking(booking_id)`
  Kegunaan: admin menandai booking selesai.

## 5.2 Layer Service

Service adalah tempat paling penting untuk memahami rule bisnis Roomify.

### AuthService

File: `backend/app/services/auth_service.py`

Method penting:

- `register_student(...)`
  Layer: auth service
  Kegunaan: cek duplikasi NIM dan email, hash password, lalu membuat user mahasiswa.

- `login(...)`
  Layer: auth service
  Kegunaan: verifikasi kredensial, cek status akun, membuat access token, membuat refresh token, dan menyimpan hash refresh token.

- `refresh_access_token(refresh_token)`
  Layer: auth service
  Kegunaan: memvalidasi refresh token, mengecek revocation, merotasi refresh token, lalu membuat access token baru.

- `logout(refresh_token)`
  Layer: auth service
  Kegunaan: revoke refresh token.

- `get_user_from_refresh_token(refresh_token)`
  Layer: auth service
  Kegunaan: mengambil user dari refresh token untuk keperluan logout logging.

- `get_current_user_profile(user_id)`
  Layer: auth service
  Kegunaan: mengambil profil user aktif.

- `change_password(...)`
  Layer: auth service
  Kegunaan: memverifikasi password lama dan memperbarui password baru.

### RoomService

File: `backend/app/services/room_service.py`

Method penting:

- `list_rooms(...)`
  Layer: room service
  Kegunaan: membaca list publik, lalu menerapkan search, building filter, status filter, min capacity, facility, sort, dan pagination.

- `get_room_detail(room_id)`
  Layer: room service
  Kegunaan: mengambil detail ruangan publik.

- `get_room_availability(room_id, booking_day)`
  Layer: room service
  Kegunaan: membangun blocked slots dari booking yang sudah `APPROVED`.

- `create_room(payload, actor_id)`
  Layer: room service
  Kegunaan: validasi kode ruangan unik lalu membuat ruangan baru.

- `update_room(room_id, payload, actor_id)`
  Layer: room service
  Kegunaan: memperbarui field ruangan yang berubah saja.

- `get_room_for_admin(room_id)`
  Layer: room service
  Kegunaan: mengambil detail ruangan tanpa filter publik.

- `update_room_status(room_id, status, actor_id)`
  Layer: room service
  Kegunaan: memvalidasi status lalu memperbarui status ruangan.

- `delete_room(room_id, actor_id)`
  Layer: room service
  Kegunaan: menandai ruangan sebagai terhapus secara soft delete.

### BookingService

File: `backend/app/services/booking_service.py`

Method penting:

- `create_booking(request, current_user)`
  Layer: booking service
  Kegunaan: method inti bisnis booking mahasiswa.

  Validasi penting yang dilakukan:

  - tanggal tidak boleh di masa lalu,
  - `end_at > start_at`,
  - durasi minimal,
  - durasi maksimal,
  - batas pengajuan maksimal beberapa hari ke depan,
  - jam operasional,
  - status ruangan harus `AVAILABLE`,
  - jumlah peserta tidak boleh melebihi kapasitas,
  - konflik dengan booking approved lain.

- `list_my_bookings(...)`
  Layer: booking service
  Kegunaan: mengambil daftar booking mahasiswa dengan filter dan pagination.

- `get_booking_detail(booking_id, user_id)`
  Layer: booking service
  Kegunaan: mengambil detail booking milik mahasiswa tertentu.

- `cancel_booking(booking_id, user_id)`
  Layer: booking service
  Kegunaan: memastikan booking masih boleh dibatalkan berdasarkan status, waktu mulai, dan batas pembatalan.

- `list_admin_bookings(...)`
  Layer: booking service
  Kegunaan: mengambil seluruh booking untuk admin dengan filter dan pagination.

- `get_admin_booking_detail(booking_id)`
  Layer: booking service
  Kegunaan: mengambil detail booking untuk admin.

- `approve_booking(...)`
  Layer: booking service
  Kegunaan: menyetujui booking bila status masih `PENDING` dan tidak bentrok dengan booking approved lain.

- `reject_booking(...)`
  Layer: booking service
  Kegunaan: menolak booking `PENDING`.

- `complete_booking(...)`
  Layer: booking service
  Kegunaan: menandai booking `APPROVED` menjadi `COMPLETED`.

Method internal penting:

- `_validate_approval_conflict(booking)`
- `_build_booking_detail(booking)`
- `_sort_bookings(bookings, sort)`
- `_get_local_timezone(timezone_name)`

### DashboardService

File: `backend/app/services/dashboard_service.py`

Layer: dashboard service

Tugas utama:

- mengambil statistik mahasiswa,
- mengambil statistik admin,
- mengambil trend booking,
- mengambil usage ruangan.

Ini adalah service utama untuk semua data dashboard yang dipakai frontend.

### ActivityLogService

File: `backend/app/services/activity_log_service.py`

Layer: audit service

Tugas utama:

- menyimpan jejak aksi penting seperti login, logout, create room, update room, create booking, approve, reject, dan complete booking.

Hampir semua aksi penting lintas modul memanggil service ini.

## 5.3 Layer Repository

Repository adalah tempat utama untuk query database.

### UserRepository

File: `backend/app/repositories/user_repository.py`

Method penting:

- `find_by_nim()`
- `find_by_email()`
- `find_by_id()`
- `create_user()`
- `update_password()`

Repository ini sangat penting karena dipakai oleh auth dan detail booking.

### RefreshTokenRepository

File: `backend/app/repositories/refresh_token_repository.py`

Method penting:

- `save_token()`
- `find_by_jti()`
- `revoke_token()`

Repository ini adalah inti flow refresh token backend.

### RoomRepository

File: `backend/app/repositories/room_repository.py`

Method penting:

- `list_public_rooms()`
- `find_public_by_id()`
- `find_by_id()`
- `find_by_code()`
- `create_room()`
- `update_room()`
- `soft_delete_room()`

### BookingRepository

File: `backend/app/repositories/booking_repository.py`

Method penting:

- `create_booking()`
- `find_by_id()`
- `list_by_user()`
- `list_all()`
- `update_booking()`
- `find_approved_by_room_and_date()`

Repository ini sangat penting karena dipakai oleh booking, availability, dan conflict checking.

### ActivityLogRepository

File: `backend/app/repositories/activity_log_repository.py`

Method penting:

- create dan list log aktivitas

Repository ini mendukung halaman activity log admin.

## 5.4 Layer Schema

Schema utama berada di:

- `backend/app/schemas/auth.py`
- `backend/app/schemas/room.py`
- `backend/app/schemas/booking.py`
- `backend/app/schemas/dashboard.py`
- `backend/app/schemas/activity_log.py`
- `backend/app/schemas/common.py`
- `backend/app/schemas/user.py`

Tugas schema:

- validasi request body,
- membentuk response model,
- memastikan struktur data backend konsisten,
- menjadi contract yang dipakai frontend.

Contoh penting:

- `LoginRequest`, `RegisterRequest`, `ChangePasswordRequest`
- `CreateBookingRequest`, `AdminBookingReviewRequest`
- `AdminRoomCreateRequest`, `AdminRoomUpdateRequest`, `AdminRoomStatusUpdateRequest`
- `PaginationMeta` dan response envelope umum

## 6. Peta Modul Backend

## 6.1 Modul Auth

File utama:

- route: `backend/app/api/endpoints/auth.py`
- service: `backend/app/services/auth_service.py`
- repository: `backend/app/repositories/user_repository.py`
- repository refresh token: `backend/app/repositories/refresh_token_repository.py`
- schema: `backend/app/schemas/auth.py`
- security: `backend/app/core/security.py`

Kalau ingin ubah:

- validasi auth -> schema auth
- flow login dan refresh -> `AuthService`
- cookie refresh token -> endpoint auth
- hashing dan JWT -> `core/security.py`

## 6.2 Modul Rooms

File utama:

- route: `backend/app/api/endpoints/rooms.py`
- service: `backend/app/services/room_service.py`
- repository: `backend/app/repositories/room_repository.py`
- schema: `backend/app/schemas/room.py`
- upload util: `backend/app/utils/uploads.py`

Kalau ingin ubah:

- query room list -> `RoomService.list_rooms()` dan `RoomRepository`
- availability -> `RoomService.get_room_availability()`
- upload gambar -> endpoint rooms + `utils/uploads.py`
- soft delete -> `RoomService.delete_room()` dan `RoomRepository.soft_delete_room()`

## 6.3 Modul Bookings

File utama:

- route: `backend/app/api/endpoints/bookings.py`
- service: `backend/app/services/booking_service.py`
- repository: `backend/app/repositories/booking_repository.py`
- schema: `backend/app/schemas/booking.py`

Kalau ingin ubah:

- validasi create booking -> `BookingService.create_booking()`
- daftar booking mahasiswa -> `list_my_bookings()`
- cancel flow -> `cancel_booking()`
- approve/reject/complete -> `approve_booking()`, `reject_booking()`, `complete_booking()`
- conflict handling -> `_validate_approval_conflict()`

## 6.4 Modul Dashboards

File utama:

- route: `backend/app/api/endpoints/dashboards.py`
- service: `backend/app/services/dashboard_service.py`
- repository: data source terkait dashboard
- schema: `backend/app/schemas/dashboard.py`

Kalau ingin ubah:

- statistik card -> dashboard service
- trend dan usage -> dashboard service

## 6.5 Modul Activity Logs

File utama:

- route: `backend/app/api/endpoints/activity_logs.py`
- service: `backend/app/services/activity_log_service.py`
- repository: `backend/app/repositories/activity_log_repository.py`
- schema: `backend/app/schemas/activity_log.py`

Kalau ingin ubah:

- format log -> activity log schema
- detail metadata log -> service dan repository
- filter list log -> endpoint dan repository

## 7. Panduan Tracing Perubahan

### Jika ingin ubah login atau refresh token

Mulai dari:

1. `backend/app/api/endpoints/auth.py`
2. `backend/app/services/auth_service.py`
3. `backend/app/repositories/refresh_token_repository.py`
4. `backend/app/repositories/user_repository.py`
5. `backend/app/core/security.py`

### Jika ingin ubah flow create booking

Mulai dari:

1. `backend/app/api/endpoints/bookings.py`
2. `backend/app/services/booking_service.py`
3. `backend/app/repositories/booking_repository.py`
4. `backend/app/repositories/room_repository.py`
5. `backend/app/schemas/booking.py`

### Jika ingin ubah flow approval admin

Mulai dari:

1. `backend/app/api/endpoints/bookings.py`
2. `backend/app/services/booking_service.py`
3. `_validate_approval_conflict()`
4. `backend/app/repositories/booking_repository.py`

### Jika ingin ubah room upload atau edit room

Mulai dari:

1. `backend/app/api/endpoints/rooms.py`
2. `backend/app/services/room_service.py`
3. `backend/app/utils/uploads.py`
4. `backend/app/repositories/room_repository.py`

### Jika ingin tambah endpoint baru

Urutan kerja yang disarankan:

1. tentukan path dan method HTTP di `api/endpoints`,
2. tambahkan dependency auth/role bila perlu,
3. taruh rule bisnis di `services`,
4. taruh query database di `repositories`,
5. tambahkan schema request/response,
6. registrasikan endpoint lewat `api/router.py` bila modul baru.

## 8. Catatan Teknis Penting

### 8.1 Backend memakai refresh token cookie

Access token dikirim lewat Bearer token, tetapi refresh session bergantung pada cookie `refresh_token`. Ini penting saat debugging auth antara frontend dan backend.

### 8.2 Upload gambar room menggunakan form-data

Create dan update room tidak memakai JSON biasa. Endpoint membaca multipart form secara manual dan mendukung:

- `image_file`
- `remove_image`
- `facilities` berulang atau array string

### 8.3 Availability hanya memblokir booking approved

Availability ruangan dibangun dari booking yang sudah `APPROVED`, bukan semua booking `PENDING`.

### 8.4 Soft delete ruangan

`DELETE /admin/rooms/{room_id}` bukan hard delete permanen. Ini adalah nonaktifkan ruangan dari sistem.

### 8.5 Banyak alur penting mencatat activity log

Auth, rooms, dan bookings terhubung ke `ActivityLogService`, jadi perubahan di flow bisnis sering berdampak juga ke audit trail.

## 9. Saran Tambahan

Jika dokumentasi ini ingin diperkuat lagi ke depan, beberapa tambahan yang berguna:

- tabel ringkas `fitur -> endpoint -> service -> repository`,
- diagram auth flow dan booking approval flow,
- daftar environment variable penting backend,
- daftar error code penting per modul,
- daftar test integration yang sudah ada dan yang masih kurang.

## 10. Kesimpulan

Backend Roomify sudah memakai pola yang cukup rapi: endpoint, dependency auth, service, repository, schema, middleware, cache, dan utilitas dipisahkan dengan jelas. Untuk developer baru, titik paling penting untuk dipahami lebih dulu adalah:

- `app.main` sebagai pintu masuk bootstrap,
- `api/router.py` sebagai registrasi seluruh modul,
- `AuthService` sebagai pusat auth flow,
- `RoomService` sebagai pusat modul ruangan,
- `BookingService` sebagai pusat aturan bisnis peminjaman.

Kalau tujuan Anda adalah tracing cepat di codebase, tiga alur terbaik untuk dipelajari lebih dulu adalah:

1. auth flow,
2. create booking dan cancel flow,
3. admin review booking dan room management.
