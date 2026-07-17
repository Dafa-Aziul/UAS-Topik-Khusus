# Dokumentasi Teknis Frontend Roomify

## 1. Tujuan Dokumen

Dokumen ini dibuat untuk membantu developer memahami frontend Roomify dari sisi implementasi nyata. Fokus utamanya adalah menjelaskan:

- function, hook, dan komponen penting apa saja yang ada,
- file tempat function itu berada,
- kegunaan function tersebut,
- function itu masuk ke layer mana,
- dan kalau ingin mengubah fitur tertentu, harus mulai dari file mana.

Dokumen ini mengikuti kode frontend yang aktif saat ini, bukan hanya ringkasan arsitektur umum.

## 2. Gambaran Umum Frontend

Frontend Roomify dibangun dengan **Next.js App Router** dan memisahkan tanggung jawab ke beberapa lapisan utama:

`app route` -> `layout / shell` -> `page / client component` -> `hook / React Query` -> `lib/axios` -> `backend API`

State global yang penting dijaga di auth store, sementara data server dikelola lewat React Query. Validasi form menggunakan `react-hook-form` dan `zod`.

Teknologi utama frontend:

- `Next.js`
- `React`
- `TypeScript`
- `@tanstack/react-query`
- `axios`
- `zustand`
- `react-hook-form`
- `zod`
- `recharts`
- `sonner`
- `shadcn/ui`
- `date-fns`

## 3. Struktur Folder dan Tanggung Jawab Layer

### `roomify-frontend/app/`

Layer routing utama berbasis App Router. Area besar seperti `auth`, `mahasiswa`, dan `admin` dipisah melalui route group.

### `roomify-frontend/components/`

Tempat komponen UI, shell layout, dashboard, room cards, booking UI, admin UI, feedback state, dan komponen shadcn.

### `roomify-frontend/hooks/`

Tempat logic async untuk query dan mutation. Ini adalah layer paling penting untuk memahami perilaku data frontend.

### `roomify-frontend/lib/`

Berisi helper global seperti:

- `axios` instance,
- auth request helper,
- rooms API helper,
- bookings API helper,
- dashboard API helper,
- media formatter,
- navigation helper,
- date formatter.

### `roomify-frontend/store/`

Berisi state global auth berbasis Zustand.

### `roomify-frontend/schemas/`

Berisi validasi form berbasis Zod.

### `roomify-frontend/types/`

Menentukan kontrak data antar page, component, hook, dan response API.

### `roomify-frontend/providers/`

Berisi provider seperti `QueryProvider`.

## 4. Peta Frontend dari Atas ke Bawah

### 4.1 Root layout aplikasi

File: `roomify-frontend/app/layout.tsx`

Function penting:

- `RootLayout({ children })`
  Layer: root app layout
  Kegunaan: pembungkus paling atas aplikasi dan tempat memasukkan `AppProviders`.

### 4.2 Provider global

File: `roomify-frontend/app/providers.tsx`

Function penting:

- `AppProviders({ children })`
  Layer: provider global
  Kegunaan:
  - mengaktifkan `QueryProvider`,
  - mengaktifkan `Toaster`,
  - melakukan bootstrap sesi login saat aplikasi pertama kali dimuat.

Logic penting di dalamnya:

- memanggil `refreshSession()`
- lalu memanggil `getCurrentUser(accessToken)`
- jika berhasil, mengisi auth store
- jika gagal, membersihkan session
- lalu menandai state sebagai hydrated

### 4.3 Jalur request frontend

File: `roomify-frontend/lib/axios.ts`

Function dan objek penting:

- `api`
  Layer: client API
  Kegunaan: instance `axios` global yang dipakai seluruh request frontend.

- `refreshClient`
  Layer: client API
  Kegunaan: client khusus refresh token agar tidak bentrok dengan retry request utama.

Peran penting interceptor:

- request interceptor menyisipkan Bearer token dari auth store
- request interceptor menghapus `Content-Type` jika body berupa `FormData`
- response interceptor menangani `401`
- jika `401`, frontend mencoba refresh token
- jika refresh gagal, session dibersihkan
- jika refresh berhasil, request asli diulang dengan token baru

Ini adalah file paling penting untuk memahami auth runtime dan upload `multipart/form-data`.

## 5. Function, Hook, dan Komponen Penting per Layer

## 5.1 Layer Auth

### Helper auth API

File: `roomify-frontend/lib/auth.ts`

Function penting:

- `login(payload)`
  Layer: auth API helper
  Kegunaan: memanggil `POST /auth/login`.

- `register(payload)`
  Layer: auth API helper
  Kegunaan: memanggil `POST /auth/register`.

- `getCurrentUser(accessToken)`
  Layer: auth API helper
  Kegunaan: memanggil `GET /auth/me`.

- `refreshSession()`
  Layer: auth API helper
  Kegunaan: memanggil `POST /auth/refresh`.

- `logout()`
  Layer: auth API helper
  Kegunaan: memanggil `POST /auth/logout`.

- `changePassword(payload)`
  Layer: auth API helper
  Kegunaan: memanggil `PATCH /auth/change-password`.

- `getApiErrorMessage(error)`
  Layer: helper error
  Kegunaan: menormalisasi pesan error untuk UI.

- `getApiErrorCode(error)`
  Layer: helper error
  Kegunaan: mengambil error code backend seperti `INVALID_BOOKING_STATUS` atau `BOOKING_TIME_CONFLICT`.

### Auth state

File: `roomify-frontend/store/auth-store.ts`

State dan function penting:

- `accessToken`
- `user`
- `isHydrated`
- `isAuthenticated`
- `setSession(...)`
- `clearSession()`
- `markHydrated()`

Store ini menjadi source of truth auth state di frontend.

### Komponen auth utama

File penting:

- `components/auth/login-form.tsx`
- `components/auth/register-form.tsx`
- `components/auth/change-password-form.tsx`
- `components/auth/home-redirect.tsx`
- `components/auth/guest-guard.tsx`
- `components/auth/auth-guard.tsx`

Tugas utamanya:

- menampilkan form auth,
- melakukan validasi form,
- memanggil helper auth,
- mengarahkan user ke area sesuai role,
- menahan akses guest atau protected route sesuai konteks.

## 5.2 Layer Shell dan Layout Area

File: `roomify-frontend/components/app/app-shell.tsx`

Function penting:

- `AppShell({ children, title })`
  Layer: protected layout shell
  Kegunaan: menjadi kerangka utama area `mahasiswa` dan `admin`.

Tanggung jawab AppShell:

- membaca user dari auth store,
- menangani logout mutation,
- merender sidebar,
- merender mobile drawer,
- merender top header,
- merender mobile bottom nav,
- mengatur container utama halaman.

Komponen pendukung layout:

- `components/layout/app-sidebar.tsx`
- `components/layout/app-header.tsx`
- `components/layout/mobile-nav-drawer.tsx`
- `components/layout/mobile-bottom-nav.tsx`
- `components/layout/page-header.tsx`

File penting untuk logika active navigation:

- `roomify-frontend/lib/navigation.ts`

Function penting:

- helper untuk mengambil label section berdasarkan path
- helper untuk mengecek item navigation aktif termasuk sub-route

## 5.3 Layer Rooms

### Hook rooms

File: `roomify-frontend/hooks/use-rooms.ts`

Hook penting:

- `useRooms(params)`
  Layer: room query
  Kegunaan: mengambil list ruangan.

- `useRoomDetail(roomId)`
  Layer: room query
  Kegunaan: mengambil detail satu ruangan.

- `useRoomAvailability(roomId, date)`
  Layer: room query
  Kegunaan: mengambil availability ruangan per tanggal.

Objek penting:

- `roomKeys`
  Layer: React Query key factory
  Kegunaan: menjaga konsistensi cache query rooms.

### Helper API rooms

File: `roomify-frontend/lib/rooms.ts`

Function penting:

- `getRooms(params)`
- `getRoomDetail(roomId)`
- `getRoomAvailability(roomId, date)`
- helper create dan update room admin
- builder `FormData` untuk upload gambar room

File ini adalah pusat integrasi rooms frontend ke backend.

### Komponen rooms

File penting:

- `components/rooms/rooms-client.tsx`
- `components/rooms/room-card.tsx`
- `components/rooms/room-detail-client.tsx`
- `components/rooms/availability-timeline.tsx`
- `components/rooms/room-status-badge.tsx`

Tugas komponen:

- merender daftar ruangan,
- merender detail ruangan,
- merender blocked slot booking approved,
- merender status ruangan,
- menyambungkan CTA ke form booking.

## 5.4 Layer Bookings Mahasiswa

### Hook bookings mahasiswa

File: `roomify-frontend/hooks/use-bookings.ts`

Hook penting:

- `useCreateBookingMutation()`
  Layer: booking mutation
  Kegunaan: membuat booking baru lalu invalidate cache booking.

- `useMyBookings(params)`
  Layer: booking query
  Kegunaan: mengambil daftar booking mahasiswa.

- `useMyBookingDetail(bookingId)`
  Layer: booking query
  Kegunaan: mengambil detail booking mahasiswa.

- `useCancelBookingMutation(bookingId)`
  Layer: booking mutation
  Kegunaan: membatalkan booking dan invalidate cache terkait.

Objek penting:

- `bookingKeys`
  Layer: React Query key factory
  Kegunaan: menjaga konsistensi cache booking mahasiswa.

### Helper API bookings

File: `roomify-frontend/lib/bookings.ts`

Function penting:

- `createBooking(payload)`
- `getMyBookings(params)`
- `getMyBookingDetail(bookingId)`
- `cancelMyBooking(bookingId)`

File ini juga berkembang untuk mendukung admin bookings.

### Komponen bookings mahasiswa

File penting:

- `components/bookings/booking-form-client.tsx`
- `components/bookings/booking-list-client.tsx`
- `components/bookings/booking-detail-client.tsx`
- `components/bookings/booking-status-badge.tsx`

Tugas komponen:

- menampilkan form peminjaman,
- menampilkan ringkasan booking,
- menampilkan daftar booking,
- menampilkan timeline status,
- menampilkan dialog konfirmasi pembatalan.

## 5.5 Layer Admin Rooms

### Hook admin rooms

File: `roomify-frontend/hooks/use-admin-rooms.ts`

Hook penting:

- query dan mutation yang berhubungan dengan:
  - create room
  - update room
  - update status room
  - deactivate room

### Komponen admin rooms

File penting:

- `components/admin-rooms/admin-rooms-client.tsx`
- `components/admin-rooms/admin-room-form-client.tsx`
- `components/admin-rooms/admin-room-detail-client.tsx`

Fungsi utama:

- daftar ruangan admin,
- form tambah dan edit ruangan,
- upload dan preview gambar,
- detail ruangan admin,
- aksi ubah status dan nonaktifkan.

## 5.6 Layer Admin Bookings

### Hook admin bookings

File: `roomify-frontend/hooks/use-admin-bookings.ts`

Hook penting:

- query list admin bookings,
- query detail admin booking,
- mutation approve,
- mutation reject,
- mutation complete.

### Komponen admin bookings

File penting:

- `components/admin-bookings/admin-bookings-client.tsx`
- `components/admin-bookings/admin-booking-detail-client.tsx`

Tugas komponen:

- menampilkan list booking admin,
- filter status,
- filter `user_id` dan `room_id`,
- menampilkan detail booking,
- menampilkan aksi approve/reject/complete,
- menampilkan dialog atau pesan error spesifik dari backend.

## 5.7 Layer Dashboard dan Activity Log

### Hook dashboard

File: `roomify-frontend/hooks/use-dashboard.ts`

Hook penting:

- query dashboard mahasiswa,
- query dashboard admin,
- query booking trend,
- query room usage.

### Helper API dashboard

File: `roomify-frontend/lib/dashboard.ts`

Function penting:

- request ke `GET /dashboards/me`
- request ke `GET /dashboards/admin`
- request ke `GET /dashboards/admin/booking-trend`
- request ke `GET /dashboards/admin/room-usage`

### Komponen dashboard

File penting:

- `components/dashboards/mahasiswa-dashboard-client.tsx`
- `components/dashboards/admin-dashboard-client.tsx`
- `components/dashboards/stat-card.tsx`
- `components/dashboards/status-badge.tsx`

### Activity log

File penting:

- `components/activity-logs/activity-logs-client.tsx`

Fungsi utama:

- menampilkan list log aktivitas admin,
- filter dasar,
- pagination,
- dialog detail metadata atau request ID.

## 6. Peta Modul Frontend

## 6.1 Modul Auth

File utama:

- route page: `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`
- provider bootstrap: `app/providers.tsx`
- helper API: `lib/auth.ts`
- store: `store/auth-store.ts`
- API client: `lib/axios.ts`
- guard dan redirect: `components/auth/*`

Kalau ingin ubah:

- validasi auth -> `schemas/auth-schema.ts`, `schemas/register-schema.ts`
- flow login/register/logout -> `lib/auth.ts` dan komponen form
- bootstrap sesi -> `app/providers.tsx`
- refresh token runtime -> `lib/axios.ts`

## 6.2 Modul Layout dan Navigation

File utama:

- `components/app/app-shell.tsx`
- `components/layout/app-sidebar.tsx`
- `components/layout/app-header.tsx`
- `components/layout/mobile-nav-drawer.tsx`
- `components/layout/mobile-bottom-nav.tsx`
- `components/layout/page-header.tsx`
- `lib/navigation.ts`

Kalau ingin ubah:

- active sidebar -> `app-sidebar.tsx` + `lib/navigation.ts`
- mobile nav -> `mobile-bottom-nav.tsx` dan `mobile-nav-drawer.tsx`
- top header -> `app-header.tsx`
- pola page title dan breadcrumb -> `page-header.tsx`

## 6.3 Modul Rooms

File utama:

- `app/(mahasiswa)/mahasiswa/rooms/page.tsx`
- `app/(mahasiswa)/mahasiswa/rooms/[id]/page.tsx`
- `hooks/use-rooms.ts`
- `lib/rooms.ts`
- `components/rooms/*`

Kalau ingin ubah:

- search dan filter list ruangan -> `rooms-client.tsx`
- detail ruangan -> `room-detail-client.tsx`
- availability -> `availability-timeline.tsx`
- API payload rooms -> `lib/rooms.ts` dan `types/room.ts`

## 6.4 Modul Booking Mahasiswa

File utama:

- `app/(mahasiswa)/mahasiswa/bookings/page.tsx`
- `app/(mahasiswa)/mahasiswa/bookings/create/page.tsx`
- `app/(mahasiswa)/mahasiswa/bookings/[id]/page.tsx`
- `hooks/use-bookings.ts`
- `lib/bookings.ts`
- `components/bookings/*`

Kalau ingin ubah:

- create booking -> `booking-form-client.tsx` + `useCreateBookingMutation()`
- list booking -> `booking-list-client.tsx`
- detail booking -> `booking-detail-client.tsx`
- cancel booking -> `useCancelBookingMutation()` dan dialog di detail page

## 6.5 Modul Admin Rooms

File utama:

- `app/(admin)/admin/rooms/page.tsx`
- `app/(admin)/admin/rooms/create/page.tsx`
- `app/(admin)/admin/rooms/[id]/page.tsx`
- `app/(admin)/admin/rooms/[id]/edit/page.tsx`
- `hooks/use-admin-rooms.ts`
- `components/admin-rooms/*`

Kalau ingin ubah:

- list admin room -> `admin-rooms-client.tsx`
- form room -> `admin-room-form-client.tsx`
- detail admin room -> `admin-room-detail-client.tsx`
- upload gambar -> `admin-room-form-client.tsx` + `lib/rooms.ts`

## 6.6 Modul Admin Bookings

File utama:

- `app/(admin)/admin/bookings/page.tsx`
- `app/(admin)/admin/bookings/[id]/page.tsx`
- `hooks/use-admin-bookings.ts`
- `components/admin-bookings/*`

Kalau ingin ubah:

- filter list admin -> `admin-bookings-client.tsx`
- detail dan aksi review -> `admin-booking-detail-client.tsx`
- conflict atau stale handling -> detail admin booking + `getApiErrorCode()`

## 6.7 Modul Dashboard dan Activity Log

File utama:

- `app/(mahasiswa)/mahasiswa/dashboard/page.tsx`
- `app/(admin)/admin/dashboard/page.tsx`
- `app/(admin)/admin/activity-logs/page.tsx`
- `hooks/use-dashboard.ts`
- `lib/dashboard.ts`
- `components/dashboards/*`
- `components/activity-logs/activity-logs-client.tsx`

Kalau ingin ubah:

- source angka dashboard -> `lib/dashboard.ts`
- chart admin -> `admin-dashboard-client.tsx`
- activity log UI -> `activity-logs-client.tsx`

## 7. Panduan Tracing Perubahan

### Jika ingin ubah login atau sesi auth

Mulai dari:

1. `roomify-frontend/app/providers.tsx`
2. `roomify-frontend/lib/auth.ts`
3. `roomify-frontend/lib/axios.ts`
4. `roomify-frontend/store/auth-store.ts`
5. `components/auth/login-form.tsx`

### Jika ingin ubah proteksi halaman

Mulai dari:

1. `components/auth/auth-guard.tsx`
2. `components/auth/guest-guard.tsx`
3. `components/auth/home-redirect.tsx`
4. `components/app/app-shell.tsx`
5. `lib/navigation.ts`

### Jika ingin ubah flow rooms mahasiswa

Mulai dari:

1. `components/rooms/rooms-client.tsx`
2. `hooks/use-rooms.ts`
3. `lib/rooms.ts`
4. `types/room.ts`

### Jika ingin ubah create booking

Mulai dari:

1. `components/bookings/booking-form-client.tsx`
2. `schemas/booking-schema.ts`
3. `hooks/use-bookings.ts`
4. `lib/bookings.ts`

### Jika ingin ubah approval admin

Mulai dari:

1. `components/admin-bookings/admin-booking-detail-client.tsx`
2. `hooks/use-admin-bookings.ts`
3. `lib/bookings.ts`
4. `lib/auth.ts` untuk error code helper

### Jika ingin ubah upload foto ruangan

Mulai dari:

1. `components/admin-rooms/admin-room-form-client.tsx`
2. `lib/rooms.ts`
3. `lib/axios.ts`
4. `lib/media.ts`

## 8. Catatan Teknis Penting

### 8.1 Semua request sebaiknya lewat `api`

Jangan membuat instance `axios` baru untuk fitur baru, karena:

- refresh token interceptor tidak ikut,
- `withCredentials` bisa tidak konsisten,
- handling `FormData` bisa berbeda,
- contract request project jadi bercabang.

### 8.2 Auth store tidak memakai persist

Auth state saat ini hidup di memory, lalu dibangun ulang lewat bootstrap refresh session di `AppProviders`. Ini sengaja agar access token tidak disimpan permanen di local storage.

### 8.3 Upload foto room bergantung pada FormData

Form admin room memakai `multipart/form-data`, jadi perubahan di area ini harus menjaga:

- file input,
- preview lokal,
- normalisasi `image_url`,
- dan request header multipart.

### 8.4 Query keys harus konsisten

Modul rooms, bookings, admin bookings, dan dashboard memakai React Query key factory. Perubahan mutation sebaiknya selalu diikuti invalidasi query yang tepat.

### 8.5 Frontend mengikuti contract backend aktif

Banyak komponen seperti admin booking detail, room detail, dan dashboard sekarang bergantung pada shape response backend yang aktif. Jadi perubahan tipe data sebaiknya dimulai dari `types/*` dan `lib/*`.

## 9. Saran Tambahan

Untuk memperkuat dokumentasi frontend ke depan, beberapa tambahan yang berguna:

- tabel ringkas `fitur -> page -> hook -> endpoint`,
- diagram auth flow dan booking flow,
- daftar reusable component penting,
- daftar query key utama,
- section debugging cepat untuk `401`, upload gambar, booking conflict, dan refresh session.

## 10. Kesimpulan

Frontend Roomify sudah memiliki struktur yang cukup rapi: route dipisah per area, shell protected page sudah jelas, auth state terpusat, request API konsisten lewat satu client, dan business flow utama ditempatkan di hook dan helper API.

Kalau ingin memahami codebase dengan cepat, tiga alur terbaik untuk dipelajari lebih dulu adalah:

1. auth dan bootstrap session,
2. rooms dan booking mahasiswa,
3. admin rooms dan admin booking review.
