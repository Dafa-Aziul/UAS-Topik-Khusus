# Checklist Setup Frontend Roomify

## Tujuan

Dokumen ini menjadi checklist setup untuk mulai membangun frontend `Roomify` berdasarkan dokumen yang sudah ada pada repo ini:

- `documentation/PRD_FRONTEND_ROOMIFY.md`
- `documentation/API_DOCUMENTATION.md`
- `documentation/desain ui ux/roomify/DESIGN.md`

Checklist ini difokuskan pada kebutuhan implementasi frontend, bukan backend.

## Keterangan Status

- `[x]` sudah ada atau sudah terpasang di repo saat ini
- `[ ]` belum ada atau belum dikerjakan
- `[~]` perlu verifikasi manual di mesin lokal, browser, atau backend

Status pada dokumen ini disesuaikan dengan hasil scan workspace `roomify-frontend` per `16 Juli 2026`. Jadi dokumen ini bukan lagi checklist kosong, tetapi peta progres setup dan implementasi terbaru project.

## 1. Persiapan Environment

- [~] Sistem operasi siap untuk development frontend.
- [~] `Node.js` terpasang, disarankan versi `20.x LTS`.
- [~] `npm` tersedia.
- [~] Editor kode siap digunakan, misalnya `VS Code`.
- [~] Browser untuk testing tersedia, disarankan `Chrome` atau `Microsoft Edge`.
- [x] Git tersedia karena repo ini sudah memakai `.git`.

## 2. Pastikan Backend Tersedia

- [~] Backend Roomify berjalan di `http://localhost:8000`.
- [~] Endpoint root backend bisa diakses.
- [~] Endpoint health backend bisa diakses.
- [~] CORS backend mengizinkan origin frontend.
- [~] Cookie `refresh_token` dari backend bisa diterima browser saat login.

Endpoint minimum yang sebaiknya dicek:

- [~] `GET /`
- [~] `GET /health`
- [~] `POST /auth/login`
- [~] `POST /auth/refresh`
- [~] `GET /auth/me`

## 3. Inisialisasi Project Frontend

- [x] Project sudah dibuat menggunakan `Next.js` dengan `App Router`.
- [x] `TypeScript` sudah aktif.
- [x] Struktur dasar project frontend sudah aktif.
- [x] Gunakan folder terpisah untuk `app`, `components`, `lib`, `hooks`, `store`, `types`, dan `schemas`.

Contoh perintah awal:

```bash
npx create-next-app@latest roomify-frontend
```

Pilihan yang direkomendasikan saat inisialisasi:

- [x] `TypeScript`
- [x] `ESLint`
- [x] `App Router`
- [ ] `src/` optional, sesuaikan preferensi tim
- [x] `Tailwind CSS`

## 4. Install Dependency Inti

- [x] Install `axios`
- [x] Install `@tanstack/react-query`
- [x] Install `zustand`
- [x] Install `react-hook-form`
- [x] Install `zod`
- [x] Install `@hookform/resolvers`
- [x] Install `sonner`
- [x] Install `recharts`
- [x] Install `clsx`
- [x] Install `tailwind-merge`
- [x] Install util pendukung shadcn/ui bila diperlukan

Contoh:

```bash
npm install axios @tanstack/react-query zustand react-hook-form zod @hookform/resolvers sonner recharts clsx tailwind-merge
```

## 5. Setup shadcn/ui dan Styling

- [x] Inisialisasi `shadcn/ui`.
- [x] Pastikan `Tailwind CSS` aktif.
- [x] Buat token warna dasar awal untuk app starter.
- [x] Siapkan komponen dasar seperti `button`, `input`, `card`, `dialog`, `badge`, `table`, dan `toast`.
- [x] Samakan warna status seperti `pending`, `approved`, `rejected`, `completed`, dan `available`.

Contoh langkah awal:

```bash
npx shadcn@latest init
```

## 6. Setup Environment Variable Frontend

- [x] Buat file `.env.local`.
- [x] Buat file `.env.example`.
- [x] Simpan base URL backend pada env example.
- [x] Pastikan `.env.local` tidak di-commit.

Isi minimum `.env.local`:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Isi minimum `.env.example`:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## 7. Setup HTTP Client

- [x] Buat satu instance Axios global.
- [x] Ambil `baseURL` dari `NEXT_PUBLIC_API_BASE_URL`.
- [x] Aktifkan `withCredentials` untuk kebutuhan refresh token berbasis cookie.
- [x] Tambahkan request interceptor untuk access token.
- [x] Tambahkan response interceptor untuk penanganan refresh token jika access token kedaluwarsa.
- [x] Hindari membuat banyak instance Axios tanpa alasan yang jelas.

Checklist file yang disarankan:

- [x] `lib/axios.ts`
- [ ] `lib/api.ts` jika ingin pemisahan wrapper request

## 8. Setup State Management

- [x] Gunakan `Zustand` hanya untuk auth state.
- [x] Jangan simpan server state besar di Zustand.
- [x] Gunakan `React Query` untuk data dari backend.
- [x] Siapkan reset auth state saat logout.
- [x] Bersihkan cache sensitif saat sesi berakhir.

Struktur minimum yang disarankan:

- [x] `store/auth-store.ts`
- [x] `providers/query-provider.tsx`

## 9. Setup Auth Flow

- [x] Implementasi `POST /auth/login`
- [x] Siapkan penyimpanan `access_token` ke auth store
- [x] Implementasi `GET /auth/me`
- [x] Implementasi `POST /auth/refresh`
- [x] Implementasi `POST /auth/logout`
- [x] Tangani kondisi token habis
- [x] Tangani kondisi refresh token tidak valid
- [x] Buat guest guard
- [x] Buat auth guard
- [x] Buat role guard untuk `MAHASISWA` dan `ADMIN`

Skenario uji minimum:

- [~] Login berhasil
- [~] Refresh halaman tetap menjaga sesi
- [ ] Access token kedaluwarsa dapat diperbarui
- [x] Logout menghapus state sesi
- [x] User mahasiswa tidak bisa masuk route admin
- [~] User admin tidak diarahkan ke halaman mahasiswa

## 10. Setup Routing Awal

Route minimum yang sebaiknya disiapkan terlebih dahulu:

- [x] `/login`
- [x] `/register`
- [x] `/mahasiswa/dashboard`
- [x] `/mahasiswa/rooms`
- [x] `/mahasiswa/bookings`
- [x] `/mahasiswa/profile`
- [x] `/admin/dashboard`
- [x] `/admin/rooms`
- [x] `/admin/bookings`
- [ ] `/admin/students`
- [x] `/admin/activity-logs`

## 11. Setup Modul dan Folder Kerja

Struktur awal yang direkomendasikan untuk repo ini:

```text
app/
components/
features/
hooks/
lib/
providers/
schemas/
store/
types/
constants/
```

Checklist implementasi struktur:

- [x] Mulai pisahkan komponen umum dan komponen per fitur
- [x] Pisahkan schema validasi dari komponen form
- [x] Pisahkan tipe domain awal dari komponen UI murni
- [ ] Gunakan `features` bila ingin organisasi berbasis modul

## 12. Modul yang Perlu Diprioritaskan

Urutan implementasi yang disarankan:

- [x] Auth
- [x] Layout dan navigation berdasarkan role
- [x] Daftar ruangan mahasiswa
- [x] Detail ruangan
- [x] Form peminjaman
- [x] Riwayat peminjaman mahasiswa
- [x] Dashboard admin
- [x] Manajemen ruangan admin
- [x] Daftar permohonan admin
- [x] Detail keputusan permohonan admin
- [x] Log aktivitas

## 13. Komponen UI Minimum

- [x] App shell starter
- [x] Sidebar atau navigation role-based
- [x] Header
- [x] Search input
- [x] Filter bar
- [x] Table
- [x] Card
- [x] Badge status
- [x] Dialog konfirmasi
- [~] Form field wrapper
- [x] Pagination
- [x] Empty state
- [x] Loading state
- [x] Error state
- [x] Toast

## 14. Validasi dan Form

- [x] Semua form utama memakai `React Hook Form`
- [x] Semua validasi utama memakai `Zod`
- [x] Login form punya validasi email dan password
- [x] Register form punya validasi `name`, `nim`, `email`, dan `password`
- [x] Booking form punya validasi tanggal, jam mulai, jam selesai, tujuan, dan jumlah peserta
- [x] Change password form punya validasi password lama dan baru

## 15. Integrasi API yang Perlu Ada Sejak Awal

Mahasiswa:

- [x] `POST /auth/register`
- [x] `POST /auth/login`
- [x] `POST /auth/refresh`
- [x] `POST /auth/logout`
- [x] `GET /auth/me`
- [x] `PATCH /auth/change-password`
- [x] `GET /rooms`
- [x] `GET /rooms/{room_id}`
- [x] `GET /rooms/{room_id}/availability`
- [x] `POST /bookings`
- [x] `GET /bookings/me`
- [x] `GET /bookings/{booking_id}`
- [x] `PATCH /bookings/{booking_id}/cancel`

Admin:

- [x] `POST /admin/rooms`
- [x] `PATCH /admin/rooms/{room_id}`
- [x] `PATCH /admin/rooms/{room_id}/status`
- [x] `DELETE /admin/rooms/{room_id}`
- [x] `GET /admin/bookings`
- [x] `GET /admin/bookings/{booking_id}`
- [x] `PATCH /admin/bookings/{booking_id}/approve`
- [x] `PATCH /admin/bookings/{booking_id}/reject`
- [x] `PATCH /admin/bookings/{booking_id}/complete`
- [x] `GET /dashboards/admin`
- [x] `GET /dashboards/admin/booking-trend`
- [x] `GET /dashboards/admin/room-usage`
- [x] `GET /dashboards/me`
- [x] `GET /activity-logs`

## 16. Testing dan Debugging Minimum

- [~] Test login
- [~] Test refresh token flow
- [ ] Test protected route
- [~] Test role redirect
- [~] Test pencarian ruangan
- [~] Test pembuatan booking
- [~] Test pembatalan booking
- [~] Test approve atau reject booking
- [~] Test dashboard admin
- [~] Test log aktivitas

Hal yang wajib dicek saat debugging auth:

- [~] Access token tersimpan dengan benar
- [~] Request Bearer token terkirim
- [~] Cookie refresh benar-benar muncul di browser
- [ ] Backend mengizinkan credentials
- [ ] Origin frontend sesuai konfigurasi backend

## 17. Kebutuhan Nonfungsional yang Jangan Terlewat

- [x] Responsive untuk mobile dan desktop
- [x] Loading state tersedia
- [x] Empty state tersedia
- [x] Error state tersedia
- [x] Feedback sukses atau gagal tersedia
- [x] Struktur kode mudah dipelihara
- [x] Naming konsisten
- [x] TypeScript strict tetap aktif

## 18. Deliverable Minimum yang Sebaiknya Tercapai

- [x] Project `Next.js` berhasil dibuat
- [x] Dependency inti berhasil terpasang
- [~] Env frontend berhasil dibaca
- [x] Axios client siap dipakai
- [x] Query provider aktif
- [x] Auth store aktif
- [x] Login page aktif
- [x] Session bootstrap awal aktif
- [x] Dashboard mahasiswa aktif
- [x] Dashboard admin aktif
- [x] Modul rooms dan bookings mulai terhubung ke backend

## 18A. Snapshot Implementasi per 16 Juli 2026

- [x] Area mahasiswa sudah aktif: dashboard, list ruangan, detail ruangan, availability, form booking, list booking, detail booking, profile, dan change password.
- [x] Area admin sudah aktif: dashboard, manajemen ruangan, detail ruangan admin, create/edit room, daftar booking admin, detail booking admin, dan activity log.
- [x] Layout role-based dengan sidebar, mobile drawer, mobile bottom navigation, page header, dan app header sudah dipakai konsisten.
- [x] Hardening UI dasar mahasiswa dan admin sudah dilakukan untuk mobile, breadcrumb, dialog konfirmasi, empty state, loading state, dan error state.
- [~] Beberapa alur masih perlu verifikasi end-to-end terhadap backend nyata, terutama refresh token expiry, CORS cookie flow, dan approval flow admin.

## 19. Risiko yang Perlu Diantisipasi

- [ ] CORS backend belum mengizinkan frontend
- [ ] Cookie refresh tidak terset karena konfigurasi backend
- [ ] Frontend mengirim request ke base URL yang salah
- [ ] Struktur route frontend tidak konsisten dengan role
- [ ] State auth dan server state tercampur
- [ ] Endpoint backend berubah tetapi frontend belum ikut diperbarui

## 20. Rekomendasi Langkah Pengerjaan

Urutan kerja yang paling aman:

1. Verifikasi backend lokal, CORS, cookie refresh, dan expiry flow auth.
2. Pastikan seluruh halaman utama memakai payload backend final tanpa data mock tersisa.
3. Tambahkan pengujian manual atau otomatis untuk auth, booking mahasiswa, booking admin, dan activity log.
4. Rapikan dokumentasi sprint atau progress tracking agar sinkron dengan implementasi source.
5. Lanjut ke fitur lanjutan di luar MVP hanya jika seluruh flow inti sudah lolos verifikasi.

## 21. Kesimpulan

Frontend Roomify saat ini sudah melewati fase fondasi awal dan mayoritas modul MVP utama sudah tersedia di source. Fokus terbaik berikutnya bukan lagi setup project dari nol, tetapi memastikan integrasi backend nyata, pengujian end-to-end, dan sinkronisasi dokumentasi progres tetap rapi.

## 22. Ringkasan Status Saat Ini

Berdasarkan scan workspace pada `16 Juli 2026`, kondisi repo saat ini adalah:

- [x] Dokumentasi PRD, API, desain, dan checklist setup sudah tersedia
- [x] Bootstrap project `Next.js` dasar sudah tersedia
- [x] `TypeScript`, `ESLint`, `App Router`, dan `Tailwind CSS` sudah aktif
- [x] Dependency inti Roomify sudah dipasang
- [~] Struktur folder implementasi Roomify sudah mulai dibentuk, tetapi belum lengkap
- [~] Integrasi env, Axios, auth, dan state management sudah mulai dibuat, termasuk login, refresh, bootstrap sesi, dan guest guard
- [~] Halaman login, modul rooms, dan booking mahasiswa sudah aktif; dashboard masih belum sepenuhnya tersambung ke backend nyata
- [~] Kesiapan backend lokal masih perlu diverifikasi terpisah

## 23. Status Sprint FE 0

Target `Sprint FE 0 - Fondasi` pada PRD mencakup:

- inisialisasi `Next.js`
- `Tailwind CSS`
- `shadcn/ui`
- providers
- `QueryClient`
- Axios client
- Zustand auth store
- design token
- `AppShell`
- komponen `error`, `empty`, dan `loading`
- type API umum

Status berdasarkan scan `16 Juli 2026`:

- [x] Inisialisasi `Next.js`, `TypeScript`, `ESLint`, dan `App Router`
- [x] `Tailwind CSS` aktif
- [x] `shadcn/ui` sudah diinisialisasi
- [x] Provider aplikasi dan `QueryClient` sudah aktif
- [x] Axios global + refresh interceptor sudah aktif
- [x] Zustand auth store sudah aktif
- [x] Design token dasar sudah tersedia di `app/globals.css`
- [x] `AppShell` untuk protected area sudah aktif
- [x] Komponen reusable `EmptyState`, `ErrorState`, dan `LoadingSkeleton` sudah tersedia
- [x] Type API umum sudah ada dan sudah mengikuti envelope backend secara dasar
- [~] Fondasi struktur module `hooks`, `features`, dan reusable data layer masih bisa dirapikan lagi

Kesimpulan:

- `Sprint FE 0` pada dasarnya sudah selesai dan bisa dianggap `done`
- area yang tersisa sekarang lebih cocok masuk ke perapihan arsitektur lanjutan atau langsung ke `Sprint FE 1` dan `Sprint FE 2`

## 24. Status Sprint FE 2

Target `Sprint FE 2 - Rooms` pada PRD mencakup:

- room list mahasiswa
- search/filter/pagination
- room card
- room detail
- availability
- admin room list
- create/edit room
- status dan deactivate

Status berdasarkan scan `16 Juli 2026`:

- [x] Daftar ruangan mahasiswa sudah tersambung ke backend
- [x] Search, filter, sort, dan pagination dasar sudah aktif
- [x] Room card sudah memakai data backend dan gambar ruangan
- [x] Detail ruangan mahasiswa sudah aktif
- [x] Availability per tanggal sudah aktif
- [x] Daftar ruangan admin sudah aktif
- [x] Tambah dan edit ruangan admin sudah aktif
- [x] Ubah status ruangan sudah aktif
- [x] Nonaktifkan ruangan sudah aktif

Kesimpulan:

- `Sprint FE 2` sudah bisa dianggap `done`
- sisa pekerjaan setelah ini lebih cocok masuk ke polishing kecil atau sprint berikutnya

## 25. Status Sprint FE 3

Target `Sprint FE 3 - Bookings Mahasiswa` pada PRD mencakup:

- booking form
- date/time validation
- booking summary
- create
- conflict handling
- my booking list
- detail
- timeline
- cancel

Status berdasarkan scan `16 Juli 2026`:

- [x] Booking form sudah aktif
- [x] Validasi tanggal, jam, durasi, dan peserta sudah ada di frontend
- [x] Ringkasan booking di sidebar form sudah aktif
- [x] Create booking sudah tersambung ke backend
- [~] Conflict handling sudah mengikuti error backend umum, tetapi masih perlu verifikasi end-to-end dengan kasus konflik nyata
- [x] Halaman `Peminjaman Saya` sudah aktif
- [x] Detail booking mahasiswa sudah aktif
- [x] Timeline status booking sudah aktif
- [x] Cancel booking sudah tersambung ke backend

Kesimpulan:

- `Sprint FE 3` secara implementasi frontend inti sudah selesai
- yang tersisa adalah verifikasi end-to-end terhadap backend nyata, bukan gap fitur utama

## 26. Status Sprint FE 4

Target `Sprint FE 4 - Admin Booking` pada PRD mencakup:

- admin booking list
- status tabs
- filter
- detail
- approve
- reject
- complete
- stale-status handling

Status berdasarkan scan `16 Juli 2026`:

- [x] Halaman daftar booking admin sudah aktif
- [x] Status tabs admin booking sudah aktif
- [x] Filter status, `user_id`, `room_id`, rentang tanggal, dan pagination dasar sudah aktif
- [x] Halaman detail booking admin sudah aktif
- [x] Approve booking sudah tersambung ke backend
- [x] Reject booking sudah tersambung ke backend
- [x] Complete booking sudah tersambung ke backend
- [~] Stale-status handling masih mengandalkan refetch dan pesan error backend umum; masih bisa diperhalus lagi untuk kasus konflik waktu dan status yang berubah di sisi server

Kesimpulan:

- `Sprint FE 4` sudah sangat dekat ke `done`
- sisa pekerjaan utamanya ada di hardening UX terhadap kasus stale data dan verifikasi end-to-end dengan backend nyata
