# Ringkasan Project Fullstack - Roomify

## 1. Gambaran Umum Project

Project ini adalah sistem **peminjaman ruangan kampus** berbasis web yang terdiri dari **backend API** dan **frontend web** yang saling terhubung. Tujuan utamanya adalah membantu mahasiswa mencari ruangan, melihat kapasitas dan fasilitas, mengecek ketersediaan jadwal, mengajukan peminjaman, serta memantau status permohonan.

Di sisi lain, admin menggunakan aplikasi yang sama untuk:

- mengelola data ruangan,
- memproses permohonan peminjaman,
- melihat dashboard operasional,
- memantau tren penggunaan ruangan,
- dan menelusuri activity log sistem.

Secara umum, alur sistemnya adalah:

1. Pengguna login melalui frontend.
2. Frontend mengirim request ke backend menggunakan access token dan cookie refresh token.
3. Backend memvalidasi sesi dan role pengguna.
4. Mahasiswa dapat mencari ruangan dan membuat permohonan peminjaman.
5. Admin dapat meninjau, menyetujui, menolak, atau menyelesaikan permohonan.
6. Sistem menyimpan jejak aktivitas dan memperbarui data dashboard secara konsisten.

Role utama yang dipakai saat ini:

- `MAHASISWA`
- `ADMIN`

Ringkasan ini disusun berdasarkan kondisi source project per **Thursday, July 16, 2026**.

## 2. Struktur Workspace Project

Workspace full stack saat ini terbagi menjadi tiga folder utama:

- `backend/`
  Menyimpan API utama Roomify.
- `roomify-frontend/`
  Menyimpan frontend web berbasis Next.js.
- `dokumentasi/`
  Menyimpan dokumentasi lintas backend dan frontend, termasuk ringkasan, dokumentasi teknis, dan referensi project.

Secara praktis, `backend` dan `roomify-frontend` adalah dua aplikasi utama yang berjalan bersama.

## 3. Arsitektur Frontend

Frontend dibangun menggunakan **Next.js App Router** dan disusun dengan pola komponen, hook, utilitas, schema validasi, dan store yang cukup rapi.

Teknologi utama frontend:

- `Next.js` 16
- `React` 19
- `TypeScript`
- `@tanstack/react-query`
- `axios`
- `zustand`
- `react-hook-form`
- `zod`
- `recharts`
- `shadcn/ui`
- `sonner`
- `date-fns`

### Struktur utama frontend

- `roomify-frontend/app/`
  Menyimpan route, layout, dan page berbasis App Router.
- `roomify-frontend/components/`
  Menyimpan komponen UI reusable dan komponen fitur.
- `roomify-frontend/hooks/`
  Menyimpan query dan mutation berbasis React Query.
- `roomify-frontend/lib/`
  Menyimpan helper global seperti auth, axios, rooms, bookings, dashboard, navigation, dan formatter.
- `roomify-frontend/store/`
  Menyimpan auth state global.
- `roomify-frontend/schemas/`
  Menyimpan validasi form berbasis Zod.
- `roomify-frontend/types/`
  Menyimpan kontrak tipe data domain.
- `roomify-frontend/providers/`
  Menyimpan provider seperti React Query.

### Pola kerja frontend

Frontend memakai pola berikut:

- `page.tsx` menjadi entry halaman,
- `components` menangani tampilan,
- `hooks` menangani query dan mutation,
- `lib/axios.ts` menjadi pusat komunikasi API,
- `store/auth-store.ts` menyimpan auth state,
- `schemas` menangani validasi form.

Dengan pola ini, logic bisnis tidak ditumpuk di file halaman, sehingga struktur project lebih mudah dirawat dan dikembangkan.

## 4. Area dan Modul Utama Frontend

Frontend saat ini sudah memiliki area utama berikut:

### Area autentikasi

Route utama:

- `/login`
- `/register`

Kemampuan utama:

- registrasi mahasiswa,
- login,
- bootstrap sesi,
- refresh token,
- logout,
- role-based redirect.

### Area mahasiswa

Route utama:

- `/mahasiswa/dashboard`
- `/mahasiswa/rooms`
- `/mahasiswa/rooms/[id]`
- `/mahasiswa/bookings`
- `/mahasiswa/bookings/create`
- `/mahasiswa/bookings/[id]`
- `/mahasiswa/profile`

Fungsi utama:

- melihat dashboard mahasiswa,
- mencari dan memfilter ruangan,
- melihat detail ruangan dan availability,
- membuat peminjaman,
- melihat daftar peminjaman sendiri,
- melihat detail peminjaman,
- membatalkan peminjaman yang masih diperbolehkan,
- melihat profil dan mengubah password.

### Area admin

Route utama:

- `/admin/dashboard`
- `/admin/rooms`
- `/admin/rooms/create`
- `/admin/rooms/[id]`
- `/admin/rooms/[id]/edit`
- `/admin/bookings`
- `/admin/bookings/[id]`
- `/admin/activity-logs`

Fungsi utama:

- melihat dashboard operasional,
- mengelola ruangan,
- melihat detail ruangan,
- mengubah status ruangan,
- menonaktifkan ruangan,
- melihat daftar permohonan,
- menyetujui, menolak, dan menyelesaikan booking,
- melihat activity log sistem.

### Komponen layout utama

Frontend juga sudah memiliki fondasi layout yang jelas:

- `AppShell`
- `AppSidebar`
- `AppHeader`
- `PageHeader`
- `MobileBottomNavigation`
- `MobileNavDrawer`

Ini menunjukkan bahwa frontend bukan lagi bootstrap awal, tetapi sudah masuk fase implementasi aplikasi yang nyata.

## 5. Arsitektur Backend

Backend dibangun menggunakan **FastAPI** dengan struktur berlapis yang cukup rapi.

Teknologi utama backend:

- `FastAPI`
- `Pydantic`
- `MongoDB`
- `Redis`
- `JWT`
- `Uvicorn`
- `Pytest`
- `Docker Compose`

### Struktur utama backend

- `backend/app/main.py`
  Entry point aplikasi FastAPI.
- `backend/app/api/`
  Menyimpan router, endpoint, dependency, dan wiring API.
- `backend/app/services/`
  Menyimpan business logic per modul.
- `backend/app/repositories/`
  Menyimpan akses data ke database.
- `backend/app/schemas/`
  Menyimpan schema request dan response.
- `backend/app/database/`
  Menyimpan koneksi MongoDB dan Redis.
- `backend/app/core/`
  Menyimpan konfigurasi, security, logging, exception, dan error handler.
- `backend/app/cache/`
  Menyimpan utilitas cache dan invalidation.
- `backend/app/utils/`
  Menyimpan helper seperti pagination, datetime, object id, dan upload file.
- `backend/app/tests/`
  Menyimpan integration test dan unit test.

### Pola kerja backend

Alur request backend secara umum:

1. Request masuk ke endpoint FastAPI.
2. Endpoint memanggil dependency auth dan role sesuai kebutuhan.
3. Endpoint meneruskan proses ke service layer.
4. Service memanggil repository atau cache bila diperlukan.
5. Repository berinteraksi dengan database.
6. Backend mengembalikan response dengan envelope yang konsisten.

Format response umum backend:

- `success`
- `message`
- `data`
- `meta`
- `request_id`
- `timestamp`

Ini membuat integrasi frontend-backend lebih konsisten dan mudah dipelihara.

## 6. Autentikasi dan Otorisasi Sistem

Backend memakai dua mekanisme utama:

- `Authorization: Bearer <access_token>` untuk endpoint terproteksi
- cookie `refresh_token` `HttpOnly` untuk refresh session

Endpoint auth utama:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`
- `PATCH /auth/change-password`

### Cara kerja auth secara umum

1. User login melalui frontend.
2. Backend mengirim `access_token` di body response.
3. Backend juga menyetel cookie `refresh_token`.
4. Frontend menyimpan access token di memory store.
5. Untuk request terproteksi, frontend mengirim Bearer token.
6. Jika access token habis, frontend mencoba `POST /auth/refresh`.
7. Jika refresh berhasil, frontend meminta access token baru dan melanjutkan sesi.
8. Jika refresh gagal, frontend menghapus state auth dan mengarahkan user ke login.

### Otorisasi

Backend memisahkan akses berdasarkan role:

- `MAHASISWA` untuk area pengguna mahasiswa
- `ADMIN` untuk area administratif

Frontend juga memiliki `guest guard`, `auth guard`, dan role-aware routing untuk membantu UX, tetapi sumber kebenaran akses tetap ada di backend.

## 7. Modul dan Endpoint Utama Backend

Berikut module utama backend yang sudah terlihat nyata di source dan dokumentasi.

### Auth module

Mengurus:

- register,
- login,
- refresh,
- logout,
- current user,
- change password.

### Rooms module

Endpoint utama:

- `GET /rooms`
- `GET /rooms/{room_id}`
- `GET /rooms/{room_id}/availability`

Fungsi utama:

- daftar ruangan,
- detail ruangan,
- ketersediaan ruangan berdasarkan tanggal.

### Student bookings module

Endpoint utama:

- `POST /bookings`
- `GET /bookings/me`
- `GET /bookings/{booking_id}`
- `PATCH /bookings/{booking_id}/cancel`

Fungsi utama:

- membuat booking mahasiswa,
- melihat riwayat booking,
- melihat detail booking,
- membatalkan booking yang masih valid.

### Admin rooms module

Endpoint utama:

- `POST /admin/rooms`
- `PATCH /admin/rooms/{room_id}`
- `PATCH /admin/rooms/{room_id}/status`
- `DELETE /admin/rooms/{room_id}`

Fungsi utama:

- menambah ruangan,
- mengubah ruangan,
- mengubah status ruangan,
- menonaktifkan ruangan dari sistem.

### Admin bookings module

Endpoint utama:

- `GET /admin/bookings`
- `GET /admin/bookings/{booking_id}`
- `PATCH /admin/bookings/{booking_id}/approve`
- `PATCH /admin/bookings/{booking_id}/reject`
- `PATCH /admin/bookings/{booking_id}/complete`

Fungsi utama:

- melihat semua permohonan,
- meninjau detail booking,
- approve,
- reject,
- complete booking.

### Dashboard module

Endpoint utama:

- `GET /dashboards/me`
- `GET /dashboards/admin`
- `GET /dashboards/admin/booking-trend`
- `GET /dashboards/admin/room-usage`

Fungsi utama:

- menampilkan ringkasan dashboard mahasiswa,
- menampilkan ringkasan dashboard admin,
- menyediakan data tren booking,
- menyediakan data penggunaan ruangan.

### Activity log module

Endpoint utama:

- `GET /activity-logs`

Fungsi utama:

- melihat audit trail,
- menelusuri aktivitas penting sistem,
- membantu admin melakukan pengecekan historis operasional.

## 8. Keterhubungan Frontend dan Backend

Hubungan frontend dan backend di project ini sudah cukup jelas dan modular.

### Jalur data utama

1. User berinteraksi dengan halaman di `roomify-frontend/app/`.
2. Halaman memakai komponen dan hook dari `components/` dan `hooks/`.
3. Hook mengirim request lewat `lib/axios.ts`.
4. Axios mengambil `baseURL` dari env frontend.
5. Backend menerima request, memvalidasi auth, role, payload, dan aturan bisnis.
6. Backend mengembalikan response dalam envelope standar.
7. Frontend menampilkan data, status, toast, atau dialog sesuai hasil response.

### Contoh integrasi penting

- login frontend -> `POST /auth/login`
- bootstrap sesi -> `POST /auth/refresh` lalu `GET /auth/me`
- list ruangan -> `GET /rooms`
- detail ruangan -> `GET /rooms/{room_id}`
- cek availability -> `GET /rooms/{room_id}/availability`
- create booking -> `POST /bookings`
- daftar booking mahasiswa -> `GET /bookings/me`
- dashboard admin -> endpoint `dashboards/admin`, `booking-trend`, dan `room-usage`
- approval booking admin -> `PATCH /admin/bookings/{booking_id}/approve`
- log aktivitas -> `GET /activity-logs`

Dengan pola ini, frontend bertugas menangani pengalaman pengguna, sedangkan backend menjadi pusat validasi, otorisasi, aturan status, konflik waktu, dan penyimpanan data.

## 9. Fitur End-to-End yang Sudah Terlihat

Berikut fitur utama yang secara nyata sudah terlihat dibangun di project ini.

### Fitur mahasiswa

- registrasi akun mahasiswa
- login dan logout
- bootstrap sesi
- dashboard mahasiswa
- pencarian ruangan
- filter ruangan
- detail ruangan
- availability ruangan per tanggal
- form peminjaman
- daftar peminjaman saya
- detail peminjaman
- pembatalan booking
- profil pengguna
- ubah password

### Fitur admin

- login ke area admin
- dashboard admin
- tren booking
- usage ruangan
- daftar ruangan admin
- tambah ruangan
- edit ruangan
- detail ruangan admin
- ubah status ruangan
- nonaktifkan ruangan
- daftar booking admin
- detail booking admin
- approve booking
- reject booking
- complete booking
- activity log

### Fitur sistem UI

- role-based layout
- sidebar aktif berdasarkan route dan sub-route
- header halaman konsisten
- mobile navigation
- pagination
- loading state
- empty state
- error state
- dialog konfirmasi
- toast feedback

## 10. Apa yang Sudah Dibuat di Project Ini

Jika dijelaskan sebagai hasil pembangunan sistem, maka project Roomify saat ini sudah memiliki:

- aplikasi frontend berbasis role `MAHASISWA` dan `ADMIN`
- backend API terstruktur dengan endpoint yang cukup lengkap untuk MVP
- autentikasi end-to-end berbasis access token dan refresh token cookie
- dashboard mahasiswa dan admin
- modul rooms untuk mahasiswa
- modul bookings untuk mahasiswa
- modul room management untuk admin
- modul booking review untuk admin
- activity log admin
- validasi form berbasis Zod di frontend
- validasi request berbasis schema di backend
- integration test backend per modul utama
- dokumentasi frontend dan backend yang cukup kaya

## 11. Kelebihan Struktur Project

Beberapa kekuatan project ini dari sisi arsitektur:

- frontend dan backend dipisah dengan tanggung jawab yang jelas
- frontend memakai pola komponen, hook, schema, dan store yang cukup sehat
- backend memakai pemisahan endpoint, service, repository, dan schema
- auth flow sudah disiapkan dengan refresh token
- envelope response backend konsisten
- dashboard, rooms, bookings, dan admin workflow sudah dipisah cukup baik
- ada folder dokumentasi yang cukup aktif untuk membantu implementasi
- backend sudah memiliki test integration untuk modul penting

## 12. Catatan Penting

Beberapa catatan penting untuk pembacaan project ini:

- Ringkasan ini dibuat berdasarkan kondisi source yang ada saat ini, bukan asumsi umum.
- Scope frontend sudah sangat maju, tetapi sebagian alur masih membutuhkan verifikasi runtime penuh terhadap backend nyata.
- Frontend sudah menunjukkan banyak implementasi nyata, bukan hanya mockup, tetapi masih ada ruang hardening pada area responsif, error handling, dan verifikasi end-to-end.
- Di dokumen frontend lama masih ada referensi `mahasiswa management` untuk admin, tetapi scope itu dapat dianggap tidak dikerjakan bila mengikuti keputusan implementasi terbaru.

## 13. Kesimpulan

Project Roomify saat ini sudah berbentuk **aplikasi full stack yang nyata dan cukup lengkap untuk MVP sistem peminjaman ruangan kampus**. Frontend menangani pengalaman pengguna, role-based navigation, dashboard, pencarian ruangan, alur booking, dan area admin. Backend menangani autentikasi, otorisasi, validasi, konflik jadwal, manajemen ruangan, approval booking, dashboard, dan activity log.

Secara keseluruhan, project ini sudah memiliki elemen penting aplikasi produksi:

- kontrol akses berbasis role,
- refresh session flow,
- modul bisnis inti mahasiswa dan admin,
- dashboard operasional,
- pengelolaan ruangan,
- approval workflow,
- audit trail,
- dan struktur kode yang cukup terorganisir.

Dokumen ini bisa dipakai sebagai dasar untuk:

- penjelasan project ke dosen atau tim,
- bahan presentasi,
- pengantar dokumentasi teknis,
- ringkasan arsitektur full stack,
- dan dasar penulisan laporan implementasi sistem.
